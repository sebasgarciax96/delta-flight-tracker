import { db } from './db';
import { flights, priceHistory } from './schema';
import { eq, and } from 'drizzle-orm';

export type NewFlight = {
  userId: number;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  originalPrice: number;
  confirmationCode?: string;
  bookingDate?: string;
};

export type Flight = {
  id: number;
  userId: number;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  originalPrice: number;
  confirmationCode?: string;
  bookingDate?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PriceHistoryEntry = {
  id: number;
  flightId: number;
  price: number;
  timestamp: string;
};

export async function createFlight(flightData: NewFlight): Promise<Flight | null> {
  try {
    // Insert the flight
    const result = await db.insert(flights).values({
      userId: flightData.userId,
      airline: flightData.airline,
      flightNumber: flightData.flightNumber,
      departureAirport: flightData.departureAirport,
      arrivalAirport: flightData.arrivalAirport,
      departureDate: flightData.departureDate,
      originalPrice: flightData.originalPrice,
      confirmationCode: flightData.confirmationCode,
      bookingDate: flightData.bookingDate
    }).returning();
    
    const newFlight = result[0];
    
    if (newFlight) {
      // Add the original price to price history
      await db.insert(priceHistory).values({
        flightId: newFlight.id,
        price: flightData.originalPrice
      });
    }
    
    return newFlight || null;
  } catch (error) {
    console.error('Error creating flight:', error);
    return null;
  }
}

export async function getFlightById(id: number): Promise<Flight | null> {
  try {
    const result = await db.select().from(flights).where(eq(flights.id, id));
    return result[0] || null;
  } catch (error) {
    console.error('Error getting flight by ID:', error);
    return null;
  }
}

export async function getFlightsByUserId(userId: number, activeOnly: boolean = true): Promise<Flight[]> {
  try {
    let query = db.select().from(flights).where(eq(flights.userId, userId));
    
    if (activeOnly) {
      query = query.where(eq(flights.active, true));
    }
    
    return await query;
  } catch (error) {
    console.error('Error getting flights by user ID:', error);
    return [];
  }
}

export async function updateFlight(id: number, flightData: Partial<NewFlight>): Promise<Flight | null> {
  try {
    // Prepare update data
    const updateData: any = {};
    
    if (flightData.airline !== undefined) updateData.airline = flightData.airline;
    if (flightData.flightNumber !== undefined) updateData.flightNumber = flightData.flightNumber;
    if (flightData.departureAirport !== undefined) updateData.departureAirport = flightData.departureAirport;
    if (flightData.arrivalAirport !== undefined) updateData.arrivalAirport = flightData.arrivalAirport;
    if (flightData.departureDate !== undefined) updateData.departureDate = flightData.departureDate;
    if (flightData.confirmationCode !== undefined) updateData.confirmationCode = flightData.confirmationCode;
    if (flightData.bookingDate !== undefined) updateData.bookingDate = flightData.bookingDate;
    
    // Handle price update
    if (flightData.originalPrice !== undefined) {
      updateData.originalPrice = flightData.originalPrice;
      
      // Add to price history
      await db.insert(priceHistory).values({
        flightId: id,
        price: flightData.originalPrice
      });
    }
    
    // Add updated timestamp
    updateData.updatedAt = new Date().toISOString();
    
    // Update the flight
    const result = await db.update(flights)
      .set(updateData)
      .where(eq(flights.id, id))
      .returning();
    
    return result[0] || null;
  } catch (error) {
    console.error('Error updating flight:', error);
    return null;
  }
}

export async function deactivateFlight(id: number): Promise<boolean> {
  try {
    const result = await db.update(flights)
      .set({ active: false, updatedAt: new Date().toISOString() })
      .where(eq(flights.id, id))
      .returning({ id: flights.id });
    
    return result.length > 0;
  } catch (error) {
    console.error('Error deactivating flight:', error);
    return false;
  }
}

export async function getPriceHistory(flightId: number): Promise<PriceHistoryEntry[]> {
  try {
    return await db.select().from(priceHistory).where(eq(priceHistory.flightId, flightId)).orderBy(priceHistory.timestamp);
  } catch (error) {
    console.error('Error getting price history:', error);
    return [];
  }
}

export async function addPriceToHistory(flightId: number, price: number): Promise<PriceHistoryEntry | null> {
  try {
    const result = await db.insert(priceHistory).values({
      flightId,
      price
    }).returning();
    
    return result[0] || null;
  } catch (error) {
    console.error('Error adding price to history:', error);
    return null;
  }
}

export async function getLatestPrice(flightId: number): Promise<number | null> {
  try {
    const result = await db.select({ price: priceHistory.price })
      .from(priceHistory)
      .where(eq(priceHistory.flightId, flightId))
      .orderBy(priceHistory.timestamp, { direction: 'desc' })
      .limit(1);
    
    return result[0]?.price || null;
  } catch (error) {
    console.error('Error getting latest price:', error);
    return null;
  }
}
