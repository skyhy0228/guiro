import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { auth } from '../firebase/app';

let pendingAnonymousSignIn: Promise<User> | null = null;

export function watchAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function ensureAnonymousUser() {
  if (auth.currentUser) return auth.currentUser;
  if (!pendingAnonymousSignIn) {
    pendingAnonymousSignIn = signInAnonymously(auth)
      .then((credential) => credential.user)
      .finally(() => {
        pendingAnonymousSignIn = null;
      });
  }
  return pendingAnonymousSignIn;
}
