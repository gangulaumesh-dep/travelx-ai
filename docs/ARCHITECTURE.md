# TRAVELX AI Architecture

## System Overview

TRAVELX AI is built as a modern full-stack web application with clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (React)                 │
│  - Tourist Dashboard & Discovery UI                 │
│  - Guide & Business Profiles                        │
│  - Trip Planner Interface                           │
│  - Admin Dashboard                                  │
│  - Authentication Flow                              │
└────────────────┬────────────────────────────────────┘
                 │ HTTPS / REST API
                 │
┌────────────────▼────────────────────────────────────┐
│                 API GATEWAY (Express)               │
│  - Route Management                                 │
│  - Authentication Middleware                        │
│  - Request Validation                               │
│  - Error Handling                                   │
│  - CORS Configuration                               │
└────────────────┬────────────────────────────────────┘
                 │
     ┌───────────┼───────────┐
     │           │           │
┌────▼─┐ ┌─────▼──┐ ┌──────▼─┐
│ Auth │ │Routes  │ │Services│
│ Flow │ │Handler │ │& Logic │
└────┬─┘ └────┬───┘ └───┬────┘
     │        │        │
┌────▼────────▼────────▼─────────────────┐
│        PostgreSQL Database             │
│  - Users & Authentication              │
│  - Discoveries & Places                │
│  - Trips & Itineraries                 │
│  - Guide & Business Profiles           │
│  - Bookings & Reviews                  │
│  - Notifications                       │
└────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **UI Components:** Custom + Lucide Icons
- **Notifications:** React Hot Toast

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer
- **Validation:** Joi
- **Security:** Helmet, CORS

## Authentication & Authorization

### Flow
1. User registers with email and password
2. Password hashed with bcryptjs
3. Upon login, JWT token issued
4. Token stored in localStorage (frontend)
5. Token sent with every API request
6. Backend validates token and role
7. Role-based access control applied

### Token Structure
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "tourist|guide|business|admin",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## Database Design

### Core Entities

#### Users (Base Table)
- Stores all user authentication data
- Role-based differentiation
- Profile image support
- Verification status

#### Role-Specific Profiles
- `tourist_profiles`: Travel preferences, interests
- `guide_profiles`: Expertise, languages, hourly rate
- `business_profiles`: Business details, category, services

#### Discoveries & Places
- `places`: Pre-populated tourism destinations
- `discoveries`: Community-submitted places (pending verification)
- `discovery_images`: Images associated with discoveries

#### Trips & Itineraries
- `trips`: User-created travel plans
- `trip_days`: Day-by-day itinerary activities

#### Bookings & Reviews
- `bookings`: Guide/business bookings
- `reviews`: User ratings and comments

## API Architecture

### Endpoint Organization
```
POST   /api/auth/register         - User registration
POST   /api/auth/login            - User login
POST   /api/auth/logout           - User logout
GET    /api/auth/verify           - Verify token

GET    /api/discoveries           - List discoveries
POST   /api/discoveries           - Submit discovery
GET    /api/discoveries/:id       - Get discovery details
PATCH  /api/discoveries/:id/verify - Verify discovery (Admin)

POST   /api/trips                 - Create trip
GET    /api/trips                 - List user trips
GET    /api/trips/:id             - Get trip details
PATCH  /api/trips/:id             - Update trip
DELETE /api/trips/:id             - Delete trip
POST   /api/trips/generate        - Generate with AI
GET    /api/trips/:id/regenerate  - Regenerate itinerary

GET    /api/guides                - List guides
GET    /api/guides/:id            - Get guide profile
PATCH  /api/guides/me             - Update own profile

GET    /api/businesses            - List businesses
GET    /api/businesses/:id        - Get business details
PATCH  /api/businesses/me         - Update own profile

GET    /api/admin/stats           - Platform statistics
GET    /api/admin/discoveries/pending - Pending discoveries
PATCH  /api/admin/discoveries/:id/verify - Verify/reject
GET    /api/admin/users           - Manage users
GET    /api/admin/analytics       - Tourism analytics
```

## Frontend Component Hierarchy

```
App
├── Router
│   ├── RoleSelection (/) - First screen
│   ├── Login (/login)
│   ├── Register (/register)
│   │
│   ├── TouristLayout
│   │   ├── Dashboard (/tourist)
│   │   ├── Discover (/discover)
│   │   ├── DiscoverNewPlace (/discover/new)
│   │   ├── TripPlanner (/planner)
│   │   ├── MyTrips (/my-trips)
│   │   ├── GuidesBusiness (/guides-business)
│   │   └── Safety (/safety)
│   │
│   ├── GuideLayout
│   │   ├── Dashboard (/guide)
│   │   ├── Profile (/guide/profile)
│   │   ├── Requests (/guide/requests)
│   │   ├── Bookings (/guide/bookings)
│   │   └── Earnings (/guide/earnings)
│   │
│   ├── BusinessLayout
│   │   ├── Dashboard (/business)
│   │   ├── Profile (/business/profile)
│   │   ├── Services (/business/services)
│   │   └── Analytics (/business/analytics)
│   │
│   └── AdminLayout
│       ├── Overview (/admin)
│       ├── Discoveries (/admin/discoveries)
│       ├── Verification (/admin/verification)
│       ├── Analytics (/admin/analytics)
│       ├── Users (/admin/users)
│       ├── Guides (/admin/guides)
│       └── Businesses (/admin/businesses)
```

## State Management (Redux)

### Store Structure
```
auth/
  - user (current user)
  - token (JWT token)
  - isAuthenticated
  - role
  - loading
  - error

discoveries/
  - items (list of discoveries)
  - filters (category, verification status)
  - sorting
  - currentDiscovery
  - loading
  - error

trips/
  - userTrips (array)
  - currentTrip (detailed view)
  - generatedItinerary
  - loading
  - error

ui/
  - notification (toast messages)
  - modals (modal states)
  - sidebar (navigation state)
```

## AI Trip Planner Integration

### Flow
1. User selects destination, dates, budget, interests
2. Frontend sends request to `/api/trips/generate`
3. Backend validates input
4. Backend calls AI API (Claude/GPT) with structured prompt
5. AI generates day-wise itinerary
6. Response saved to database
7. Frontend displays personalized trip

### Prompt Structure
```
Destination Analysis:
- Location: {destination}
- Country: India
- Number of Days: {days}
- Budget: {budget}
- Travel Style: {style}
- Interests: {interests}
- Travelers: {count}

Generate a day-by-day itinerary with:
- Morning activity
- Afternoon activity
- Evening activity
- Estimated costs
- Time recommendations
- Local experiences
```

## Image Upload & Storage

### Process
1. User selects image from device
2. Frontend validates (type, size)
3. Frontend sends as multipart/form-data
4. Backend receives with Multer
5. Backend validates again
6. Image saved to /uploads or cloud storage
7. URL stored in database
8. Frontend displays via CDN/local URL

### Storage Options
- **Development:** Local filesystem `/uploads`
- **Production:** AWS S3 / Cloudinary / Azure Blob Storage

## Security Implementation

### Frontend
- JWT token validation
- Protected routes with role checking
- Secure password input fields
- XSS prevention via React JSX
- CSRF protection via SameSite cookies

### Backend
- Input validation with Joi
- JWT signature verification
- Role-based middleware
- Password hashing with bcryptjs
- SQL parameterization (pg library)
- Helmet security headers
- CORS configuration
- Rate limiting (ready to implement)

## Error Handling

### Frontend
- API error responses caught
- User-friendly error messages
- Toast notifications
- Fallback UI states
- Network error handling

### Backend
- Try-catch in all routes
- Validation error responses
- Database error handling
- Structured error responses:
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Deployment Strategy

### Docker
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Configuration
- Development: .env.development
- Staging: .env.staging
- Production: .env.production (via secrets manager)

## Performance Considerations

1. **Database Indexing:** Indexes on frequently queried columns
2. **API Caching:** Discoveries and places cached client-side
3. **Pagination:** Large datasets paginated
4. **Image Optimization:** Thumbnails for discovery cards
5. **Code Splitting:** React lazy loading for routes
6. **Compression:** Gzip compression enabled
7. **CDN:** Static assets via CDN

## Monitoring & Logging

- Backend: Winston/Morgan for request logging
- Frontend: Error tracking (Sentry ready)
- Database: Query performance monitoring
- API: Request/response logging

## Scalability

1. **Database:** PostgreSQL with read replicas
2. **API:** Stateless Express servers (horizontal scaling)
3. **Frontend:** CDN for static assets
4. **Caching:** Redis for session management
5. **Message Queue:** Bull/RabbitMQ for async tasks
