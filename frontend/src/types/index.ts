export interface User {
  id: string;
  email: string;
  role: 'tourist' | 'guide' | 'business' | 'admin';
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_image_url?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Discovery {
  id: string;
  submitted_by: string;
  place_name: string;
  category: string;
  description: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'verified' | 'rejected';
  verified_by?: string;
  verification_notes?: string;
  images?: DiscoveryImage[];
  created_at: string;
  updated_at: string;
}

export interface DiscoveryImage {
  id: string;
  image_url: string;
}

export interface Trip {
  id: string;
  tourist_id: string;
  destination: string;
  title?: string;
  description?: string;
  start_date: string;
  end_date: string;
  budget?: number;
  travel_style: string;
  number_of_travelers: number;
  interests: string[];
  status: 'draft' | 'saved' | 'completed' | 'cancelled';
  generated_by_ai: boolean;
  days?: TripDay[];
  created_at: string;
  updated_at: string;
  metrics?: {
    relevant_places: number;
    included_places: number;
    coverage_percent: number;
    remaining_places: number;
    extra_days: number;
  };
  directions_url?: string;
}

export interface TripDay {
  id: string;
  trip_id: string;
  day_number: number;
  day_date: string;
  morning_activity: string;
  morning_cost?: number;
  afternoon_activity: string;
  afternoon_cost?: number;
  evening_activity: string;
  evening_cost?: number;
  notes?: string;
}
