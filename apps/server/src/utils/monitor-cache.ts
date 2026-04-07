export type PendingQREntry = {
  chatId: string;
  activityId: string;
  params: any;
  expiresAt: number;
};

type MonitorPendingQRStoreOptions = {
  timeoutMs?: number;
  now?: () => number;
};

export class MonitorPendingQRStore {
  #timeoutMs: number;
  #now: () => number;
  #pendingByKey: Map<string, PendingQREntry>;
  #chatStacks: Map<string, string[]>;

  constructor(options: MonitorPendingQRStoreOptions = {}) {
    this.#timeoutMs = options.timeoutMs ?? 5 * 60 * 1000;
    this.#now = options.now ?? (() => Date.now());
    this.#pendingByKey = new Map();
    this.#chatStacks = new Map();
  }

  get size() {
    return this.#pendingByKey.size;
  }

  setPending(chatId: string, activityId: string, params: any) {
    const key = this.#buildKey(chatId, activityId);
    const stack = this.#chatStacks.get(chatId) ?? [];
    if (!stack.includes(key)) stack.push(key);

    this.#chatStacks.set(chatId, stack);
    this.#pendingByKey.set(key, {
      chatId,
      activityId,
      params,
      expiresAt: this.#now() + this.#timeoutMs,
    });
  }

  clearPending(chatId: string, activityId: string) {
    const key = this.#buildKey(chatId, activityId);
    this.#pendingByKey.delete(key);

    const stack = this.#chatStacks.get(chatId);
    if (!stack) return;

    const nextStack = stack.filter((item) => item !== key);
    if (nextStack.length === 0) this.#chatStacks.delete(chatId);
    else this.#chatStacks.set(chatId, nextStack);
  }

  consumeLatest(chatId: string): { entry?: PendingQREntry; expiredCount: number; } {
    const stack = this.#chatStacks.get(chatId);
    if (!stack || stack.length === 0) return { entry: undefined, expiredCount: 0 };

    let expiredCount = 0;
    while (stack.length > 0) {
      const key = stack.pop() as string;
      const entry = this.#pendingByKey.get(key);
      if (!entry) continue;

      this.#pendingByKey.delete(key);
      if (entry.expiresAt <= this.#now()) {
        expiredCount += 1;
        continue;
      }

      this.#cleanupStack(chatId, stack);
      return { entry, expiredCount };
    }

    this.#cleanupStack(chatId, stack);
    return { entry: undefined, expiredCount };
  }

  #cleanupStack(chatId: string, stack: string[]) {
    if (stack.length === 0) this.#chatStacks.delete(chatId);
    else this.#chatStacks.set(chatId, stack);
  }

  #buildKey(chatId: string, activityId: string) {
    return `${chatId}:${activityId}`;
  }
}
