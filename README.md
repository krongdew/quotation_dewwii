This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# ระบบออกใบเสนอราคา (Quotation System)

ระบบออกใบเสนอราคาสำหรับการพัฒนาระบบต่าง ๆ พัฒนาด้วย Next.js (App Router), PostgreSQL และ Ant Design

## คุณสมบัติหลัก

1. **จัดการข้อมูลลูกค้า**
   - ชื่อบริษัท
   - ที่อยู่บริษัท
   - เบอร์โทร
   - อีเมล
   - เลขประจำตัวผู้เสียภาษี
   - ชื่อผู้ติดต่อ

2. **จัดการใบเสนอราคา**
   - เลือกข้อมูลลูกค้า
   - กำหนดวันที่ออกใบเสนอราคา
   - กำหนดเลขที่ใบเสนอราคา
   - เพิ่มรายการสินค้า/บริการ
   - คำนวณยอดรวม ส่วนลด ภาษีมูลค่าเพิ่ม และหัก ณ ที่จ่าย
   - ลายเซ็นกำกับทั้งฝั่งผู้เสนอราคาและลูกค้า

3. **ส่งออกเป็นไฟล์ PDF**
   - พิมพ์หรือบันทึกใบเสนอราคาในรูปแบบ PDF

## การติดตั้ง

### ขั้นตอนที่ 1: Clone โปรเจค

```bash
git clone <repository-url>
cd quotation-system
```

### ขั้นตอนที่ 2: ติดตั้ง Dependencies

```bash
npm install
```

### ขั้นตอนที่ 3: ตั้งค่าฐานข้อมูล

1. ติดตั้ง PostgreSQL บนเครื่องของคุณหรือใช้บริการคลาวด์
2. สร้างฐานข้อมูลใหม่สำหรับโปรเจคนี้
3. คัดลอกไฟล์ `.env.example` เป็น `.env` และกำหนดค่า `DATABASE_URL` ให้ถูกต้อง

```bash
cp .env.example .env
```

### ขั้นตอนที่ 4: สร้างตารางในฐานข้อมูล

```bash
npm run migrate
npm run generate
```

### ขั้นตอนที่ 5: รันโปรเจคในโหมด Development

```bash
npm run dev
```

เปิดเบราว์เซอร์และเข้าถึง [http://localhost:3000](http://localhost:3000)

## การใช้งาน

1. **จัดการข้อมูลลูกค้า**
   - ไปที่เมนู "จัดการลูกค้า"
   - เพิ่ม แก้ไข หรือลบข้อมูลลูกค้า

2. **สร้างใบเสนอราคา**
   - ไปที่เมนู "ใบเสนอราคา"
   - คลิกปุ่ม "สร้างใบเสนอราคา"
   - เลือกลูกค้าจากรายการ
   - เพิ่มรายการสินค้า/บริการ
   - ระบุส่วนลดและภาษีหัก ณ ที่จ่าย (ถ้ามี)
   - เพิ่มลายเซ็น (ถ้าต้องการ)
   - บันทึกใบเสนอราคา

3. **พิมพ์หรือดาวน์โ# quotation_dewwii
