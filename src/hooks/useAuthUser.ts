import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { watchAuth } from '../services/authService';

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return watchAuth((nextUser) => {
      setUser(nextUser);
      setReady(true);
    });
  }, []);

  return { user, ready };
}
