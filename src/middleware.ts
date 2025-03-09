//quotation-system/src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ใช้ middleware เพื่อปรับแต่งค่า response header
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
  
  // สำหรับ requests อื่นๆ ปล่อยผ่านตามปกติ
  return NextResponse.next()
}

// ระบุ paths ที่จะใช้ middleware นี้
export const config = {
  matcher: '/api/company-profile/:path*',
}