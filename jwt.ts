import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Secret key for JWT signing
// In production, use a proper secret management system
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_jwt_secret_key_change_in_production'
);

// JWT configuration
const JWT_EXPIRES_IN = '24h';
const COOKIE_NAME = 'delta-flight-tracker-auth';

export type JWTPayload = {
  userId: number;
  email: string;
};

/**
 * Sign a JWT token
 * @param payload Data to include in the token
 * @returns Signed JWT token
 */
export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

/**
 * Verify a JWT token
 * @param token JWT token to verify
 * @returns Payload if valid, null otherwise
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Set authentication cookie
 * @param response NextResponse object
 * @param token JWT token
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  });
}

/**
 * Clear authentication cookie
 * @param response NextResponse object
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0
  });
}

/**
 * Get authenticated user from request
 * @param request NextRequest object
 * @returns User payload if authenticated, null otherwise
 */
export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  
  return await verifyToken(token);
}

/**
 * Get authenticated user from server component
 * @returns User payload if authenticated, null otherwise
 */
export async function getServerAuthUser(): Promise<JWTPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  
  return await verifyToken(token);
}
