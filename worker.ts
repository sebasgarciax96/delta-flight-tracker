// This file contains the Cloudflare D1 database configuration for the Delta Flight Tracker

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // This is a placeholder for the main Worker fetch handler
    // The actual API routes are handled by Next.js API routes
    return new Response("Delta Flight Tracker API", { status: 200 });
  },
  
  // Scheduled tasks
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // Get the scheduled task name from the cron trigger
    const taskName = event.cron || 'unknown';
    
    console.log(`Running scheduled task: ${taskName}`);
    
    try {
      // Execute the appropriate task based on the cron trigger
      if (taskName === "0 */12 * * *") {
        // Runs every 12 hours - check prices
        await checkPrices(env);
      } else if (taskName === "0 */1 * * *") {
        // Runs every hour - process ecredit requests
        await processEcreditRequests(env);
      } else {
        console.log(`Unknown scheduled task: ${taskName}`);
      }
    } catch (error) {
      console.error(`Error executing scheduled task ${taskName}:`, error);
    }
  }
};

// Check prices for all active flights
async function checkPrices(env: Env): Promise<void> {
  try {
    // Get all active flights
    const flights = await getAllActiveFlights(env);
    
    console.log(`Checking prices for ${flights.length} active flights`);
    
    // Process each flight
    for (const flight of flights) {
      try {
        // Implementation would go here in a real deployment
        console.log(`Checking price for flight ${flight.id}: ${flight.airline} ${flight.flightNumber}`);
      } catch (error) {
        console.error(`Error checking price for flight ${flight.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error checking prices:', error);
    throw error;
  }
}

// Process pending ecredit requests
async function processEcreditRequests(env: Env): Promise<void> {
  try {
    // Get all pending ecredit requests
    const pendingRequests = await getPendingEcreditRequests(env);
    
    console.log(`Processing ${pendingRequests.length} pending ecredit requests`);
    
    // Process each request
    for (const request of pendingRequests) {
      try {
        // Implementation would go here in a real deployment
        console.log(`Processing ecredit request ${request.id} for flight ${request.flightId}`);
      } catch (error) {
        console.error(`Error processing ecredit request ${request.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error processing ecredit requests:', error);
    throw error;
  }
}

// Helper function to get all active flights
async function getAllActiveFlights(env: Env): Promise<any[]> {
  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM flights WHERE active = 1"
    ).all();
    
    return results;
  } catch (error) {
    console.error('Error getting active flights:', error);
    return [];
  }
}

// Helper function to get pending ecredit requests
async function getPendingEcreditRequests(env: Env): Promise<any[]> {
  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM ecredit_requests WHERE status = 'pending'"
    ).all();
    
    return results;
  } catch (error) {
    console.error('Error getting pending ecredit requests:', error);
    return [];
  }
}
