import { drizzle } from 'drizzle-orm/d1';
import { env } from '../env';

// Initialize the database
export const db = drizzle(env.DB);
