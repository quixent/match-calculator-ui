import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem, deleteItem } from '../utils/storage';
import { User } from '../types';
import { api } from '../api/client';

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ token: null, user: null, loading: true });

  useEffect(() => {
    (async () => {
      const token = await getItem('token');
      if (!token) {
        setState({ token: null, user: null, loading: false });
        return;
      }
      const res = await api.getMe();
      if (res.success && res.data?.user) {
        setState({ token, user: res.data.user, loading: false });
      } else {
        await deleteItem('token');
        setState({ token: null, user: null, loading: false });
      }
    })();
  }, []);

  const saveToken = useCallback(async (token: string, user: User) => {
    await setItem('token', token);
    setState({ token, user, loading: false });
  }, []);

  const logout = useCallback(async () => {
    await deleteItem('token');
    setState({ token: null, user: null, loading: false });
  }, []);

  return { ...state, saveToken, logout };
}
