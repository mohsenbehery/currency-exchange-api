import * as Sentry from '@sentry/node';

// Ensure to call this before importing any other modules!
Sentry.init({
  dsn: 'https://d042f68c7b71d7bc9072cfb7e6c0645b@o4507289032130560.ingest.de.sentry.io/4507294389829712',

  // Add Performance Monitoring by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});
