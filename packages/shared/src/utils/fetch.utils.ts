export const createTimeoutController = (timeout: number) => {
  const timeoutController = new AbortController();

  let timeoutId: any;

  return {
    /**
     * Timeout controller
     */
    signal: timeoutController.signal,

    /**
     * Start timer
     * @returns Timeout id
     */
    start: () => {
      timeoutId = setTimeout(() => timeoutController.abort('TIMEOUT'), timeout);
    },

    /**
     * Clear timeout
     */
    clear: () => {
      if (typeof timeoutId === 'undefined') {
        return;
      }

      clearTimeout(timeoutId);
    },
  };
};
