-- TRAVELX AI Database Schema
-- PostgreSQL 13+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (base table for all user types)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('tourist', 'guide', 'business', 'admin')),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(20),
  profile_image_url VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Tourist Profiles
CREATE TABLE tourist_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  interests VARCHAR(255)[], -- Array of interests
  total_trips INT DEFAULT 0,
  preferred_travel_style VARCHAR(50), -- budget, balanced, premium
  country VARCHAR(100),
  state VARCHAR(100),
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tourist_profiles_user_id ON tourist_profiles(user_id);

-- Guide Profiles
CREATE TABLE guide_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  expertise VARCHAR(255)[], -- Array of expertise areas
  languages VARCHAR(255)[], -- Array of languages
  years_experience INT DEFAULT 0,
  hourly_rate DECIMAL(10, 2),
  availability JSON, -- { "mon": true, "tue": true, ... }
  rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  verification_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guide_profiles_user_id ON guide_profiles(user_id);
CREATE INDEX idx_guide_profiles_verification_status ON guide_profiles(verification_status);

-- Business Profiles
CREATE TABLE business_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  category VARCHAR(100), -- hotel, restaurant, tour, adventure, etc.
  description TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  verification_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX idx_business_profiles_category ON business_profiles(category);
CREATE INDEX idx_business_profiles_verification_status ON business_profiles(verification_status);
CREATE INDEX idx_business_profiles_location ON business_profiles(city, state);

CREATE TABLE business_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2),
  duration_hours INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_business_services_business_id ON business_services(business_id);

-- Places (main tourism places/destinations)
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100), -- nature, heritage, adventure, culture, food, scenic, spiritual
  description TEXT,
  image_url VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_featured BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_places_category ON places(category);
CREATE INDEX idx_places_location ON places(city, state);
CREATE INDEX idx_places_featured ON places(is_featured);

-- Discoveries (community-submitted places)
CREATE TABLE discoveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  place_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verification_notes TEXT,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_discoveries_submitted_by ON discoveries(submitted_by);
CREATE INDEX idx_discoveries_status ON discoveries(status);
CREATE INDEX idx_discoveries_category ON discoveries(category);
CREATE INDEX idx_discoveries_verified_by ON discoveries(verified_by);

-- Discovery Images
CREATE TABLE discovery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discovery_id UUID NOT NULL REFERENCES discoveries(id) ON DELETE CASCADE,
  image_url VARCHAR(255) NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_discovery_images_discovery_id ON discovery_images(discovery_id);

-- Trips (user-created travel plans)
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tourist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(12, 2),
  travel_style VARCHAR(50), -- budget, balanced, premium
  number_of_travelers INT DEFAULT 1,
  interests VARCHAR(255)[],
  status VARCHAR(50) DEFAULT 'draft', -- draft, saved, completed, cancelled
  generated_by_ai BOOLEAN DEFAULT FALSE,
  ai_generation_data JSON, -- Store the AI request parameters
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trips_tourist_id ON trips(tourist_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_destination ON trips(destination);

-- Trip Days (itinerary)
CREATE TABLE trip_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  day_date DATE,
  morning_activity TEXT,
  morning_cost DECIMAL(10, 2),
  afternoon_activity TEXT,
  afternoon_cost DECIMAL(10, 2),
  evening_activity TEXT,
  evening_cost DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trip_days_trip_id ON trip_days(trip_id);
CREATE UNIQUE INDEX idx_trip_days_unique ON trip_days(trip_id, day_number);

-- Bookings (guide/business bookings)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tourist_id UUID NOT NULL REFERENCES users(id),
  guide_id UUID REFERENCES users(id),
  business_id UUID REFERENCES users(id),
  booking_type VARCHAR(50), -- guide, experience, hotel, tour
  title VARCHAR(255),
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  duration_hours INT,
  total_cost DECIMAL(12, 2),
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_tourist_id ON bookings(tourist_id);
CREATE INDEX idx_bookings_guide_id ON bookings(guide_id);
CREATE INDEX idx_bookings_business_id ON bookings(business_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewee_id UUID NOT NULL REFERENCES users(id),
  booking_id UUID REFERENCES bookings(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50), -- booking, verification, review, message
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Add tourism insights view
CREATE VIEW tourism_statistics AS
SELECT
  (SELECT COUNT(*) FROM users WHERE role = 'tourist') as total_tourists,
  (SELECT COUNT(*) FROM users WHERE role = 'guide') as total_guides,
  (SELECT COUNT(*) FROM users WHERE role = 'business') as total_businesses,
  (SELECT COUNT(*) FROM discoveries WHERE status = 'pending') as pending_discoveries,
  (SELECT COUNT(*) FROM discoveries WHERE status = 'verified') as verified_discoveries,
  (SELECT COUNT(*) FROM trips WHERE status = 'completed') as completed_trips,
  (SELECT COUNT(*) FROM bookings WHERE status = 'completed') as completed_bookings;
