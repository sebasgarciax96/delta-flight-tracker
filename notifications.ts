import { db } from './db';
import { notifications } from './schema';
import { eq, and } from 'drizzle-orm';

export enum NotificationType {
  PRICE_DROP = 'price_drop',
  ECREDIT_SUCCESS = 'ecredit_success',
  SYSTEM = 'system'
}

export type NewNotification = {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
};

export type Notification = {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export async function createNotification(notificationData: NewNotification): Promise<Notification | null> {
  try {
    // Insert the notification
    const result = await db.insert(notifications).values({
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message
    }).returning();
    
    return result[0] || null;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

export async function getNotificationById(id: number): Promise<Notification | null> {
  try {
    const result = await db.select().from(notifications).where(eq(notifications.id, id));
    return result[0] || null;
  } catch (error) {
    console.error('Error getting notification by ID:', error);
    return null;
  }
}

export async function getNotificationsByUserId(userId: number, limit: number = 50, offset: number = 0): Promise<Notification[]> {
  try {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt, { direction: 'desc' })
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error('Error getting notifications by user ID:', error);
    return [];
  }
}

export async function getUnreadNotificationsByUserId(userId: number): Promise<Notification[]> {
  try {
    return await db.select().from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.read, false)
      ))
      .orderBy(notifications.createdAt, { direction: 'desc' });
  } catch (error) {
    console.error('Error getting unread notifications by user ID:', error);
    return [];
  }
}

export async function markNotificationAsRead(id: number): Promise<boolean> {
  try {
    const result = await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning({ id: notifications.id });
    
    return result.length > 0;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

export async function markAllNotificationsAsRead(userId: number): Promise<number> {
  try {
    const result = await db.update(notifications)
      .set({ read: true })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.read, false)
      ))
      .returning({ id: notifications.id });
    
    return result.length;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return 0;
  }
}

export async function createPriceDropNotification(
  userId: number,
  flightDetails: {
    airline: string;
    flightNumber: string;
    departureAirport: string;
    arrivalAirport: string;
    originalPrice: number;
    newPrice: number;
  }
): Promise<Notification | null> {
  const priceDifference = flightDetails.originalPrice - flightDetails.newPrice;
  
  return createNotification({
    userId,
    type: NotificationType.PRICE_DROP,
    title: `Price Drop: ${flightDetails.airline} ${flightDetails.flightNumber}`,
    message: `Good news! The price for your flight from ${flightDetails.departureAirport} to ${flightDetails.arrivalAirport} has dropped by $${priceDifference.toFixed(2)}. We're automatically requesting an ecredit for the difference.`
  });
}

export async function createEcreditSuccessNotification(
  userId: number,
  ecreditDetails: {
    airline: string;
    flightNumber: string;
    ecreditAmount: number;
    ecreditCode: string;
    ecreditExpirationDate?: string;
  }
): Promise<Notification | null> {
  let message = `Great news! We've successfully received an ecredit of $${ecreditDetails.ecreditAmount.toFixed(2)} for your ${ecreditDetails.airline} ${ecreditDetails.flightNumber} flight. Your ecredit code is ${ecreditDetails.ecreditCode}.`;
  
  if (ecreditDetails.ecreditExpirationDate) {
    message += ` This ecredit expires on ${ecreditDetails.ecreditExpirationDate}.`;
  }
  
  return createNotification({
    userId,
    type: NotificationType.ECREDIT_SUCCESS,
    title: `Ecredit Received: ${ecreditDetails.airline} ${ecreditDetails.flightNumber}`,
    message
  });
}
