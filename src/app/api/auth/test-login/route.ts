// src/app/api/auth/test-login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';

export async function GET() {
  const token = createToken({
    id: 'test-id',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'ADMIN'
  });

  const response = NextResponse.json({ token });
  
  response.cookies.set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  
  return response;
}