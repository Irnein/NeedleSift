/**
 * A tiny promise limiter: at most `max` tasks run at once, the rest wait in
 * FIFO order. A finishing task hands its slot directly to the next waiter,
 * so the cap can never be exceeded, and a waiter whose AbortSignal fires
 * leaves the queue without ever starting.
 */
export function createLimiter(max: number) {
  let active = 0;
  const waiting: Array<() => void> = [];

  function release(): void {
    const next = waiting.shift();
    if (next) next();
    else active -= 1;
  }

  function acquire(signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) return Promise.reject(signal.reason);
    if (active < max) {
      active += 1;
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      const start = () => {
        signal?.removeEventListener("abort", onAbort);
        resolve();
      };
      const onAbort = () => {
        const index = waiting.indexOf(start);
        if (index >= 0) waiting.splice(index, 1);
        reject(signal?.reason);
      };
      waiting.push(start);
      signal?.addEventListener("abort", onAbort, { once: true });
    });
  }

  return async function run<T>(task: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    await acquire(signal);
    try {
      return await task();
    } finally {
      release();
    }
  };
}
