import { db } from './db';
import { ecreditRequests } from './schema';
import { eq, and } from 'drizzle-orm';

export enum RequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export type NewEcreditRequest = {
  flightId: number;
  originalPrice: number;
  newPrice: number;
};

export type EcreditRequest = {
  id: number;
  flightId: number;
  originalPrice: number;
  newPrice: number;
  priceDifference: number;
  status: string;
  requestDate: string;
  completionDate?: string;
  ecreditAmount?: number;
  ecreditCode?: string;
  ecreditExpirationDate?: string;
  notes?: string;
};

export async function createEcreditRequest(requestData: NewEcreditRequest): Promise<EcreditRequest | null> {
  try {
    const priceDifference = requestData.originalPrice - requestData.newPrice;
    
    // Only create request if there's a positive price difference
    if (priceDifference <= 0) {
      return null;
    }
    
    // Insert the ecredit request
    const result = await db.insert(ecreditRequests).values({
      flightId: requestData.flightId,
      originalPrice: requestData.originalPrice,
      newPrice: requestData.newPrice,
      priceDifference,
      status: RequestStatus.PENDING
    }).returning();
    
    return result[0] || null;
  } catch (error) {
    console.error('Error creating ecredit request:', error);
    return null;
  }
}

export async function getEcreditRequestById(id: number): Promise<EcreditRequest | null> {
  try {
    const result = await db.select().from(ecreditRequests).where(eq(ecreditRequests.id, id));
    return result[0] || null;
  } catch (error) {
    console.error('Error getting ecredit request by ID:', error);
    return null;
  }
}

export async function getEcreditRequestsByFlightId(flightId: number): Promise<EcreditRequest[]> {
  try {
    return await db.select().from(ecreditRequests)
      .where(eq(ecreditRequests.flightId, flightId))
      .orderBy(ecreditRequests.requestDate, { direction: 'desc' });
  } catch (error) {
    console.error('Error getting ecredit requests by flight ID:', error);
    return [];
  }
}

export async function getEcreditRequestsByUserId(userId: number): Promise<EcreditRequest[]> {
  try {
    // This requires a join with the flights table to get requests for a specific user
    const result = await db.execute(sql`
      SELECT er.* 
      FROM ecredit_requests er
      JOIN flights f ON er.flight_id = f.id
      WHERE f.user_id = ${userId}
      ORDER BY er.request_date DESC
    `);
    
    return result.rows as EcreditRequest[];
  } catch (error) {
    console.error('Error getting ecredit requests by user ID:', error);
    return [];
  }
}

export async function updateEcreditRequestStatus(
  id: number, 
  status: RequestStatus, 
  additionalData?: {
    completionDate?: string;
    ecreditAmount?: number;
    ecreditCode?: string;
    ecreditExpirationDate?: string;
    notes?: string;
  }
): Promise<EcreditRequest | null> {
  try {
    // Prepare update data
    const updateData: any = {
      status
    };
    
    // Add completion date if status is COMPLETED
    if (status === RequestStatus.COMPLETED) {
      updateData.completionDate = additionalData?.completionDate || new Date().toISOString();
    }
    
    // Add additional data if provided
    if (additionalData) {
      if (additionalData.ecreditAmount !== undefined) updateData.ecreditAmount = additionalData.ecreditAmount;
      if (additionalData.ecreditCode !== undefined) updateData.ecreditCode = additionalData.ecreditCode;
      if (additionalData.ecreditExpirationDate !== undefined) updateData.ecreditExpirationDate = additionalData.ecreditExpirationDate;
      if (additionalData.notes !== undefined) updateData.notes = additionalData.notes;
    }
    
    // Update the ecredit request
    const result = await db.update(ecreditRequests)
      .set(updateData)
      .where(eq(ecreditRequests.id, id))
      .returning();
    
    return result[0] || null;
  } catch (error) {
    console.error('Error updating ecredit request status:', error);
    return null;
  }
}

export async function getPendingEcreditRequests(): Promise<EcreditRequest[]> {
  try {
    return await db.select().from(ecreditRequests)
      .where(eq(ecreditRequests.status, RequestStatus.PENDING))
      .orderBy(ecreditRequests.requestDate);
  } catch (error) {
    console.error('Error getting pending ecredit requests:', error);
    return [];
  }
}
