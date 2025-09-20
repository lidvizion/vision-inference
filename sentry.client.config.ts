import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of the transactions for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Set profilesSampleRate to 1.0 to profile every transaction
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture unhandled promise rejections and uncaught exceptions
  // These are enabled by default in Sentry
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Release version
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
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
      platform: 'web',
    };
    
    return event;
  },
  
  // Integrations
  integrations: [
    // Browser tracing and replay are enabled by default in Sentry Next.js
  ],
  
  // Performance monitoring
  beforeSendTransaction(event) {
    // Filter out health check transactions
    if (event.transaction?.includes('/health')) {
      return null;
    }
    return event;
  },
});
