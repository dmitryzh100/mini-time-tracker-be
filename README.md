# Mini Time Tracker - Backend

A REST API backend for tracking time entries across projects, built with NestJS, Prisma, and PostgreSQL.

## Tech Stack

- **Framework:** NestJS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **Authentication:** JWT (Access + Refresh tokens)
- **Documentation:** Swagger/OpenAPI
- **Code Quality:** ESLint, Prettier, Husky, lint-staged

## Features

- **Authentication**
  - JWT-based authentication with access and refresh tokens
  - User registration with email verification
  - Password reset via email
  - Per-user data isolation
- **Time Entries**
  - CRUD operations for time entries
  - Time entries grouped by date with daily totals and grand total
  - Maximum 24 hours per calendar date (per user)
- **Projects Management**
  - View available projects
- **Leave Management**
  - Sick leave requests (with required attachments)
  - Day off requests
  - File attachments stored as compressed base64
- Swagger API documentation
- Pre-commit hooks for code quality

## Prerequisites

- Node.js (v20.19+, v22.12+, or v24.0+)
- PostgreSQL database
- npm or yarn

## Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd mini-time-tracker-be
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env` and update with your PostgreSQL credentials:

```bash
cp .env.example .env
```

Then edit `.env` with your values:

```bash
# Application
HOST=localhost        # Optional, defaults to 'localhost'
PORT=3000             # Optional, defaults to 3000
FRONTEND_URL=http://localhost:5000  # Frontend URL for email links

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mini_time_tracker?schema=public"

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRATION=7d

# Email Configuration (for verification and password reset)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password
MAIL_FROM="Mini Time Tracker <noreply@minitimetracker.com>"

# Token Expiration
EMAIL_VERIFICATION_EXPIRATION_HOURS=24
PASSWORD_RESET_EXPIRATION_HOURS=1
```

### Gmail SMTP Setup

To use Gmail for sending emails (verification, password reset), follow these steps:

1. **Enable 2-Factor Authentication**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Under "Signing in to Google", enable "2-Step Verification"

2. **Generate an App Password**
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app and your device type
   - Click "Generate"
   - Copy the 16-character password (without spaces)

3. **Configure environment variables**

```bash
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx  # App Password from step 2
MAIL_FROM="Mini Time Tracker <your-email@gmail.com>"
```

> **Note:** Regular Gmail passwords won't work. You must use an App Password. If you don't see the App Passwords option, ensure 2-Factor Authentication is enabled first.

4. **Run database migrations**

```bash
npm run db:migrate
```

5. **Seed the database with projects**

```bash
npm run db:seed
```

## Running the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

Swagger documentation will be available at `http://localhost:3000/api`

## API Endpoints

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/sign-up` | Public | Register new user |
| POST | `/auth/sign-in` | Public | Login, returns tokens |
| POST | `/auth/refresh` | Refresh Token | Get new access token |
| POST | `/auth/sign-out` | JWT | Revoke all refresh tokens |
| POST | `/auth/forgot-password` | Public | Request password reset |
| POST | `/auth/reset-password` | Public | Reset password with token |
| POST | `/auth/verify-email` | Public | Verify email with token |
| POST | `/auth/resend-verification` | Public | Resend verification email |

### Projects

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/projects` | Public | Get all projects |
| GET | `/projects/:id` | Public | Get project by ID |

### Time Entries

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/time-entries` | Public | Get all entries grouped by date with totals |
| GET | `/time-entries/all` | Public | Get all entries (flat list) |
| GET | `/time-entries/:id` | Public | Get entry by ID |
| POST | `/time-entries` | JWT | Create new entry |
| PATCH | `/time-entries/:id` | JWT | Update entry (owner only) |
| DELETE | `/time-entries/:id` | JWT | Delete entry (owner only) |

### Leaves

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/leaves` | JWT | Get all leaves for current user |
| GET | `/leaves/:id` | JWT | Get specific leave |
| POST | `/leaves` | JWT | Create leave request |
| PATCH | `/leaves/:id` | JWT | Update leave request |
| DELETE | `/leaves/:id` | JWT | Delete leave request |
| POST | `/leaves/:id/attachments` | JWT | Add attachments to leave |
| GET | `/leaves/:id/attachments/:attachmentId` | JWT | Download attachment |
| DELETE | `/leaves/:id/attachments/:attachmentId` | JWT | Delete attachment |

### Request/Response Examples

**Register User**

```bash
POST /auth/sign-up
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Sign In**

```bash
POST /auth/sign-in
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isEmailVerified": true
  }
}
```

**Create Time Entry**

```bash
POST /time-entries
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "hours": 8,
  "description": "Implemented user authentication feature",
  "projectId": 1
}
```

**Get Grouped Entries Response**

```json
{
  "groupedEntries": [
    {
      "date": "2024-01-15",
      "totalHours": 8,
      "entries": [
        {
          "id": 1,
          "date": "2024-01-15",
          "hours": 8,
          "description": "Implemented user authentication feature",
          "projectId": 1,
          "project": {
            "id": 1,
            "name": "Viso Internal"
          }
        }
      ]
    }
  ],
  "grandTotal": 8
}
```

**Create Leave Request (Sick Leave with Attachment)**

```bash
POST /leaves
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

type: SICK_LEAVE
startDate: 2024-01-15
endDate: 2024-01-16
reason: Medical appointment
files: <file>
```

**Create Leave Request (Day Off)**

```bash
POST /leaves
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "type": "DAY_OFF",
  "startDate": "2024-01-20",
  "endDate": "2024-01-20",
  "reason": "Personal day"
}
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start the application |
| `npm run start:dev` | Start in development mode with hot reload |
| `npm run start:prod` | Start in production mode |
| `npm run build` | Build the application |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:migrate:prod` | Deploy migrations to production |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

This project uses the **Hybrid folder organization** pattern:

```
src/
├── common/                           # Shared utilities
│   ├── constants/                    # Shared constants (messages, validation, fields)
│   ├── interfaces/                   # Shared interfaces
│   └── pipes/
│       └── zod-validation.pipe.ts    # Zod validation pipe
├── config/                           # Configuration module
├── database/
│   └── prisma/
│       ├── prisma.module.ts          # Global Prisma module
│       └── prisma.service.ts         # Prisma service
├── modules/                          # Feature modules
│   ├── auth/                         # Authentication module
│   │   ├── constants/                # Auth-specific messages
│   │   ├── decorators/               # @Public, @CurrentUser decorators
│   │   ├── dto/                      # Auth DTOs (sign-in, sign-up, etc.)
│   │   ├── guards/                   # JWT guards
│   │   ├── interfaces/               # JWT payload interfaces
│   │   ├── strategies/               # Passport JWT strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── leaves/                       # Leave management module
│   │   ├── constants/                # Leave-specific constants
│   │   ├── dto/                      # Leave DTOs
│   │   ├── enums/                    # Leave field enums
│   │   ├── leaves.controller.ts
│   │   ├── leaves.module.ts
│   │   └── leaves.service.ts
│   ├── projects/
│   │   ├── constants/                # Project-specific constants
│   │   ├── enums/                    # Project field enums
│   │   ├── projects.controller.ts
│   │   ├── projects.module.ts
│   │   └── projects.service.ts
│   ├── time-entries/
│   │   ├── constants/                # Time entry-specific constants
│   │   ├── dto/
│   │   ├── enums/                    # Time entry field enums
│   │   ├── time-entries.controller.ts
│   │   ├── time-entries.module.ts
│   │   └── time-entries.service.ts
│   └── users/                        # Users module
│       ├── constants/                # User-specific constants
│       ├── enums/                    # User field enums
│       ├── users.module.ts
│       └── users.service.ts
├── services/
│   └── mail/                         # Email service
│       ├── mail.module.ts
│       └── mail.service.ts
├── app.module.ts
└── main.ts                           # Application entry point
prisma/
├── schema.prisma                     # Database schema
└── seed.ts                           # Seed data script
```

## Architecture

### Overview

The application follows a **modular monolith** architecture built on NestJS, organized into feature modules with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        HTTP Request                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Guards (JWT Auth)                        │
│              JwtAuthGuard / OptionalJwtAuthGuard             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Validation (Zod Pipe)                      │
│                    ZodValidationPipe                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Controllers                            │
│    AuthController, TimeEntriesController, LeavesController   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Services                              │
│      AuthService, TimeEntriesService, LeavesService          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Prisma ORM Layer                          │
│                      PrismaService                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL                              │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns

| Pattern | Implementation | Purpose |
|---------|---------------|---------|
| **Dependency Injection** | NestJS IoC Container | Loose coupling, testability |
| **Repository Pattern** | PrismaService | Database abstraction |
| **DTO Pattern** | Zod schemas + classes | Request validation, type safety |
| **Guard Pattern** | JwtAuthGuard, JwtRefreshGuard | Authentication/authorization |
| **Decorator Pattern** | @CurrentUser, @Public | Clean controller signatures |
| **Strategy Pattern** | Passport JWT strategies | Flexible authentication |
| **Module Pattern** | Feature modules | Encapsulation, lazy loading |

### Module Structure

Each feature module follows a consistent internal structure:

```
module/
├── constants/
│   ├── index.ts                 # Re-exports
│   ├── fields.constants.ts      # Field display names
│   ├── messages.constants.ts    # User-facing messages
│   └── validation.constants.ts  # Validation rules (min/max, lengths)
├── dto/                         # Data Transfer Objects (Swagger docs)
├── enums/                       # Field enums for type-safe constants access
├── interfaces/                  # TypeScript interfaces
├── schemas/                     # Zod validation schemas
├── [feature].controller.ts      # HTTP layer
├── [feature].service.ts         # Business logic
└── [feature].module.ts          # Module definition
```

### Constants Organization

The project uses a hierarchical constants system for maintainability:

```
common/constants/
├── validation.constants.ts    # Aggregates all module validation rules
├── fields.constants.ts        # Aggregates all module field names
└── messages.constants.ts      # Generic reusable messages

modules/[feature]/constants/
├── validation.constants.ts    # Module-specific validation rules
├── fields.constants.ts        # Module-specific field names
└── messages.constants.ts      # Module-specific messages (uses common)
```

**Usage in schemas:**
```typescript
const rules = Validation.timeEntry(TimeEntryField.Hours);
const field = FieldNames.timeEntry(TimeEntryField.Hours);

hours: z
  .number()
  .max(rules.max!, Messages.max(field, rules.max!))
```

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│ Sign Up  │────▶│  Email   │────▶│  Verify  │
└──────────┘     └──────────┘     │  Sent    │     │  Email   │
                                  └──────────┘     └──────────┘
                                                        │
┌──────────┐     ┌──────────┐     ┌──────────┐         │
│  Client  │────▶│ Sign In  │────▶│  Tokens  │◀────────┘
└──────────┘     └──────────┘     │ Returned │
                                  └──────────┘
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
               ┌─────────────┐                  ┌─────────────┐
               │   Access    │                  │   Refresh   │
               │   Token     │                  │   Token     │
               │  (15 min)   │                  │   (7 days)  │
               └─────────────┘                  └─────────────┘
                      │                                 │
                      ▼                                 ▼
               ┌─────────────┐                  ┌─────────────┐
               │  API Calls  │                  │  /refresh   │
               │  (Bearer)   │                  │  endpoint   │
               └─────────────┘                  └─────────────┘
```

### Validation Strategy

The application uses a two-layer validation approach:

1. **Zod Schemas** - Input validation with type inference
   - Defined in `schemas/` folder
   - Used via `ZodValidationPipe`
   - Validates request body, provides detailed error messages

2. **Service Layer** - Business rule validation
   - Database-dependent validations (e.g., daily hours limit)
   - Cross-entity validations (e.g., overlapping leaves)
   - Ownership checks

```typescript
// Schema validation (input)
export const createTimeEntrySchema = z.object({
  hours: z.number().positive().max(24),
  // ...
});

// Service validation (business logic)
async validateDailyHoursLimit(date: string, hours: number, userId: number) {
  const existing = await this.prisma.timeEntry.aggregate({...});
  if (existing + hours > MAX_DAILY_HOURS) {
    throw new BadRequestException(...);
  }
}
```

### Error Handling

All user-facing messages are centralized in constants:

```typescript
// Common messages (reusable)
Messages.notFound('Time entry', 1)  // "Time entry with ID 1 not found"
Messages.required('Email')          // "Email is required"

// Module-specific messages
TimeEntryMessages.dailyHoursLimitExceeded(8, 20, 4)
// "Cannot add 8 hours. Maximum 24 hours per day allowed..."
```

## Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key |
| email | String | User email (unique) |
| passwordHash | String | Hashed password |
| firstName | String? | First name |
| lastName | String? | Last name |
| isEmailVerified | Boolean | Email verification status |
| emailVerifiedAt | DateTime? | Verification timestamp |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Update timestamp |

### Projects Table

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key |
| name | String | Project name (unique) |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Update timestamp |

### Time Entries Table

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key |
| date | Date | Entry date |
| hours | Float | Hours worked |
| description | String | Work description |
| projectId | Int | Foreign key to projects |
| userId | Int? | Foreign key to users |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Update timestamp |

### Leaves Table

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key |
| type | LeaveType | SICK_LEAVE or DAY_OFF |
| startDate | Date | Start date |
| endDate | Date | End date |
| reason | String? | Reason for leave |
| userId | Int | Foreign key to users |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Update timestamp |

### Leave Attachments Table

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key |
| filename | String | Generated filename |
| originalName | String | Original file name |
| mimeType | String | File MIME type |
| size | Int | File size in bytes |
| data | Text | Compressed base64 data |
| leaveId | Int | Foreign key to leaves |
| createdAt | DateTime | Creation timestamp |

## Seeded Projects

The following projects are seeded by default:

- Viso Internal
- Client A
- Client B
- Personal Development

## License

This project is unlicensed.
