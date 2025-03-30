import { drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';
import { 
  integer, 
  real, 
  sqliteTable, 
  text, 
  primaryKey 
} from 'drizzle-orm/sqlite-core';

// Define the database schema using Drizzle ORM

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phoneNumber: text('phone_number'),
  notificationPreference: text('notification_preference').default('email'),
  deltaUsername: text('delta_username'),
  deltaPasswordEncrypted: text('delta_password_encrypted'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Flights table
export const flights = sqliteTable('flights', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  airline: text('airline').notNull(),
  flightNumber: text('flight_number').notNull(),
  departureAirport: text('departure_airport').notNull(),
  arrivalAirport: text('arrival_airport').notNull(),
  departureDate: text('departure_date').notNull(),
  originalPrice: real('original_price').notNull(),
  confirmationCode: text('confirmation_code'),
  bookingDate: text('booking_date'),
  active: integer('active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Price history table
export const priceHistory = sqliteTable('price_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  flightId: integer('flight_id').notNull().references(() => flights.id),
  price: real('price').notNull(),
  timestamp: text('timestamp').default(sql`CURRENT_TIMESTAMP`)
});

// Ecredit requests table
export const ecreditRequests = sqliteTable('ecredit_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  flightId: integer('flight_id').notNull().references(() => flights.id),
  originalPrice: real('original_price').notNull(),
  newPrice: real('new_price').notNull(),
  priceDifference: real('price_difference').notNull(),
  status: text('status').notNull(),
  requestDate: text('request_date').default(sql`CURRENT_TIMESTAMP`),
  completionDate: text('completion_date'),
  ecreditAmount: real('ecredit_amount'),
  ecreditCode: text('ecredit_code'),
  ecreditExpirationDate: text('ecredit_expiration_date'),
  notes: text('notes')
});

// Notifications table
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  read: integer('read', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// Initialize database with D1
export function initDb(d1: D1Database) {
  return drizzle(d1);
}
