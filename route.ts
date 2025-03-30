import { NextResponse } from 'next/server';
import { getServerAuthUser } from '@/lib/auth/jwt';
import { FlightAPI } from '@/lib/flight-api/flight-api';
import { addPriceToHistory, getFlightsByUserId, getLatestPrice } from '@/lib/db/flights';
import { createEcreditRequest } from '@/lib/db/ecredit-requests';
import { createPriceDropNotification } from '@/lib/db/notifications';

// This function will be called by a scheduled task to check prices for all flights
export async function GET() {
  try {
    // In a real production environment, this endpoint would be protected
    // and only accessible by authenticated cron jobs or admin users
    
    // Get all active flights from the database
    const flights = await getAllActiveFlights();
    
    if (!flights || flights.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No active flights to check',
        checkedFlights: 0,
        priceDrops: 0
      });
    }
    
    // Initialize flight API client
    const flightAPI = new FlightAPI();
    
    // Track statistics
    let checkedFlights = 0;
    let priceDrops = 0;
    
    // Check each flight for price changes
    for (const flight of flights) {
      try {
        // Get current price from flight API
        const currentPrice = await flightAPI.getFlightPrice({
          airline: flight.airline,
          flightNumber: flight.flightNumber,
          departureAirport: flight.departureAirport,
          arrivalAirport: flight.arrivalAirport,
          departureDate: flight.departureDate
        });
        
        checkedFlights++;
        
        if (currentPrice) {
          // Add price to history
          await addPriceToHistory(flight.id, currentPrice);
          
          // Get the latest price before this update (original or previous check)
          const previousPrice = await getLatestPrice(flight.id);
          
          // Check if price dropped compared to original price
          if (currentPrice < flight.originalPrice) {
            priceDrops++;
            
            // Create ecredit request
            const ecreditRequest = await createEcreditRequest({
              flightId: flight.id,
              originalPrice: flight.originalPrice,
              newPrice: currentPrice
            });
            
            // Create notification for user
            if (ecreditRequest) {
              await createPriceDropNotification(
                flight.userId,
                {
                  airline: flight.airline,
                  flightNumber: flight.flightNumber,
                  departureAirport: flight.departureAirport,
                  arrivalAirport: flight.arrivalAirport,
                  originalPrice: flight.originalPrice,
                  newPrice: currentPrice
                }
              );
            }
          }
        }
      } catch (flightError) {
        console.error(`Error checking flight ${flight.id}:`, flightError);
        // Continue with next flight
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Price check completed',
      checkedFlights,
      priceDrops
    });
  } catch (error) {
    console.error('Error in price check:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check prices' },
      { status: 500 }
    );
  }
}

// Helper function to get all active flights from all users
async function getAllActiveFlights() {
  try {
    // In a real implementation, this would query the database directly
    // For now, we'll simulate by getting flights for each user
    
    // Get all user IDs (this is a simplified approach)
    const userIds = await getAllUserIds();
    
    let allFlights = [];
    
    // Get flights for each user
    for (const userId of userIds) {
      const userFlights = await getFlightsByUserId(userId, true); // true = active only
      allFlights = [...allFlights, ...userFlights];
    }
    
    return allFlights;
  } catch (error) {
    console.error('Error getting all active flights:', error);
    return [];
  }
}

// Helper function to get all user IDs
async function getAllUserIds() {
  // In a real implementation, this would query the database
  // For now, we'll return a hardcoded list for testing
  return [1, 2, 3]; // Example user IDs
}
