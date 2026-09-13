import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

dotenv.config();
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'travelx_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function seed(): Promise<void> {
  const password = await bcrypt.hash('password123', 12);
  const users = [
    ['tourist@example.com', 'tourist', 'Demo', 'Tourist'],
    ['guide@example.com', 'guide', 'Demo', 'Guide'],
    ['business@example.com', 'business', 'Demo', 'Business'],
    ['admin@example.com', 'admin', 'Demo', 'Admin'],
  ];
  for (const [email, role, firstName, lastName] of users) {
    await pool.query('INSERT INTO users (email,password_hash,role,first_name,last_name,is_verified) VALUES ($1,$2,$3,$4,$5,TRUE) ON CONFLICT (email) DO NOTHING', [email, password, role, firstName, lastName]);
  }
  const guide = await pool.query<{ id: string }>("SELECT id FROM users WHERE email='guide@example.com'");
  const business = await pool.query<{ id: string }>("SELECT id FROM users WHERE email='business@example.com'");
  if (guide.rows[0]) await pool.query("INSERT INTO guide_profiles (user_id,bio,expertise,languages,verification_status) VALUES ($1,'Local guide with practical recommendations',ARRAY['culture','food'],ARRAY['English'], 'verified') ON CONFLICT (user_id) DO NOTHING", [guide.rows[0].id]);
  if (business.rows[0]) await pool.query("INSERT INTO business_profiles (user_id,business_name,category,description,city,state,verification_status) VALUES ($1,'Demo Travel Experiences','tour','Locally operated experiences','Hyderabad','Telangana','verified') ON CONFLICT (user_id) DO NOTHING", [business.rows[0].id]);
  await pool.query("INSERT INTO places (name,category,description,city,state,country,is_featured) SELECT 'Charminar','heritage','A historic landmark and cultural center.','Hyderabad','Telangana','India',TRUE WHERE NOT EXISTS (SELECT 1 FROM places WHERE name='Charminar')");
  const places = [
    ['Golconda Fort', 'heritage', 'Hilltop fort with panoramic city views.', 'Hyderabad', 'Telangana'],
    ['Hussain Sagar Lake', 'scenic', 'Lakeside promenade and sunset views.', 'Hyderabad', 'Telangana'],
    ['Ramoji Film City', 'culture', 'Large film studio and themed attractions.', 'Hyderabad', 'Telangana'],
    ['Banjara Hills Food Walk', 'food', 'Local flavours, cafes, and regional cuisine.', 'Hyderabad', 'Telangana'],
    ['KBR National Park', 'nature', 'Green trail in the heart of the city.', 'Hyderabad', 'Telangana'],
  ];
  for (const place of places) await pool.query('INSERT INTO places (name,category,description,city,state,country,is_featured) SELECT $1,$2,$3,$4,$5,$6,TRUE WHERE NOT EXISTS (SELECT 1 FROM places WHERE name=$1)', [...place, 'India']);
  const services = [
    ['flight', 'Air India', 'Hyderabad to Delhi flights', 'Daily non-stop options.', 'Hyderabad', 4999, 'https://www.airindia.com/'],
    ['train', 'IRCTC', 'Hyderabad rail connections', 'Book trains across India.', 'Hyderabad', 650, 'https://www.irctc.co.in/'],
    ['hotel', 'Taj Hotels', 'Hyderabad city stays', 'Trusted hotels for business and leisure.', 'Hyderabad', 3500, 'https://www.tajhotels.com/'],
    ['bus', 'TSRTC', 'Telangana intercity buses', 'Statewide bus routes and reservations.', 'Hyderabad', 250, 'https://www.tsrtconline.in/'],
    ['cab', 'Uber', 'Airport and city cabs', 'On-demand rides across Hyderabad.', 'Hyderabad', 299, 'https://m.uber.com/'],
    ['holiday', 'TravelX curated', 'Hyderabad heritage weekend', 'A simple two-day city experience.', 'Hyderabad', 7999, 'https://www.incredibleindia.gov.in/'],
  ];
  for (const service of services) await pool.query('INSERT INTO travel_services (service_type,provider_name,title,description,city,price_from,booking_url) SELECT $1,$2,$3,$4,$5,$6,$7 WHERE NOT EXISTS (SELECT 1 FROM travel_services WHERE title=$3)', service);
  const hospitals = [
    ['Apollo Hospitals Jubilee Hills', 'Hyderabad', 'Telangana', 'Road No. 72, Film Nagar', '+91 40 2360 7777', '1066', '17.4214', '78.4071', 'https://www.apollohospitals.com/'],
    ['Yashoda Hospitals Secunderabad', 'Hyderabad', 'Telangana', 'Alexander Road, Secunderabad', '+91 40 4567 4567', '1066', '17.4399', '78.4983', 'https://www.yashodahospitals.com/'],
  ];
  for (const hospital of hospitals) await pool.query('INSERT INTO hospitals (name,city,state,address,phone,emergency_phone,latitude,longitude,website) SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9 WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name=$1)', hospital);
  console.log('Demo data seeded. Password for all demo accounts: password123');
  await pool.end();
}

seed().catch(async (error: unknown) => { console.error('Seed failed:', error); await pool.end(); process.exitCode = 1; });
