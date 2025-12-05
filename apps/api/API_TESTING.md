# PixelBoxx API - Testing Guide

## Setup Instructions

### 1. Install Dependencies
```bash
cd /Users/matt/Projects/pixelboxx/apps/api
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env` and update with your PostgreSQL credentials:
```bash
cp .env.example .env
```

Default `.env` contents:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pixelboxx?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 3. Set Up PostgreSQL Database

Make sure PostgreSQL is running, then create the database:
```bash
# Using psql
psql -U postgres -c "CREATE DATABASE pixelboxx;"

# Or using createdb
createdb -U postgres pixelboxx
```

### 4. Run Prisma Migrations
```bash
npx prisma migrate dev --name init
```

This will:
- Create the initial migration
- Apply it to the database
- Generate the Prisma Client

### 5. Start the Development Server
```bash
npm run start:dev
```

The API will be running at: `http://localhost:3001/api`

---

## API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### 1. Register a New User
**POST** `/auth/register`

Request Body:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "displayName": "Test User"
}
```

Response (200):
```json
{
  "user": {
    "id": "uuid-here",
    "username": "testuser",
    "email": "test@example.com",
    "displayName": "Test User",
    "avatarUrl": null,
    "role": "USER",
    "isVerified": false,
    "createdAt": "2025-12-04T...",
    "updatedAt": "2025-12-04T..."
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Validation Rules:
- `username`: 3-32 characters
- `email`: valid email format
- `password`: minimum 8 characters
- `displayName`: optional, max 64 characters

#### 2. Login
**POST** `/auth/login`

Request Body:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Response (200):
```json
{
  "user": {
    "id": "uuid-here",
    "username": "testuser",
    "email": "test@example.com",
    "displayName": "Test User",
    "avatarUrl": null,
    "role": "USER",
    "isVerified": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Error Response (401):
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

#### 3. Get Current User (Protected)
**GET** `/auth/me`

Headers:
```
Authorization: Bearer {accessToken}
```

Response (200):
```json
{
  "id": "uuid-here",
  "username": "testuser",
  "email": "test@example.com",
  "displayName": "Test User",
  "avatarUrl": null,
  "role": "USER",
  "isVerified": false,
  "createdAt": "2025-12-04T...",
  "updatedAt": "2025-12-04T..."
}
```

### User Endpoints

#### 4. Get User Profile (Protected)
**GET** `/users/me`

Headers:
```
Authorization: Bearer {accessToken}
```

Response (200):
```json
{
  "id": "uuid-here",
  "username": "testuser",
  "email": "test@example.com",
  "displayName": "Test User",
  "avatarUrl": null,
  "role": "USER",
  "isVerified": false,
  "createdAt": "2025-12-04T...",
  "updatedAt": "2025-12-04T..."
}
```

#### 5. Update User Profile (Protected)
**PATCH** `/users/me`

Headers:
```
Authorization: Bearer {accessToken}
```

Request Body:
```json
{
  "displayName": "Updated Name",
  "avatarUrl": "https://example.com/avatar.png"
}
```

Response (200):
```json
{
  "id": "uuid-here",
  "username": "testuser",
  "email": "test@example.com",
  "displayName": "Updated Name",
  "avatarUrl": "https://example.com/avatar.png",
  "role": "USER",
  "isVerified": false,
  "createdAt": "2025-12-04T...",
  "updatedAt": "2025-12-04T..."
}
```

---

## Testing the Complete Auth Flow

### Using cURL

#### 1. Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "displayName": "John Doe"
  }'
```

Save the `accessToken` from the response.

#### 2. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 3. Get Profile (Protected Route)
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

#### 4. Update Profile
```bash
curl -X PATCH http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "John Updated"
  }'
```

### Using HTTPie

#### 1. Register
```bash
http POST localhost:3001/api/auth/register \
  username=johndoe \
  email=john@example.com \
  password=password123 \
  displayName="John Doe"
```

#### 2. Login
```bash
http POST localhost:3001/api/auth/login \
  email=john@example.com \
  password=password123
```

#### 3. Get Profile
```bash
http GET localhost:3001/api/auth/me \
  Authorization:"Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman or Insomnia

1. Create a new request collection
2. Set the base URL to `http://localhost:3001/api`
3. Create requests for each endpoint listed above
4. For protected routes, add an Authorization header:
   - Type: Bearer Token
   - Token: {paste your accessToken}

---

## Database Inspection

### Using Prisma Studio
```bash
npm run prisma:studio
```

This opens a visual database browser at `http://localhost:5555`

### Using psql
```bash
psql -U postgres -d pixelboxx

# List all users
SELECT * FROM users;

# Check sessions
SELECT * FROM sessions;
```

---

## Common Issues & Solutions

### Issue: "Port 3001 is already in use"
**Solution:** Kill the process using the port or change PORT in `.env`
```bash
lsof -ti:3001 | xargs kill
```

### Issue: "Database does not exist"
**Solution:** Create the database
```bash
psql -U postgres -c "CREATE DATABASE pixelboxx;"
```

### Issue: "JWT_SECRET is not defined"
**Solution:** Make sure `.env` file exists and contains JWT_SECRET

### Issue: "Cannot connect to database"
**Solution:** Check if PostgreSQL is running
```bash
# macOS
brew services list | grep postgresql

# Start PostgreSQL
brew services start postgresql
```

---

## Project Structure

```
apps/api/
├── src/
│   ├── auth/
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── users/
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma
├── .env
├── .env.example
├── .gitignore
├── nest-cli.json
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

---

## Next Steps

After confirming the auth flow works:

1. Set up Redis for session management (WS1 requirement)
2. Set up NATS for real-time features (WS3)
3. Build PixelPages module (WS2)
4. Add file upload capabilities (WS1)
5. Implement rate limiting middleware (WS1)

---

## Development Commands

```bash
# Start development server with auto-reload
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Generate Prisma Client
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```
