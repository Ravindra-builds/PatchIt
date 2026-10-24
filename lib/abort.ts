export interface TimeoutSignal {
  signal: AbortSignal;
  /** Stops the timer; call once the guarded work settles. */
  clear: () => void;
}

/**
 * Signal that aborts after `ms` or when `parent` aborts.
 *
 * Avoids `AbortSignal.any([..., AbortSignal.timeout(ms)])`: Node can garbage-collect
 * the timeout signal before it fires, so the combined signal silently never aborts.
 */
export function timeoutSignal(ms: number, parent?: AbortSignal): TimeoutSignal {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new DOMException('The operation timed out.', 'TimeoutError')),
    ms
  );
  const onParentAbort = () => controller.abort(parent?.reason);

  if (parent?.aborted) {
    onParentAbort();
  } else {
    parent?.addEventListener('abort', onParentAbort, { once: true });
  }

  return {
    signal: controller.signal,
    clear: () => {
      clearTimeout(timer);
      parent?.removeEventListener('abort', onParentAbort);
    },
  };
}
