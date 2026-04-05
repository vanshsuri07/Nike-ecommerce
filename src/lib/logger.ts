/**
 * Custom logger utility.
 * Use this wrapper for error logging instead of raw `console.error`.
 * It ensures logs are suppressed or handled gracefully in production.
 */

export const logger = {
  error: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(...args);
    }
    // In the future, this can be hooked up to Sentry, Datadog, etc.
  },
  
  // You can also add generic log wrappers here if needed for business logic
  // but most debug logs should be removed entirely.
};
