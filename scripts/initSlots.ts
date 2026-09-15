import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const dates = ['2026-09-29', '2026-09-30'] as const;
const times = [
  '13:00',
  '13:15',
  '13:30',
  '13:45',
  '14:00',
  '14:15',
  '14:30',
  '14:45',
  '15:00',
  '15:15',
  '15:30',
  '15:45',
  '16:00',
  '16:15',
  '16:30',
  '16:45',
] as const;

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

  for (const date of dates) {
    for (const time of times) {
      const ref = db.collection('slots').doc(makeSlotId(date, time));
      const snap = await ref.get();
      if (snap.exists) continue;
      batch.set(ref, {
        date,
        time,
        status: 'available',
        bookingId: null,
        blockedReason: null,
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
  console.log(`Initialized ${created} new slots. Existing slots were left unchanged.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
