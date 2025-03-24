// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ตรวจสอบว่ามีผู้ใช้ที่เป็น admin อยู่แล้วหรือไม่
  const adminExists = await prisma.user.findFirst({
    where: {
      email: 'dewwiisunny14@gmail.com',
    },
  });

  // ถ้ายังไม่มี ให้สร้างผู้ใช้ที่เป็น admin
  if (!adminExists) {
    const hashedPassword = await hash('admin123', 10);
    
    await prisma.user.create({
      data: {
        email: 'dewwiisunny14@gmail.com',
        displayName: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
        active: true,
      },
    });
    
    console.log('Created admin user: dewwiisunny14@gmail.com');
  } else {
    console.log('Admin user already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });