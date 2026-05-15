import { createContext, useContext } from 'react';

interface BadgeCtxType {
  refreshBadge: () => void;
}

export const BadgeContext = createContext<BadgeCtxType>({ refreshBadge: () => {} });
export const useBadge = () => useContext(BadgeContext);
