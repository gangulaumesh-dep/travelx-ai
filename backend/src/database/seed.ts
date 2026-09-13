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
  console.log('Demo data seeded. Password for all demo accounts: password123');
  await pool.end();
}

seed().catch(async (error: unknown) => { console.error('Seed failed:', error); await pool.end(); process.exitCode = 1; });
