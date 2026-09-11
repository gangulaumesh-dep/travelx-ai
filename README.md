# TRAVELX AI - Tourism Ecosystem Platform

**Discover Beyond the Map.**

A complete production-quality full-stack tourism ecosystem connecting tourists, local guides, tourism businesses, and tourism authorities.

## 🌍 Project Vision

TRAVELX AI solves the problem of:
- Scattered tourism information
- Difficulty discovering hidden destinations
- Trip-planning complexity
- Lack of trusted connections between tourists and local providers

### Core Differentiator
"DISCOVER BEYOND THE MAP" - Not just famous tourist spots, but hidden places, local experiences, heritage locations, and community-submitted destinations.

## 🎯 User Roles

1. **TOURIST** - Discover places, plan trips, submit discoveries
2. **LOCAL GUIDE** - Create profile, connect with travelers
3. **BUSINESS** - Promote tourism business, manage bookings
4. **TOURISM AUTHORITY/ADMIN** - Verify discoveries, manage platform

## ✨ Key Features

### Tourist Features
- 🗺️ Discover popular and hidden destinations
- 📸 Submit newly discovered places with photos
- 🤖 Generate personalized AI travel itineraries
- ✈️ Manage and save trips
- 👥 Connect with verified guides and businesses
- 🛡️ Access safety and tourism information

### Guide Features
- 👤 Create professional profile
- 📊 Showcase services and expertise
- 📞 Connect with tourists
- 💰 Receive bookings and reviews

### Business Features
- 🏢 Create business profile
- 📈 Showcase services with images
- 📞 Manage bookings
- ⭐ Build reputation

### Admin Features
- ✅ Verify community submissions
- 📊 Tourism analytics and insights
- 👥 User management
- 📈 Monitor platform activity

## 🏗️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18, TypeScript, Tailwind CSS, Redux |
| Backend | Node.js, Express.js, PostgreSQL |
| Authentication | JWT (JSON Web Tokens) |
| File Upload | Multer with local/cloud storage |
| Validation | Joi |
| HTTP Client | Axios |
| Routing | React Router v6 |

## 📁 Project Structure

```
travelx-ai/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Page components
│   │   ├── store/            # Redux state management
│   │   ├── services/         # API services
│   │   ├── types/            # TypeScript interfaces
│   │   ├── hooks/            # Custom React hooks
│   │   ├── styles/           # Global styles
│   │   └── App.tsx
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Database models
│   │   ├── middleware/       # Auth & validation
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Helper functions
│   │   ├── config/           # Configuration
│   │   └── server.ts
│   ├── migrations/           # Database migrations
│   ├── seeds/                # Demo data
│   └── package.json
│
├── database/
│   ├── schema.sql            # PostgreSQL schema
│   └── demo-data.sql         # Sample data
│
└── docs/
    ├── API.md                # API documentation
    ├── ARCHITECTURE.md       # System architecture
    └── SETUP.md              # Setup instructions
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure database connection in .env
npm run migrate
npm run seed
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Configure API endpoint in .env
npm start
```

## 📊 Database Design

### Core Tables
- **users** - Authentication and user management
- **tourist_profiles** - Tourist-specific information
- **guide_profiles** - Local guide profiles
- **business_profiles** - Tourism business profiles
- **places** - Tourism destinations
- **discoveries** - Community-submitted places
- **discovery_images** - Images for discoveries
- **discovery_verifications** - Admin verification status
- **trips** - User-created travel plans
- **trip_days** - Day-by-day itinerary details
- **bookings** - Guide/business bookings
- **reviews** - User reviews for guides/businesses

## 🔐 Authentication & Authorization

### Implementation
- JWT-based authentication
- Role-based access control (RBAC)
- Protected routes and endpoints
- Secure password handling
- Session management

### Protected Routes
- Tourist: Dashboard, Discover, Trip Planner, My Trips
- Guide: Profile, Bookings, Earnings
- Business: Profile, Services, Analytics
- Admin: Verification, Analytics, User Management

## 🤖 AI Trip Planner

### Architecture
- Structured prompt engineering for destination-aware planning
- Destination analysis (location, climate, attractions)
- Budget and interest-based customization
- Day-by-day activity suggestion

### Integration Ready
- OpenAI GPT API
- Claude API (Anthropic)
- Google Gemini API
- Fallback: Rule-based itinerary generator

### Input Parameters
- Destination
- Start Date & End Date
- Budget (with travel style)
- Number of Travelers
- Interests (Nature, Heritage, Adventure, Food, Culture, etc.)

### Output Structure
```json
{
  "destination": "Goa",
  "summary": "...",
  "estimatedBudget": 15000,
  "days": [
    {
      "day": 1,
      "date": "2024-12-01",
      "activities": [
        {
          "time": "Morning",
          "activity": "...",
          "description": "...",
          "estimatedCost": 500,
          "category": "Heritage"
        }
      ]
    }
  ]
}
```

## 📸 Image Upload & Storage

### Supported Features
- Multipart form-data upload
- File type validation (JPEG, PNG, WebP)
- File size limits (5MB per file)
- Image optimization
- Cloud storage ready (AWS S3, Cloudinary)
- Local fallback storage

### Discovery Image Upload
- Multiple images per discovery
- Image association with discovery records
- Thumbnail generation for listings

## 🎨 Design System

### Visual Identity
- **Brand Colors:** Tourism-inspired palette (Blues, Greens, Oranges)
- **Typography:** Modern, readable, consistent hierarchy
- **Components:** Reusable, well-organized, accessible
- **Spacing:** Consistent 8px grid system
- **Responsive:** Mobile-first approach

### Component Library
- Navbar & Sidebar
- Role Selection Cards
- Destination & Discovery Cards
- Guide & Business Cards
- Trip & Itinerary Cards
- Status Badges
- Search & Filter Bars
- Loading States
- Error States
- Empty States
- Modals & Toasts
- Charts & Statistics

## 📱 Responsive Design

Optimized for:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Laptop (1024px+)
- 🖥️ Desktop (1440px+)

Adaptive layouts:
- Hamburger navigation on mobile
- Collapsible sidebar on tablet
- Full navigation on desktop
- Touch-friendly buttons

## 🔄 Major API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/verify
```

### Discoveries
```
GET    /api/discoveries
POST   /api/discoveries
GET    /api/discoveries/:id
PATCH  /api/discoveries/:id/verify (Admin)
DELETE /api/discoveries/:id
```

### Trips
```
POST   /api/trips
GET    /api/trips
GET    /api/trips/:id
PATCH  /api/trips/:id
DELETE /api/trips/:id
POST   /api/trips/generate
GET    /api/trips/:id/regenerate
```

### Guides
```
GET    /api/guides
GET    /api/guides/:id
PATCH  /api/guides/me (Guide only)
POST   /api/guides/me/availability
```

### Businesses
```
GET    /api/businesses
GET    /api/businesses/:id
PATCH  /api/businesses/me (Business only)
```

### Admin
```
GET    /api/admin/stats
GET    /api/admin/discoveries/pending
PATCH  /api/admin/discoveries/:id/verify
GET    /api/admin/users
GET    /api/admin/tourism-analytics
```

## 📊 Workflow Flows

### Tourist Discovery Flow
1. Login → Tourist Dashboard
2. Explore discoveries or search
3. View destination details
4. Optionally: Found a new place?
5. Submit discovery with photo
6. Status: PENDING VERIFICATION
7. Admin reviews and approves/rejects
8. Approved: Visible to all tourists

### Trip Planning Flow
1. Click "Plan with AI"
2. Fill preferences (destination, dates, budget, interests)
3. Click "Generate My Trip"
4. AI generates personalized itinerary
5. View day-by-day activities with costs
6. Save, modify, or regenerate
7. Saved in "My Trips"

### Guide Booking Flow
1. Browse guides & businesses
2. View profiles and ratings
3. Click "Request Guide" or "Book Experience"
4. Send inquiry/booking request
5. Guide accepts/responds
6. Post-experience: Leave review

### Admin Verification Flow
1. Admin Dashboard → Discoveries
2. View pending submissions with photos
3. Review place details, location, images
4. Approve (VERIFIED) or Reject
5. Status updated in tourist feed

## 🛡️ Security Features

- Input validation (Joi schemas)
- SQL injection prevention (parameterized queries)
- XSS protection
- CORS configuration
- Rate limiting ready
- Secure password hashing (bcrypt)
- JWT token expiration
- Role-based authorization
- Environment variable management
- Secure file upload validation

## 📊 Demo Data

Includes realistic Indian tourism destinations:
- Araku Valley (Adventure, Nature)
- Visakhapatnam (Beach, Heritage)
- Hyderabad (Culture, Food)
- Hampi (Heritage, Ruins)
- Jaipur (Palace, Culture)
- Goa (Beach, Nightlife)
- Kerala (Backwaters, Nature)

Sample guides, businesses, and verified places included.

## ✅ Quality Assurance Checklist

- ✅ Authentication (Register, Login, Logout)
- ✅ Role selection and dashboard routing
- ✅ Tourist dashboard with hero and discovery cards
- ✅ Discovery listing with filters
- ✅ Discovery submission form
- ✅ Image upload functionality
- ✅ Admin verification workflow
- ✅ AI trip generation
- ✅ Trip management (save, edit, delete)
- ✅ Guide profile viewing
- ✅ Business profile viewing
- ✅ Admin analytics dashboard
- ✅ Navigation and routing
- ✅ Error handling and validation
- ✅ Database integration
- ✅ Responsive design
- ✅ Accessible components

## 🤝 Contributing

This project is developed for Smart India Hackathon 2026.

## 📄 License

MIT License

---

**Built with ❤️ for Tourism Innovation**

*Discover Beyond the Map.*
