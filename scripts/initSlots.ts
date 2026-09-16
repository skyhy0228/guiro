import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const dates = ['2026-09-29', '2026-09-30'] as const;
const bookableTimes = [
  '13:00',
  '13:15',
  '13:30',
  '13:45',
  '14:00',
  '14:15',
  '14:30',
  '15:00',
  '15:15',
  '15:30',
  '15:45',
  '16:00',
  '16:15',
  '16:30',
  '16:45',
] as const;
const breakTimes = ['14:45'] as const;
const allTimes = [...bookableTimes, ...breakTimes].sort();
const breakTimeSet = new Set<string>(breakTimes);

function makeSlotId(date: string, time: string) {
  return `${date}_${time.replace(':', '-')}`;
}

if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT,
  });
}

const db = getFirestore();

async function main() {
  const batch = db.batch();
  let created = 0;
  let blocked = 0;

  for (const date of dates) {
    for (const time of allTimes) {
      const ref = db.collection('slots').doc(makeSlotId(date, time));
      const snap = await ref.get();
      const isBreakTime = breakTimeSet.has(time);

      if (snap.exists) {
        if (isBreakTime && snap.data()?.status !== 'reserved') {
          batch.set(
            ref,
            {
              status: 'blocked',
              bookingId: null,
              blockedReason: '브레이크타임',
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
          blocked += 1;
        }
        continue;
      }

      batch.set(ref, {
        date,
        time,
        status: isBreakTime ? 'blocked' : 'available',
        bookingId: null,
        blockedReason: isBreakTime ? '브레이크타임' : null,
        updatedAt: FieldValue.serverTimestamp(),
      });
      created += 1;
    }
  }

  batch.set(
    db.collection('settings').doc('reservation'),
    {
      status: 'OPEN',
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await batch.commit();
  console.log(`Initialized ${created} new slots and marked ${blocked} existing break-time slots as blocked.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
