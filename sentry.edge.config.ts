import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of the transactions for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Release version
  release: process.env.APP_VERSION || '1.0.0',
  
  // Before send hook to filter sensitive data
  beforeSend(event, hint) {
    // Filter out non-error events in development
    if (process.env.NODE_ENV === 'development' && event.level !== 'error') {
      return null;
    }
    
    // Remove sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    
    // Add custom tags
    event.tags = {
      ...event.tags,
      component: 'edge-vision-sdk',
      platform: 'edge',
    };
    
    return event;
  },
});
