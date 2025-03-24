// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// ไม่ต้อง import jwt หรือใช้ jwt.verify ใน middleware

export function middleware(request: NextRequest) {
  // สำหรับ API routes ที่มีการอัพโหลดลายเซ็น
  if (request.nextUrl.pathname.startsWith('/api/company-profile/') && request.method === 'PUT') {
    // คัดลอก request และปรับแต่ง headers
    const requestHeaders = new Headers(request.headers)
    
    // เพิ่ม header เพื่อให้ Next.js รู้ว่าไม่ต้องจำกัดขนาดของ request body
    requestHeaders.set('x-middleware-next', '1')
    
    // สร้าง response ใหม่ที่มี headers ที่ปรับแต่งแล้ว
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  
  // ตรวจสอบการเข้าถึงหน้าที่ต้องล็อกอิน
  const publicPaths = ['/login', '/reset-password', '/api/auth/login', '/api/auth/reset-password'];
  
  // ตรวจสอบว่าเป็น public path หรือไม่
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(`${path}/`)
  );
  
  // ตรวจสอบว่ามี token หรือไม่ (ตรวจสอบแบบง่าย)
  const hasAuthToken = !!request.cookies.get('auth_token')?.value;
  
  // กรณีไม่ใช่ public path และไม่มี token ให้ redirect ไปที่หน้า login
  if (!isPublicPath && !hasAuthToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  
  // กรณีเป็น public path และมี token (ยกเว้น reset-password) ให้ redirect ไปที่หน้าหลัก
  if (isPublicPath && hasAuthToken && !request.nextUrl.pathname.includes('reset-password')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // สำหรับ requests อื่นๆ ปล่อยผ่านตามปกติ
  return NextResponse.next();
}

// ระบุ paths ที่จะใช้ middleware นี้
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}