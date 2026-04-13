# E-Learning Platform - Frontend

Sistem Learning Management System (LMS) berbasis Next.js, TypeScript, dan NextAuth.js. Frontend ini berkomunikasi dengan beberapa microservice untuk autentikasi, manajemen pengguna, kelas, tugas, dan ujian.

## Daftar Isi

- [Tech Stack](#tech-stack)
- [ Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Arsitektur](#arsitektur)
- [Struktur Proyek](#struktur-proyek)
- [Autentikasi](#autentikasi)
- [Peran Pengguna](#peran-pengguna)
- [Integrasi API](#integrasi-api)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Kontribusi](#kontribusi)

---

## Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| Bahasa | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI |
| State Management | TanStack Query (React Query) |
| Form Handling | React Hook Form + Zod |
| Autentikasi | NextAuth.js v4 |
| Charts | Recharts |
| HTTP Client | Fetch API |
| Validasi | Zod |
| Analytics | Vercel Analytics |
| Icons | Lucide React |

---

## Prasyarat

- **Node.js** 18+ (disarankan Node.js 20 LTS)
- **npm** atau **pnpm** atau **yarn**
- Backend services sudah berjalan (Auth, Class, Assignment, Exam)
- **MySQL** database untuk setiap backend service
- **Git** untuk version control

---

## Instalasi

### 1. Clone dan Install Dependencies

```bash
# Clone repository
git clone <repository-url>
cd elearn-fe

# Install dependencies
npm install
```

### 2. Setup Environment Variables

```bash
# Copy file environment
cp .env.example .env
```

Kemudian edit file `.env` sesuai konfigurasi backend. Lihat section [Konfigurasi](#konfigurasi) untuk detail.

### 3. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan tersedia di [http://localhost:3000](http://localhost:3000)

---

## Konfigurasi

Buat file `.env` di root directory dengan konfigurasi berikut:

```env
# =============================================================================
# NextAuth.js Configuration
# =============================================================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_BASEPATH=/api/auth

# Secret untuk encrypt session (generate dengan: openssl rand -base64 32)
AUTH_SECRET=your-auth-secret-key-min-32-characters
NEXTAUTH_SECRET=your-nextauth-secret-key

# =============================================================================
# Backend API URLs
# =============================================================================
# URL untuk backend services (sesuaikan dengan port backend kamu)
AUTH_API_URL=http://localhost:32769
ASSIGNMENT_API_URL=http://localhost:32773
CLASS_API_URL=http://localhost:32771
EXAM_API_URL=http://localhost:32775

# Public API URLs (diekspos ke client-side)
NEXT_PUBLIC_AUTH_API_URL=${AUTH_API_URL}
NEXT_PUBLIC_ASSIGNMENT_API_URL=${ASSIGNMENT_API_URL}
NEXT_PUBLIC_CLASS_API_URL=${CLASS_API_URL}
NEXT_PUBLIC_EXAM_API_URL=${EXAM_API_URL}
```

### Generate AUTH_SECRET

```bash
# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))


# macOS / Linux
openssl rand -base64 32
```

### Catatan Penting

- `AUTH_SECRET` digunakan untuk encrypt session NextAuth.js (frontend only)
- Semua backend services **harus menggunakan JWT secret yang sama** untuk validasi token
- Untuk development, backend menggunakan HTTP. Untuk production, gunakan HTTPS

---

## Arsitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
│                     http://localhost:3000                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST API / JWT Bearer Token
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Auth Service  │   │ Class Service │   │Assignment Svc  │
│  (Port 32769) │   │  (Port 32771) │   │  (Port 32773)  │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ LMS_AuthDB    │   │ LMS_ClassDB   │   │LMS_AssignDB   │
│   (MySQL)     │   │   (MySQL)     │   │   (MySQL)     │
└───────────────┘   └───────────────┘   └───────────────┘
```

### Backend Services

| Service | Port | Database | Fungsi |
|---------|------|----------|--------|
| Auth Service | 32769 | LMS_AuthDB | Autentikasi & Otorisasi pengguna |
| Class Service | 32771 | LMS_ClassDB | Manajemen kelas & enrollmen |
| Assignment Service | 32773 | LMS_AssignmentDB | Manajemen tugas |
| Exam Service | 32775 | LMS_ExamDB | Manajemen ujian |

---

## Struktur Proyek

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/               # Halaman autentikasi
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/          # Halaman setelah login
│   │   ├── dashboard/        # Dashboard utama
│   │   ├── class/            # Manajemen kelas
│   │   ├── assignment/       # Manajemen tugas
│   │   ├── exam/             # Manajemen ujian
│   │   └── user-management/  # Manajemen pengguna (Admin)
│   ├── api/                  # API routes
│   │   └── auth/             # NextAuth routes
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                   # Komponen UI reusable (Radix UI based)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   └── ...                   # Komponen fitur
├── hooks/                    # Custom React hooks
│   ├── useAuth.ts
│   └── useToast.ts
├── libs/
│   └── auth.ts              # Konfigurasi NextAuth
├── services/                # Service layer untuk API calls
│   ├── auth.service.ts
│   ├── class.service.ts
│   ├── assignment.service.ts
│   └── exam.service.ts
├── types/                   # TypeScript type definitions
│   ├── auth.types.ts
│   ├── class.types.ts
│   └── ...
└── utils/                   # Utility functions
    ├── cn.ts                # className merger (clsx + tailwind-merge)
    └── ...
```

---

## Autentikasi

### Alur Autentikasi

```
1. User mengakses halaman login (/)
2. User memasukkan credentials
3. Frontend mengirim request ke Auth Service: POST /api/Auth/login
4. Auth Service memvalidasi dan mengembalikan JWT token
5. NextAuth menyimpan token di session
6. Frontend menyertakan token di semua request API:
   Authorization: Bearer <jwt_token>
7. Setiap backend service memvalidasi token menggunakan JWT secret
```

### Session Data

Setelah login, session mengandung:

```typescript
interface Session {
  user: {
    id: number
    email: string
    name: string
    role: 'ADM' | 'TCR' | 'STD'
  }
  accessToken: string
  expires: string
}
```

### Proteksi Route

Gunakan Higher-Order Component atau middleware untuk melindungi route:

```typescript
// Contoh proteksi route dengan NextAuth
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function ProtectedPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <LoadingSpinner />
  }

  if (!session) {
    redirect('/login')
  }

  return <Dashboard />
}
```

---

## Peran Pengguna

| Peran | Kode | Akses |
|-------|------|-------|
| Admin | ADM | Full access: manajemen user, kelas, tugas, ujian |
| Guru | TCR | Manajemen kelas, lihat mahasiswa |
| Murid | STD | Lihat & enroll kelas, submit tugas |

### Contoh Cek Role

```typescript
import { useSession } from 'next-auth/react'

function AdminOnlyComponent() {
  const { data: session } = useSession()

  if (session?.user?.role !== 'ADM') {
    return null
  }

  return <AdminPanel />
}
```

---

## Integrasi API

### Contoh Penggunaan Service

```typescript
import { classService } from '@/services/class.service'
import { useSession } from 'next-auth/react'

// Di dalam React Component
export default function ClassList() {
  const { data: session } = useSession()

  // Fetch semua kelas
  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getClasses(session?.accessToken!),
    enabled: !!session?.accessToken
  })

  // Create kelas baru
  const createClass = async () => {
    await classService.createClass({
      name: 'Matematika Dasar',
      code: 'MTK101',
      description: 'Pengantar Matematika',
      teacherId: 1
    }, session?.accessToken!)
  }

  // ...
}
```

### Endpoint API Umum

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | /api/Auth/login | Login user |
| POST | /api/Auth/register | Registrasi user baru |
| GET | /api/Class | Get semua kelas |
| POST | /api/Class | Create kelas baru |
| GET | /api/Class/{id} | Get kelas by ID |
| PUT | /api/Class/{id} | Update kelas |
| DELETE | /api/Class/{id} | Delete kelas |
| GET | /api/Assignment | Get semua tugas |
| POST | /api/Assignment | Create tugas baru |
| GET | /api/Assignment/{id} | Get tugas by ID |
| PUT | /api/Assignment/{id} | Update tugas |
| POST | /api/Assignment/{id}/submit | Submit tugas |

---

## Deployment

### Build for Production

```bash
# Build aplikasi
npm run build

# Preview production build
npm run start
```

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables Production

Pastikan semua environment variables sudah di-set di Vercel dashboard atau via CLI:

```bash
vercel env add NEXTAUTH_URL
vercel env add AUTH_SECRET
vercel env add NEXT_PUBLIC_AUTH_API_URL
# ... dst
```

### Docker (Optional)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Troubleshooting

### 1. CORS Error

**Error:** `Access to fetch at 'http://localhost:32769' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Penyebab:** Backend tidak mengizinkan request dari `localhost:3000`

**Solusi:**
- Cek konfigurasi CORS di backend (.NET: `services.AddCors()`)
- Pastikan backend allow origin `http://localhost:3000`

### 2. 401 Unauthorized

**Error:** `401 Unauthorized` pada semua API calls

**Penyebab:** JWT token validation failed

**Solusi:**
- Pastikan semua backend services menggunakan **JWT secret yang sama**
- Cek `appsettings.json` di setiap backend service
- Pastikan `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience` match semua services

### 3. Database Connection Error

**Error:** `Unknown database 'LMS_ClassDB'`

**Solusi:**
```sql
CREATE DATABASE LMS_AuthDB;
CREATE DATABASE LMS_ClassDB;
CREATE DATABASE LMS_AssignmentDB;
CREATE DATABASE LMS_ExamDB;
```

### 4. SSL Certificate Error

**Error:** `unable to verify the first certificate`

**Solusi:** Untuk development, sudah handled di `next.config.ts` dengan `NODE_TLS_REJECT_UNAUTHORIZED='0'`. Untuk production, gunakan valid SSL certificates.

### 5. Module Not Found

**Error:** `Cannot find module '@/components/ui/...'`

**Solusi:** Restart development server
```bash
npm run dev
```

### 6. NextAuth Session Not Persisting

**Penyebab:** `NEXTAUTH_URL` atau `NEXTAUTH_BASEPATH` tidak正确

**Solusi:** Pastikan nilai di `.env` sesuai dengan dokumentasi di atas.

---

## Kontribusi

1. Buat feature branch dari `main`
   ```bash
   git checkout -b feature/fitur-baru
   ```

2. Implementasi dengan commit terstruktur
   ```bash
   git commit -m "feat: menambahkan fitur baru"
   ```

3. Push dan buat Pull Request
   ```bash
   git push origin feature/fitur-baru
   ```

### Commit Message Format

```
feat: fitur baru
fix: bug fix
docs: dokumentasi
style: formatting (tanpa logic change)
refactor: refactoring code
test: menambahkan test
chore: maintenance
```

---

## Lisensi

Private Project - All Rights Reserved

---

**Last Updated:** April 2026
