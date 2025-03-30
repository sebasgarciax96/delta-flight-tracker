import { db } from './db';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '../auth/password';

export type NewUser = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  notificationPreference?: string;
  deltaUsername?: string;
  deltaPassword?: string;
};

export type User = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  notificationPreference: string;
  deltaUsername?: string;
  createdAt: string;
  updatedAt: string;
};

export async function createUser(userData: NewUser): Promise<User | null> {
  try {
    // Hash the password
    const passwordHash = await hashPassword(userData.password);
    
    // Encrypt Delta password if provided
    let deltaPasswordEncrypted = null;
    if (userData.deltaPassword) {
      // In a real app, use proper encryption
      deltaPasswordEncrypted = `encrypted_${userData.deltaPassword}`;
    }
    
    // Insert the user
    const result = await db.insert(users).values({
      email: userData.email,
      passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      notificationPreference: userData.notificationPreference || 'email',
      deltaUsername: userData.deltaUsername,
      deltaPasswordEncrypted
    }).returning({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phoneNumber: users.phoneNumber,
      notificationPreference: users.notificationPreference,
      deltaUsername: users.deltaUsername,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    });
    
    return result[0] || null;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phoneNumber: users.phoneNumber,
      notificationPreference: users.notificationPreference,
      deltaUsername: users.deltaUsername,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).where(eq(users.email, email));
    
    return result[0] || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const result = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phoneNumber: users.phoneNumber,
      notificationPreference: users.notificationPreference,
      deltaUsername: users.deltaUsername,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).where(eq(users.id, id));
    
    return result[0] || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

export async function updateUser(id: number, userData: Partial<NewUser>): Promise<User | null> {
  try {
    // Prepare update data
    const updateData: any = {};
    
    if (userData.firstName !== undefined) updateData.firstName = userData.firstName;
    if (userData.lastName !== undefined) updateData.lastName = userData.lastName;
    if (userData.phoneNumber !== undefined) updateData.phoneNumber = userData.phoneNumber;
    if (userData.notificationPreference !== undefined) updateData.notificationPreference = userData.notificationPreference;
    if (userData.deltaUsername !== undefined) updateData.deltaUsername = userData.deltaUsername;
    
    // Handle password update
    if (userData.password) {
      updateData.passwordHash = await hashPassword(userData.password);
    }
    
    // Handle Delta password update
    if (userData.deltaPassword) {
      // In a real app, use proper encryption
      updateData.deltaPasswordEncrypted = `encrypted_${userData.deltaPassword}`;
    }
    
    // Add updated timestamp
    updateData.updatedAt = new Date().toISOString();
    
    // Update the user
    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phoneNumber: users.phoneNumber,
        notificationPreference: users.notificationPreference,
        deltaUsername: users.deltaUsername,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      });
    
    return result[0] || null;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

export async function verifyUserCredentials(email: string, password: string): Promise<User | null> {
  try {
    // Get user with password hash
    const result = await db.select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      firstName: users.firstName,
      lastName: users.lastName,
      phoneNumber: users.phoneNumber,
      notificationPreference: users.notificationPreference,
      deltaUsername: users.deltaUsername,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).where(eq(users.email, email));
    
    const user = result[0];
    if (!user) return null;
    
    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) return null;
    
    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error verifying user credentials:', error);
    return null;
  }
}
