import axios from 'axios';

interface FlightDetails {
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
}

export class FlightAPI {
  private apiKey: string;
  private baseUrl: string;
  
  constructor() {
    // In a real implementation, these would be loaded from environment variables
    this.apiKey = process.env.FLIGHTLABS_API_KEY || 'demo_key';
    this.baseUrl = 'https://api.flightlabs.io';
  }
  
  /**
   * Get the current price for a flight
   * @param flightDetails Flight details to check
   * @returns Current price if available, null otherwise
   */
  async getFlightPrice(flightDetails: FlightDetails): Promise<number | null> {
    try {
      // First try the primary API
      const price = await this.getFlightPriceFromPrimaryAPI(flightDetails);
      if (price !== null) {
        return price;
      }
      
      // If primary API fails, try the backup API
      return await this.getFlightPriceFromBackupAPI(flightDetails);
    } catch (error) {
      console.error('Error getting flight price:', error);
      return null;
    }
  }
  
  /**
   * Get flight price from the primary API (FlightLabs)
   * @param flightDetails Flight details to check
   * @returns Current price if available, null otherwise
   */
  private async getFlightPriceFromPrimaryAPI(flightDetails: FlightDetails): Promise<number | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/prices`, {
        params: {
          api_key: this.apiKey,
          airline: flightDetails.airline,
          flight_number: flightDetails.flightNumber,
          departure: flightDetails.departureAirport,
          arrival: flightDetails.arrivalAirport,
          date: flightDetails.departureDate,
        },
        timeout: 5000, // 5 second timeout
      });
      
      if (response.data && response.data.success && response.data.data && response.data.data.price) {
        return parseFloat(response.data.data.price);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting flight price from primary API:', error);
      return null;
    }
  }
  
  /**
   * Get flight price from the backup API (SerpAPI Google Flights)
   * @param flightDetails Flight details to check
   * @returns Current price if available, null otherwise
   */
  private async getFlightPriceFromBackupAPI(flightDetails: FlightDetails): Promise<number | null> {
    try {
      // Format the date for the query (YYYY-MM-DD to MM/DD/YYYY)
      const dateParts = flightDetails.departureDate.split('-');
      const formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
      
      // Use SerpAPI to search Google Flights
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          api_key: process.env.SERPAPI_API_KEY || 'demo_key',
          engine: 'google_flights',
          departure_id: flightDetails.departureAirport,
          arrival_id: flightDetails.arrivalAirport,
          outbound_date: formattedDate,
          flight_class: 'economy',
          adults: 1,
          currency: 'USD',
        },
        timeout: 10000, // 10 second timeout
      });
      
      if (response.data && response.data.best_flights && response.data.best_flights.length > 0) {
        // Find the specific flight we're looking for
        const targetFlight = response.data.best_flights.find((flight: any) => {
          return flight.airline === flightDetails.airline && 
                 flight.flight_number === flightDetails.flightNumber;
        });
        
        if (targetFlight && targetFlight.price) {
          // Remove currency symbol and convert to number
          const priceString = targetFlight.price.replace(/[^0-9.]/g, '');
          return parseFloat(priceString);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting flight price from backup API:', error);
      return null;
    }
  }
  
  /**
   * Get flight details by confirmation code
   * @param airline Airline code (e.g., 'delta')
   * @param confirmationCode Booking confirmation code
   * @returns Flight details if available, null otherwise
   */
  async getFlightDetailsByConfirmation(airline: string, confirmationCode: string): Promise<FlightDetails | null> {
    try {
      // This is a placeholder for a real implementation
      // In reality, this would require integration with airline-specific APIs
      // or web scraping, which is beyond the scope of this demo
      
      // For demo purposes, return null to indicate this feature is not implemented
      console.log(`Getting flight details for ${airline} confirmation ${confirmationCode} (not implemented)`);
      return null;
    } catch (error) {
      console.error('Error getting flight details by confirmation:', error);
      return null;
    }
  }
  
  /**
   * Check if a flight exists
   * @param flightDetails Flight details to check
   * @returns True if the flight exists, false otherwise
   */
  async flightExists(flightDetails: FlightDetails): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/flight`, {
        params: {
          api_key: this.apiKey,
          airline: flightDetails.airline,
          flight_number: flightDetails.flightNumber,
          date: flightDetails.departureDate,
        },
        timeout: 5000, // 5 second timeout
      });
      
      return response.data && response.data.success && response.data.data && response.data.data.status !== 'not_found';
    } catch (error) {
      console.error('Error checking if flight exists:', error);
      return false;
    }
  }
}
