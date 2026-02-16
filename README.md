# E-Learning Platform - Frontend

Learning Management System (LMS) frontend built with Next.js, TypeScript, and NextAuth.js. This application connects to multiple microservices for authentication, user management, class management, and assignments.

## 🏗️ Architecture

This is a **microservices-based** application with the following services:

- **Auth Service** (port 32769) - User authentication & authorization
- **Class Service** (port 32771) - Class management & enrollment
- **Assignment Service** (port 32773) - Assignment management

Frontend communicates with these services via REST APIs.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend services running (Auth, Class, Assignment)
- MySQL database for each service

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your backend URLs
# See Environment Variables section below

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_BASEPATH=/api/auth
AUTH_SECRET="your-secret-key-here"
NEXTAUTH_SECRET="your-secret-key-here"

# Backend API URLs
AUTH_API_URL=https://localhost:32769
ASSIGNMENT_API_URL=https://localhost:32773
CLASS_API_URL=https://localhost:32771

# Public API URLs (used by client-side code)
NEXT_PUBLIC_AUTH_API_URL=${AUTH_API_URL}
NEXT_PUBLIC_ASSIGNMENT_API_URL=${ASSIGNMENT_API_URL}
NEXT_PUBLIC_CLASS_API_URL=${CLASS_API_URL}
```

**Important Notes:**
- `AUTH_SECRET` is for NextAuth.js session encryption (frontend only)
- Backend services must use the **same JWT secret key** for token validation
- HTTPS is used for backend services (self-signed certificates in development)

## 👥 User Roles

The system supports three roles:

| Role | Code | Permissions |
|------|------|-------------|
| Admin | ADM | Full system access, user & class management |
| Teacher/Guru | TCR | Class management, view students |
| Student/Murid | STD | View & enroll in classes, submit assignments |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard pages
│   ├── user-management/   # User management (Admin only)
│   └── class-management/  # Class management (Admin/Teacher)
├── components/
│   └── ui/                # Reusable UI components
├── libs/
│   └── auth.ts           # NextAuth configuration
├── services/             # API service layers
│   ├── auth.service.ts
│   ├── user.service.ts
│   └── class.service.ts
├── types/                # TypeScript type definitions
└── view/                 # Page-level components
    ├── dashboard/
    ├── user-management/
    └── class-management/
```

## 🐛 Common Issues & Solutions

### 1. **CORS Error: "No 'Access-Control-Allow-Origin' header"**

**Cause:** Backend service not configured to allow requests from `localhost:3000`

**Solution:** 
- Check backend CORS configuration
- Ensure backend allows origin `http://localhost:3000`
- For .NET backends, verify `services.AddCors()` in `Program.cs`

### 2. **401 Unauthorized Error**

**Cause:** JWT token validation failed

**Solutions:**
- Verify all backend services use the **same JWT secret key**
- Check `appsettings.json` in each backend service
- Ensure `Jwt:Key`, `Jwt:Issuer`, and `Jwt:Audience` match across services

### 3. **Database Error: "Unknown database 'LMS_ClassDB'"**

**Cause:** Database not created for the service

**Solution:**
```sql
-- Connect to MySQL
CREATE DATABASE LMS_ClassDB;
CREATE DATABASE LMS_AuthDB;
CREATE DATABASE LMS_AssignmentDB;
```

### 4. **SSL Certificate Error**

**Cause:** Self-signed certificates in development

**Already handled:** `next.config.ts` sets `NODE_TLS_REJECT_UNAUTHORIZED='0'` in development

### 5. **Module Not Found: '@/components/ui/...'**

**Cause:** TypeScript path alias not resolved

**Solution:** Restart development server (`npm run dev`)

## 🔐 Authentication Flow

1. User logs in via `/` (login page)
2. Credentials sent to Auth Service (`/api/Auth/login`)
3. Auth Service returns JWT token
4. NextAuth stores token in session
5. Frontend includes token in all API requests: `Authorization: Bearer <token>`
6. Each backend service validates token using shared JWT secret

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📝 API Integration

Example of calling a backend service:

```typescript
import { classService } from '@/services/class.service'
import { useSession } from 'next-auth/react'

const { data: session } = useSession()

// Get all classes
const classes = await classService.getClasses(session.accessToken)

// Create a class
await classService.createClass({
  name: 'Mathematics 101',
  code: 'MATH101',
  description: 'Introduction to Mathematics',
  teacher_id: 1
}, session.accessToken)
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📚 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Authentication:** NextAuth.js
- **UI Components:** Radix UI
- **Styling:** Tailwind CSS
- **Form Handling:** React Hook Form + Zod
- **HTTP Client:** Fetch API

## 📞 Support

For issues or questions:
1. Check the "Common Issues" section above
2. Review backend service logs
3. Check browser console for detailed errors
4. Contact the development team

---

**Last Updated:** January 2026
