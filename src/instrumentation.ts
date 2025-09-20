export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize OpenTelemetry for Node.js runtime
    const { initializeTracing } = await import('./lib/tracing');
    initializeTracing();
  }
}
