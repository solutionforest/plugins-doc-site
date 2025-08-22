import { plugins } from "./plugins";
import { preWarmCache, startBackgroundRefresh } from "./cache";

// Pre-warm cache for the most popular/important plugins
const PRIORITY_PLUGINS = plugins.slice(0, 3); // First 3 plugins

export async function initializeCache() {
  if (process.env.NODE_ENV === 'production') {
    console.log('Initializing production cache...');
    
    // Pre-warm cache for priority plugins
    await preWarmCache(PRIORITY_PLUGINS);
    
    // Start background refresh process
    startBackgroundRefresh();
    
    console.log('Cache initialization completed');
  }
}

// Call this during app startup
if (typeof window === 'undefined') {
  // Only run on server side
  initializeCache().catch(console.error);
}
