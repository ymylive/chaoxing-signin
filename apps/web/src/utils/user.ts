export const createMonitorToken = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const normalizeStoredUser = (user: Partial<UserParamsType>): UserParamsType => {
  const normalizedUser = {
    ...user,
    monitorToken: user.monitorToken || createMonitorToken(),
  } as UserParamsType & { password?: string };

  delete normalizedUser.password;

  return normalizedUser;
};
