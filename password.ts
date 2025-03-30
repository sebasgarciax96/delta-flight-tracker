import { createHash, randomBytes } from 'crypto';
import { compare, hash } from 'bcrypt';

// Number of salt rounds for bcrypt
const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 * @param password Plain text password
 * @param hashedPassword Hashed password
 * @returns Whether the password matches the hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword);
}

/**
 * Generate a secure random token
 * @param length Length of the token in bytes (default: 32)
 * @returns Hex string token
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Hash a string using SHA-256
 * @param data Data to hash
 * @returns Hex string hash
 */
export function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Encrypt sensitive data (placeholder for actual encryption)
 * @param data Data to encrypt
 * @param key Encryption key
 * @returns Encrypted data
 */
export function encryptData(data: string, key: string): string {
  // In a real application, use a proper encryption library
  // This is just a placeholder
  return `encrypted_${data}`;
}

/**
 * Decrypt sensitive data (placeholder for actual decryption)
 * @param encryptedData Encrypted data
 * @param key Encryption key
 * @returns Decrypted data
 */
export function decryptData(encryptedData: string, key: string): string {
  // In a real application, use a proper encryption library
  // This is just a placeholder
  if (encryptedData.startsWith('encrypted_')) {
    return encryptedData.substring(10);
  }
  return encryptedData;
}
