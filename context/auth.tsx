import { createContext, useContext } from 'react';
import { User } from '../types';

interface AuthCtxType {
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthCtxType>({
  user: null,
  setToken: () => {},
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);
