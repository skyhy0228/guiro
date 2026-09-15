import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../firebase/app';
import { slotId } from '../config/event';
import type { Booking, BookingStatus, EventDate, PaymentStatus, ReservationSettings, Slot } from '../types/reservation';
import { calculateDeposit } from '../utils/format';
import { humanizeFirebaseError } from './bookingService';

export async function loginAdmin(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const adminSnap = await getDoc(doc(db, 'admins', credential.user.uid));
  if (!adminSnap.exists()) {
    await signOut(auth);
    throw new Error('관리자 권한이 없는 계정입니다.');
  }
  return credential.user;
}

export async function logoutAdmin() {
  await signOut(auth);
}

export async function isCurrentUserAdmin() {
  if (!auth.currentUser) return false;
  const adminSnap = await getDoc(doc(db, 'admins', auth.currentUser.uid));
  return adminSnap.exists();
}

export function watchAllBookings(callback: (bookings: Booking[]) => void, onError: (message: string) => void) {
  const bookingsQuery = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    bookingsQuery,
    (snapshot) => callback(snapshot.docs.map((bookingDoc) => bookingDoc.data() as Booking)),
    (error) => onError(humanizeFirebaseError(error)),
  );
}

export async function setReservationStatus(status: ReservationSettings['status']) {
  const uid = auth.currentUser?.uid;
  await setDoc(
    doc(db, 'settings', 'reservation'),
    { status, updatedAt: serverTimestamp(), updatedBy: uid || null },
    { merge: true },
  );
}

export async function confirmPayment(booking: Booking) {
  await updateAdminBooking(booking.accessKey, {
    paymentStatus: 'confirmed',
    bookingStatus: 'confirmed',
    modifiedAfterConfirmation: false,
  });
}

export async function undoPaymentConfirmation(booking: Booking) {
  await updateAdminBooking(booking.accessKey, {
    paymentStatus: 'unverified',
    bookingStatus: booking.bookingStatus === 'confirmed' ? 'submitted' : booking.bookingStatus,
    modifiedAfterConfirmation: false,
  });
}

async function updateAdminBooking(accessKey: string, changes: Partial<Pick<Booking, 'paymentStatus' | 'bookingStatus' | 'modifiedAfterConfirmation'>>) {
  await updateDoc(doc(db, 'bookings', accessKey), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}

export async function adminCancelBooking(booking: Booking) {
  const bookingRef = doc(db, 'bookings', booking.accessKey);
  const slotRef = doc(db, 'slots', booking.slotId);
  const lockRef = doc(db, 'representativeLocks', booking.phoneHash);

  await runTransaction(db, async (transaction) => {
    transaction.update(bookingRef, {
      bookingStatus: 'cancelled' satisfies BookingStatus,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    transaction.update(slotRef, {
      status: 'available',
      bookingId: null,
      blockedReason: null,
      updatedAt: serverTimestamp(),
    });
    transaction.delete(lockRef);
    writeAudit(transaction, 'admin_cancel_booking', booking.accessKey, booking, { bookingStatus: 'cancelled' });
  });
}

export async function adminMoveBooking(booking: Booking, nextDate: EventDate, nextTime: string, nextTeamSize: number) {
  const nextSlotId = slotId(nextDate, nextTime);
  const bookingRef = doc(db, 'bookings', booking.accessKey);
  const oldSlotRef = doc(db, 'slots', booking.slotId);
  const nextSlotRef = doc(db, 'slots', nextSlotId);

  await runTransaction(db, async (transaction) => {
    if (booking.slotId !== nextSlotId) {
      const nextSlotSnap = await transaction.get(nextSlotRef);
      if (!nextSlotSnap.exists()) throw new Error('예약 슬롯이 존재하지 않습니다.');
      const nextSlot = nextSlotSnap.data() as Slot;
      if (nextSlot.status !== 'available') throw new Error('선택한 시간은 이미 예약 또는 차단되었습니다.');
      transaction.update(nextSlotRef, {
        status: 'reserved',
        bookingId: booking.accessKey,
        blockedReason: null,
        updatedAt: serverTimestamp(),
      });
      transaction.update(oldSlotRef, {
        status: 'available',
        bookingId: null,
        blockedReason: null,
        updatedAt: serverTimestamp(),
      });
    }

    const after = {
      date: nextDate,
      time: nextTime,
      slotId: nextSlotId,
      teamSize: nextTeamSize,
      expectedDeposit: calculateDeposit(nextTeamSize),
      paymentStatus: 'needs_review' satisfies PaymentStatus,
      modifiedAfterConfirmation: booking.paymentStatus === 'confirmed',
    };

    transaction.update(bookingRef, {
      ...after,
      updatedAt: serverTimestamp(),
    });
    writeAudit(transaction, 'admin_move_booking', booking.accessKey, booking, after);
  });
}

export async function setSlotBlocked(slot: Slot, blocked: boolean, reason: string) {
  if (slot.status === 'reserved') throw new Error('이미 예약된 시간은 차단할 수 없습니다.');
  await updateDoc(doc(db, 'slots', slot.id), {
    status: blocked ? 'blocked' : 'available',
    blockedReason: blocked ? reason.trim() || '운영진 차단' : null,
    bookingId: null,
    updatedAt: serverTimestamp(),
  });
}

function writeAudit(
  transaction: Parameters<Parameters<typeof runTransaction>[1]>[0],
  action: string,
  bookingId: string,
  before: unknown,
  after: unknown,
) {
  const uid = auth.currentUser?.uid || 'unknown';
  const auditRef = doc(collection(db, 'auditLogs'));
  transaction.set(auditRef, {
    adminUid: uid,
    action,
    bookingId,
    before,
    after,
    timestamp: serverTimestamp(),
  });
}
