# TRAVELX AI - Setup Guide

## Prerequisites

- Node.js 18.x LTS or higher
- PostgreSQL 13 or higher
- npm or yarn package manager
- Git

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=travelx_ai
DB_USER=postgres
DB_PASSWORD=your_password

# Server
NODE_ENV=development
PORT=5000
SERVER_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=change_me_to_a_strong_secret_key
JWT_EXPIRE=7d
```

### 3. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE travelx_ai;
\q
```

#### Run Schema

```bash
# From backend directory
psql -U postgres -d travelx_ai -f ../database/schema.sql
```

#### Or use migration script (from `backend`)

```bash
npm run migrate
```

The migration command reads `database/schema.sql`. Then run `npm run seed` to create
the four demo accounts and a sample place. The API uses a rule-based itinerary
generator by default; no AI provider key is required to run the MVP.

Run the migration again after pulling schema changes such as `business_services`;
the migration script applies the complete schema to a fresh database.

The demo seed also adds Indian places, travel service examples, and Hyderabad
hospital contacts. Re-run `npm run migrate` and then `npm run seed` for a fresh
demo database after schema changes.

Discovery submissions accept up to five JPEG, PNG, or WebP images. In development
they are stored in `backend/uploads` and served by the API at `/uploads/...`.
Keep that directory on persistent storage in production.

### 4. Seed Demo Data

```bash
npm run seed
```

### 5. Start Backend Server

```bash
npm run dev
```

Server will start at `http://localhost:5000`

Test health: `http://localhost:5000/api/health`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
REACT_APP_APP_NAME=TRAVELX AI
```

### 3. Start Frontend Development Server

```bash
npm start
```

App will open at `http://localhost:3000`

## Quick Test Accounts

After seeding, you can use these accounts:

### Tourist
- Email: `tourist@example.com`
- Password: `password123`

### Guide
- Email: `guide@example.com`
- Password: `password123`

### Business
- Email: `business@example.com`
- Password: `password123`

### Admin
- Email: `admin@example.com`
- Password: `password123`

## Troubleshooting

### Database Connection Error

```
Error: getaddrinfo ENOTFOUND localhost
```

**Solution:**
- Ensure PostgreSQL is running
- Check DB credentials in .env
- Try `DB_HOST=127.0.0.1` instead of `localhost`

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
- Change PORT in .env
- Or kill process: `lsof -i :5000` then `kill -9 <PID>`

### CORS Error

**Solution:**
- Ensure FRONTEND_URL in backend .env matches frontend URL
- Check browser console for exact origin

### Frontend Cannot Connect to API

**Solution:**
- Ensure backend is running on port 5000
- Check REACT_APP_API_URL in .env
- Open http://localhost:5000/api/health to verify

## Project Workflow

### Day-to-Day Development

1. Start PostgreSQL
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm start`
4. Make changes
5. Test in browser

### Adding New Feature

1. Create database table/schema if needed
2. Create backend route handler
3. Add frontend component/page
4. Connect via API service
5. Test end-to-end

## Building for Production

### Backend Build

```bash
cd backend
npm run build
```

Output: `dist/` folder

### Frontend Build

```bash
cd frontend
npm run build
```

Output: `build/` folder

## Running with Docker

### Build Docker Image

```bash
docker build -t travelx-ai-backend ./backend
```

### Run Container

```bash
docker run -p 5000:5000 --env-file backend/.env travelx-ai-backend
```

## Environment Variable Reference

### Backend (.env)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| DB_HOST | string | localhost | PostgreSQL host |
| DB_PORT | number | 5432 | PostgreSQL port |
| DB_NAME | string | travelx_ai | Database name |
| DB_USER | string | postgres | Database user |
| DB_PASSWORD | string | - | Database password |
| NODE_ENV | string | development | Environment |
| PORT | number | 5000 | API server port |
| JWT_SECRET | string | - | JWT signing secret |
| JWT_EXPIRE | string | 7d | JWT expiration |
| FRONTEND_URL | string | http://localhost:3000 | Frontend URL |
| MAX_FILE_SIZE | number | 5242880 | Max upload size (bytes) |
| OPENAI_API_KEY | string | - | OpenAI API key (optional) |

### Frontend (.env)

| Variable | Type | Description |
|----------|------|-------------|
| REACT_APP_API_URL | string | Backend API URL |
| REACT_APP_GOOGLE_MAPS_API_KEY | string | Google Maps key (optional) |
| REACT_APP_APP_NAME | string | App name for branding |

## Next Steps

1. Explore the application at http://localhost:3000
2. Create an account as a tourist
3. Explore the Discover page
4. Try submitting a new discovery
5. Test the AI Trip Planner
6. Login as admin to verify submissions

For detailed feature documentation, see [API.md](./API.md)
