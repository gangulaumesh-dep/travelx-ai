import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { Pool, QueryResultRow } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'development-only-secret';
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'travelx_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

app.use(helmet());
app.use(compression());
app.use((req, res, next) => {
  const origin = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});
app.use(express.json({ limit: '2mb' }));
const uploadDirectory = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });
app.use('/uploads', express.static(uploadDirectory));
const imageUpload = multer({
  dest: uploadDirectory,
  limits: { files: 5, fileSize: Number(process.env.MAX_FILE_SIZE || 5242880) },
  fileFilter: (_req, file, callback) => callback(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)),
});

interface AuthRequest extends Request { user?: { id: string; role: string; email: string } }
const asyncRoute = (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction): void => { handler(req, res, next).catch(next); };
const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.header('Authorization');
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
  try { req.user = jwt.verify(header.slice(7), JWT_SECRET) as AuthRequest['user']; return next(); }
  catch { return res.status(401).json({ error: 'Invalid or expired token' }); }
};
const roles = (...allowed: string[]) => (req: AuthRequest, res: Response, next: NextFunction) =>
  req.user && allowed.includes(req.user.role) ? next() : res.status(403).json({ error: 'Insufficient permissions' });
const rows = async <T extends QueryResultRow = Record<string, unknown>>(text: string, values: unknown[] = []): Promise<T[]> => (await pool.query<T>(text, values)).rows;
const tokenFor = (user: { id: string; role: string; email: string }) => jwt.sign(user, JWT_SECRET, { expiresIn: 604800 });

app.get('/api/health', asyncRoute(async (_req, res) => {
  const result = await pool.query('SELECT NOW() AS now');
  res.json({ status: 'OK', database: 'Connected', timestamp: result.rows[0].now });
}));
app.get('/api/', (_req, res) => res.json({ message: 'TRAVELX AI API', version: '1.0.0', status: 'Running' }));

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const { email, password, role = 'tourist', first_name, last_name, phone } = req.body;
  if (!email || typeof password !== 'string' || password.length < 8 || !['tourist', 'guide', 'business'].includes(role)) return res.status(400).json({ error: 'Valid email, password (8+ characters), and role are required' });
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const result = await pool.query('INSERT INTO users (email,password_hash,role,first_name,last_name,phone) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,email,role,first_name,last_name,phone,is_verified,is_active,created_at,updated_at', [email.toLowerCase(), passwordHash, role, first_name, last_name, phone]);
    const user = result.rows[0]; res.status(201).json({ user, token: tokenFor(user) });
  } catch (error) { if ((error as { code?: string }).code === '23505') return res.status(409).json({ error: 'Email already registered' }); throw error; }
}));
app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = TRUE', [String(req.body.email || '').toLowerCase()]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password_hash))) return res.status(401).json({ error: 'Invalid email or password' });
  delete user.password_hash; res.json({ user, token: tokenFor(user) });
}));
app.get('/api/auth/verify', auth, (_req, res) => res.json({ success: true }));
app.post('/api/auth/logout', (_req, res) => res.json({ success: true }));

app.get('/api/places', asyncRoute(async (req, res) => {
  const destination = String(req.query.destination || '').trim();
  const params: unknown[] = []; const where = destination ? 'WHERE city ILIKE $1' : '';
  if (destination) params.push(`%${destination}%`);
  res.json({ items: await rows(`SELECT * FROM places ${where} ORDER BY is_featured DESC, rating DESC, name ASC`, params) });
}));
app.get('/api/weather', asyncRoute(async (req, res) => {
  const city = String(req.query.city || 'Hyderabad');
  res.json({ city, provider: process.env.OPENWEATHER_API_KEY ? 'provider-ready' : 'demo-fallback', forecast: [{ day: 'Today', condition: 'Partly cloudy', temperature_c: 29, rain_probability: 20 }, { day: 'Tomorrow', condition: 'Sunny', temperature_c: 30, rain_probability: 10 }] });
}));
app.get('/api/travel-services', asyncRoute(async (req, res) => {
  const type = String(req.query.type || '').trim(); const params: unknown[] = []; const where = type ? 'WHERE service_type=$1 AND is_active=TRUE' : 'WHERE is_active=TRUE';
  if (type) params.push(type);
  res.json({ items: await rows(`SELECT * FROM travel_services ${where} ORDER BY service_type, price_from NULLS LAST`, params) });
}));
app.get('/api/hospitals', asyncRoute(async (req, res) => {
  const city = String(req.query.city || '').trim(); const params: unknown[] = []; const where = city ? 'WHERE city ILIKE $1 AND is_active=TRUE' : 'WHERE is_active=TRUE';
  if (city) params.push(`%${city}%`);
  res.json({ items: await rows(`SELECT * FROM hospitals ${where} ORDER BY name`, params) });
}));
app.post('/api/reservations', auth, roles('tourist'), asyncRoute(async (req: AuthRequest, res) => {
  const { service_id, title, description, start_date, end_date, total_cost } = req.body;
  if (!service_id || !title || !start_date) return res.status(400).json({ error: 'Service, title, and start date are required' });
  const service = await rows('SELECT * FROM travel_services WHERE id=$1 AND is_active=TRUE', [service_id]);
  if (!service[0]) return res.status(404).json({ error: 'Travel service not found' });
  const result = await rows('INSERT INTO bookings (tourist_id,service_id,booking_type,title,description,start_date,end_date,total_cost) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', [req.user?.id, service_id, service[0].service_type, title, description || null, start_date, end_date || null, total_cost || service[0].price_from || null]);
  res.status(201).json(result[0]);
}));

app.get('/api/discoveries', asyncRoute(async (req, res) => {
  const params: unknown[] = []; const filters: string[] = [];
  if (req.query.status) { params.push(req.query.status); filters.push(`d.status = $${params.length}`); }
  if (req.query.category) { params.push(req.query.category); filters.push(`d.category = $${params.length}`); }
  if (req.query.city) { params.push(req.query.city); filters.push(`d.city ILIKE $${params.length}`); params[params.length - 1] = `%${String(req.query.city)}%`; }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const items = await rows('SELECT d.*, COALESCE(json_agg(di) FILTER (WHERE di.id IS NOT NULL), \'[]\') AS images FROM discoveries d LEFT JOIN discovery_images di ON di.discovery_id=d.id ' + where + ' GROUP BY d.id ORDER BY d.created_at DESC', params);
  res.json({ items });
}));
app.get('/api/discoveries/:id', asyncRoute(async (req, res) => { const result = await rows("SELECT d.*, COALESCE(json_agg(di) FILTER (WHERE di.id IS NOT NULL), '[]') AS images FROM discoveries d LEFT JOIN discovery_images di ON di.discovery_id=d.id WHERE d.id=$1 GROUP BY d.id", [req.params.id]); if (!result[0]) return res.status(404).json({ error: 'Discovery not found' }); res.json(result[0]); }));
app.post('/api/discoveries', auth, imageUpload.array('images', 5), asyncRoute(async (req: AuthRequest, res) => {
  const { place_name, category, description, city, state, latitude, longitude } = req.body;
  if (!place_name || !description) return res.status(400).json({ error: 'Place name and description are required' });
  const result = await rows('INSERT INTO discoveries (submitted_by,place_name,category,description,city,state,latitude,longitude) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', [req.user?.id, place_name, category, description, city, state, latitude, longitude]);
  const files = (req.files || []) as Express.Multer.File[];
  for (const [index, file] of files.entries()) {
    const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
    const renamedPath = `${file.path}${extension}`;
    fs.renameSync(file.path, renamedPath);
    await pool.query('INSERT INTO discovery_images (discovery_id,image_url,uploaded_by,is_primary) VALUES ($1,$2,$3,$4)', [result[0].id, `${process.env.SERVER_URL || `http://localhost:${PORT}`}/uploads/${path.basename(renamedPath)}`, req.user?.id, index === 0]);
  }
  res.status(201).json(result[0]);
}));
app.patch('/api/discoveries/:id/verify', auth, roles('admin'), asyncRoute(async (req: AuthRequest, res) => {
  const status = ['verified', 'rejected'].includes(req.body.status) ? req.body.status : null;
  if (!status) return res.status(400).json({ error: 'Status must be verified or rejected' });
  const result = await rows('UPDATE discoveries SET status=$1,verified_by=$2,verification_notes=$3,verified_at=NOW(),updated_at=NOW() WHERE id=$4 RETURNING *', [status, req.user?.id, req.body.verification_notes || null, req.params.id]);
  if (!result[0]) return res.status(404).json({ error: 'Discovery not found' }); res.json(result[0]);
}));

const tripSelect = 'SELECT t.*, COALESCE(json_agg(td ORDER BY td.day_number) FILTER (WHERE td.id IS NOT NULL), \'[]\') AS days FROM trips t LEFT JOIN trip_days td ON td.trip_id=t.id';
app.get('/api/trips', auth, asyncRoute(async (req: AuthRequest, res) => { const result = await rows(`${tripSelect} WHERE t.tourist_id=$1 GROUP BY t.id ORDER BY t.created_at DESC`, [req.user?.id]); res.json({ items: result }); }));
app.get('/api/trips/:id', auth, asyncRoute(async (req: AuthRequest, res) => { const result = await rows(`${tripSelect} WHERE t.id=$1 AND t.tourist_id=$2 GROUP BY t.id`, [req.params.id, req.user?.id]); if (!result[0]) return res.status(404).json({ error: 'Trip not found' }); res.json(result[0]); }));
app.post('/api/trips', auth, asyncRoute(async (req: AuthRequest, res) => { const { destination, start_date, end_date, title, description, budget, travel_style, number_of_travelers = 1, interests = [], status = 'saved' } = req.body; if (!destination || !start_date || !end_date) return res.status(400).json({ error: 'Destination and dates are required' }); const result = await rows('INSERT INTO trips (tourist_id,destination,start_date,end_date,title,description,budget,travel_style,number_of_travelers,interests,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *', [req.user?.id, destination, start_date, end_date, title, description, budget, travel_style, number_of_travelers, interests, status]); res.status(201).json(result[0]); }));
app.post('/api/trips/generate', auth, asyncRoute(async (req: AuthRequest, res) => {
  const destination = String(req.body.destination || '').trim(); const count = Math.min(Math.max(Number(req.body.days) || 3, 1), 14);
  if (!destination) return res.status(400).json({ error: 'Destination is required' });
  const placeRows = await rows<{ id: string; name: string; category: string; description: string }>('SELECT id,name,category,description FROM places WHERE city ILIKE $1 ORDER BY is_featured DESC,rating DESC,name ASC', [`%${destination}%`]);
  const relevant = placeRows.length || 1;
  const included = Math.min(placeRows.length, count * 2);
  const coverage = Math.min(100, Math.round((included / relevant) * 100));
  const start = new Date(); const end = new Date(start); end.setDate(start.getDate() + count - 1);
  const days = Array.from({ length: count }, (_, index) => {
    const first = placeRows[index * 2]; const second = placeRows[index * 2 + 1];
    return { day_number: index + 1, day_date: new Date(start.getTime() + index * 86400000).toISOString().slice(0, 10), morning_activity: first ? `Visit ${first.name}` : `Explore a landmark in ${destination}`, afternoon_activity: second ? `Discover ${second.name}` : `Try local food and culture in ${destination}`, evening_activity: `Relax and review tomorrow's plans`, notes: 'Rule-based itinerary; add an AI provider key for richer recommendations.' };
  });
  const trip = await rows('INSERT INTO trips (tourist_id,destination,title,start_date,end_date,travel_style,number_of_travelers,interests,status,generated_by_ai,ai_generation_data) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *', [req.user?.id, destination, `Trip to ${destination}`, start.toISOString().slice(0, 10), end.toISOString().slice(0, 10), req.body.travel_style || 'balanced', req.body.number_of_travelers || 1, req.body.interests || [], 'draft', false, JSON.stringify({ provider: 'rule-based-fallback' })]);
  for (const day of days) await pool.query('INSERT INTO trip_days (trip_id,day_number,day_date,morning_activity,afternoon_activity,evening_activity,notes) VALUES ($1,$2,$3,$4,$5,$6,$7)', [trip[0].id, day.day_number, day.day_date, day.morning_activity, day.afternoon_activity, day.evening_activity, day.notes]);
  res.status(201).json({ trip: { ...trip[0], days, metrics: { relevant_places: relevant, included_places: included, coverage_percent: coverage, remaining_places: Math.max(0, relevant - included), extra_days: Math.max(0, Math.ceil((relevant - included) / 2)) }, directions_url: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}` }, provider: 'rule-based-fallback' });
}));
app.patch('/api/trips/:id', auth, asyncRoute(async (req: AuthRequest, res) => { const allowed = ['title','description','budget','status','travel_style']; const keys = Object.keys(req.body).filter((key) => allowed.includes(key)); if (!keys.length) return res.status(400).json({ error: 'No editable fields provided' }); if (req.body.status && !['draft', 'saved', 'completed', 'cancelled'].includes(req.body.status)) return res.status(400).json({ error: 'Invalid trip status' }); const values = keys.map((key) => req.body[key]); values.push(req.params.id, req.user?.id); const set = keys.map((key, i) => `${key}=$${i + 1}`).join(','); const result = await rows(`UPDATE trips SET ${set},updated_at=NOW() WHERE id=$${keys.length + 1} AND tourist_id=$${keys.length + 2} RETURNING *`, values); if (!result[0]) return res.status(404).json({ error: 'Trip not found' }); res.json(result[0]); }));
app.delete('/api/trips/:id', auth, asyncRoute(async (req: AuthRequest, res) => { const result = await rows('DELETE FROM trips WHERE id=$1 AND tourist_id=$2 RETURNING id', [req.params.id, req.user?.id]); if (!result[0]) return res.status(404).json({ error: 'Trip not found' }); res.status(204).send(); }));

app.get('/api/guides', asyncRoute(async (_req, res) => { res.json({ items: await rows("SELECT u.id,u.email,u.first_name,u.last_name,g.* FROM users u JOIN guide_profiles g ON g.user_id=u.id WHERE u.is_active=TRUE AND g.verification_status='verified'") }); }));
app.get('/api/guides/:id', asyncRoute(async (req, res) => { const result = await rows('SELECT u.id,u.email,u.first_name,u.last_name,g.* FROM users u JOIN guide_profiles g ON g.user_id=u.id WHERE u.id=$1', [req.params.id]); if (!result[0]) return res.status(404).json({ error: 'Guide not found' }); res.json(result[0]); }));
app.patch('/api/guides/me', auth, roles('guide'), asyncRoute(async (req: AuthRequest, res) => { const result = await rows('UPDATE guide_profiles SET bio=COALESCE($1,bio),expertise=COALESCE($2,expertise),languages=COALESCE($3,languages),hourly_rate=COALESCE($4,hourly_rate),updated_at=NOW() WHERE user_id=$5 RETURNING *', [req.body.bio, req.body.expertise, req.body.languages, req.body.hourly_rate, req.user?.id]); res.json(result[0]); }));
app.get('/api/guides/me', auth, roles('guide'), asyncRoute(async (req: AuthRequest, res) => { const result = await rows('SELECT u.id,u.email,u.first_name,u.last_name,u.phone,g.* FROM users u JOIN guide_profiles g ON g.user_id=u.id WHERE u.id=$1', [req.user?.id]); if (!result[0]) return res.status(404).json({ error: 'Guide profile not found' }); res.json(result[0]); }));
app.get('/api/bookings', auth, asyncRoute(async (req: AuthRequest, res) => {
  const condition = req.user?.role === 'guide' ? 'b.guide_id=$1' : req.user?.role === 'business' ? 'b.business_id=$1' : 'b.tourist_id=$1';
  const result = await rows(`SELECT b.*, tu.first_name AS tourist_first_name, tu.last_name AS tourist_last_name, gu.first_name AS guide_first_name, gu.last_name AS guide_last_name FROM bookings b JOIN users tu ON tu.id=b.tourist_id LEFT JOIN users gu ON gu.id=b.guide_id WHERE ${condition} ORDER BY b.created_at DESC`, [req.user?.id]);
  res.json({ items: result });
}));
app.post('/api/bookings', auth, roles('tourist'), asyncRoute(async (req: AuthRequest, res) => {
  const { guide_id, business_id, service_id, title, description, start_date, end_date, duration_hours, total_cost } = req.body;
  if ((!guide_id && !business_id) || !title || !start_date || (guide_id && business_id)) return res.status(400).json({ error: 'Exactly one guide or business and a start date are required' });
  if (guide_id && !(await rows('SELECT user_id FROM guide_profiles WHERE user_id=$1 AND verification_status=$2', [guide_id, 'verified']))[0]) return res.status(404).json({ error: 'Verified guide not found' });
  if (business_id && !(await rows('SELECT user_id FROM business_profiles WHERE user_id=$1 AND verification_status=$2', [business_id, 'verified']))[0]) return res.status(404).json({ error: 'Verified business not found' });
  if (service_id && (!business_id || !(await rows('SELECT id FROM business_services WHERE id=$1 AND business_id=$2 AND is_active=TRUE', [service_id, business_id]))[0])) return res.status(404).json({ error: 'Active business service not found' });
  const result = await rows('INSERT INTO bookings (tourist_id,guide_id,business_id,booking_type,title,description,start_date,end_date,duration_hours,total_cost) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *', [req.user?.id, guide_id || null, business_id || null, guide_id ? 'guide' : 'experience', title, description || null, start_date, end_date || null, duration_hours || null, total_cost || null]);
  res.status(201).json(result[0]);
}));
app.patch('/api/bookings/:id/status', auth, roles('guide', 'business'), asyncRoute(async (req: AuthRequest, res) => {
  if (!['confirmed', 'cancelled', 'completed'].includes(req.body.status)) return res.status(400).json({ error: 'Invalid booking status' });
  const ownerColumn = req.user?.role === 'business' ? 'business_id' : 'guide_id';
  const result = await rows(`UPDATE bookings SET status=$1,updated_at=NOW() WHERE id=$2 AND ${ownerColumn}=$3 RETURNING *`, [req.body.status, req.params.id, req.user?.id]);
  if (!result[0]) return res.status(404).json({ error: 'Booking not found' }); res.json(result[0]);
}));
app.get('/api/businesses', asyncRoute(async (_req, res) => { res.json({ items: await rows("SELECT u.id,u.email,u.first_name,u.last_name,b.*,COALESCE((SELECT json_agg(s) FROM business_services s WHERE s.business_id=u.id AND s.is_active=TRUE),'[]') AS services FROM users u JOIN business_profiles b ON b.user_id=u.id WHERE u.is_active=TRUE AND b.verification_status='verified'") }); }));
app.get('/api/businesses/me', auth, roles('business'), asyncRoute(async (req: AuthRequest, res) => { const result = await rows('SELECT u.id,u.email,u.first_name,u.last_name,u.phone,b.* FROM users u JOIN business_profiles b ON b.user_id=u.id WHERE u.id=$1', [req.user?.id]); if (!result[0]) return res.status(404).json({ error: 'Business profile not found' }); res.json(result[0]); }));
app.get('/api/businesses/:id', asyncRoute(async (req, res) => { const result = await rows("SELECT u.id,u.email,u.first_name,u.last_name,b.*,COALESCE((SELECT json_agg(s) FROM business_services s WHERE s.business_id=u.id AND s.is_active=TRUE),'[]') AS services FROM users u JOIN business_profiles b ON b.user_id=u.id WHERE u.id=$1", [req.params.id]); if (!result[0]) return res.status(404).json({ error: 'Business not found' }); res.json(result[0]); }));
app.patch('/api/businesses/me', auth, roles('business'), asyncRoute(async (req: AuthRequest, res) => { const result = await rows('UPDATE business_profiles SET business_name=COALESCE($1,business_name),category=COALESCE($2,category),description=COALESCE($3,description),phone=COALESCE($4,phone),website=COALESCE($5,website),address=COALESCE($6,address),city=COALESCE($7,city),state=COALESCE($8,state),updated_at=NOW() WHERE user_id=$9 RETURNING *', [req.body.business_name, req.body.category, req.body.description, req.body.phone, req.body.website, req.body.address, req.body.city, req.body.state, req.user?.id]); res.json(result[0]); }));
app.get('/api/businesses/me/services', auth, roles('business'), asyncRoute(async (req: AuthRequest, res) => { res.json({ items: await rows('SELECT * FROM business_services WHERE business_id=$1 ORDER BY created_at DESC', [req.user?.id]) }); }));
app.post('/api/businesses/me/services', auth, roles('business'), asyncRoute(async (req: AuthRequest, res) => { const { name, description, price, duration_hours } = req.body; if (!name) return res.status(400).json({ error: 'Service name is required' }); const result = await rows('INSERT INTO business_services (business_id,name,description,price,duration_hours) VALUES ($1,$2,$3,$4,$5) RETURNING *', [req.user?.id, name, description || null, price || null, duration_hours || null]); res.status(201).json(result[0]); }));
app.patch('/api/businesses/me/services/:id', auth, roles('business'), asyncRoute(async (req: AuthRequest, res) => { const result = await rows('UPDATE business_services SET name=COALESCE($1,name),description=COALESCE($2,description),price=COALESCE($3,price),duration_hours=COALESCE($4,duration_hours),is_active=COALESCE($5,is_active),updated_at=NOW() WHERE id=$6 AND business_id=$7 RETURNING *', [req.body.name, req.body.description, req.body.price, req.body.duration_hours, req.body.is_active, req.params.id, req.user?.id]); if (!result[0]) return res.status(404).json({ error: 'Service not found' }); res.json(result[0]); }));
app.delete('/api/businesses/me/services/:id', auth, roles('business'), asyncRoute(async (req: AuthRequest, res) => { const result = await rows('DELETE FROM business_services WHERE id=$1 AND business_id=$2 RETURNING id', [req.params.id, req.user?.id]); if (!result[0]) return res.status(404).json({ error: 'Service not found' }); res.status(204).send(); }));

app.get('/api/admin/stats', auth, roles('admin'), asyncRoute(async (_req, res) => { const result = await rows<Record<string, number>>('SELECT * FROM tourism_statistics'); res.json({ stats: result[0] || {} }); }));
app.get('/api/admin/discoveries/pending', auth, roles('admin'), asyncRoute(async (_req, res) => { res.json({ items: await rows("SELECT d.*,u.email AS submitter_email,u.first_name AS submitter_first_name FROM discoveries d JOIN users u ON u.id=d.submitted_by WHERE d.status='pending' ORDER BY d.created_at ASC") }); }));
app.get('/api/admin/users', auth, roles('admin'), asyncRoute(async (_req, res) => { res.json({ items: await rows('SELECT id,email,role,first_name,last_name,is_verified,is_active,created_at FROM users ORDER BY created_at DESC') }); }));
app.patch('/api/admin/users/:id', auth, roles('admin'), asyncRoute(async (req: AuthRequest, res) => { const fields: string[] = []; const values: unknown[] = []; if (typeof req.body.is_active === 'boolean') { fields.push(`is_active=$${fields.length + 1}`); values.push(req.body.is_active); } if (['tourist', 'guide', 'business', 'admin'].includes(req.body.role) && req.params.id !== req.user?.id) { fields.push(`role=$${fields.length + 1}`); values.push(req.body.role); } if (!fields.length) return res.status(400).json({ error: 'Provide a valid status or role change' }); values.push(req.params.id); const result = await rows(`UPDATE users SET ${fields.join(',')},updated_at=NOW() WHERE id=$${values.length} RETURNING id,email,role,first_name,last_name,is_verified,is_active,created_at`, values); if (!result[0]) return res.status(404).json({ error: 'User not found' }); res.json(result[0]); }));
app.get('/api/admin/guides', auth, roles('admin'), asyncRoute(async (_req, res) => { res.json({ items: await rows('SELECT u.id,u.email,u.first_name,u.last_name,g.* FROM users u JOIN guide_profiles g ON g.user_id=u.id') }); }));
app.patch('/api/admin/guides/:id/verification', auth, roles('admin'), asyncRoute(async (req, res) => { if (!['pending', 'verified', 'rejected'].includes(req.body.status)) return res.status(400).json({ error: 'Invalid verification status' }); const result = await rows('UPDATE guide_profiles SET verification_status=$1,updated_at=NOW() WHERE user_id=$2 RETURNING *', [req.body.status, req.params.id]); if (!result[0]) return res.status(404).json({ error: 'Guide not found' }); res.json(result[0]); }));
app.get('/api/admin/businesses', auth, roles('admin'), asyncRoute(async (_req, res) => { res.json({ items: await rows('SELECT u.id,u.email,u.first_name,u.last_name,b.* FROM users u JOIN business_profiles b ON b.user_id=u.id') }); }));
app.patch('/api/admin/businesses/:id/verification', auth, roles('admin'), asyncRoute(async (req, res) => { if (!['pending', 'verified', 'rejected'].includes(req.body.status)) return res.status(400).json({ error: 'Invalid verification status' }); const result = await rows('UPDATE business_profiles SET verification_status=$1,updated_at=NOW() WHERE user_id=$2 RETURNING *', [req.body.status, req.params.id]); if (!result[0]) return res.status(404).json({ error: 'Business not found' }); res.json(result[0]); }));
app.get('/api/admin/analytics', auth, roles('admin'), asyncRoute(async (_req, res) => { const [usersByRole, bookingsByStatus, discoveriesByStatus, services] = await Promise.all([rows('SELECT role,COUNT(*)::int AS count FROM users GROUP BY role'), rows('SELECT status,COUNT(*)::int AS count FROM bookings GROUP BY status'), rows('SELECT status,COUNT(*)::int AS count FROM discoveries GROUP BY status'), rows('SELECT COUNT(*)::int AS count FROM business_services WHERE is_active=TRUE')]); res.json({ usersByRole, bookingsByStatus, discoveriesByStatus, activeServices: services[0]?.count || 0 }); }));

app.use((_req, res) => res.status(404).json({ error: 'Not Found' }));
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => { console.error(error); if (error instanceof multer.MulterError || error.message === 'Unexpected field') return res.status(400).json({ error: 'Upload must contain up to five supported images, each under the configured size limit' }); res.status(500).json({ error: 'Internal Server Error' }); });
if (require.main === module) app.listen(PORT, () => console.log(`TRAVELX AI API listening on http://localhost:${PORT}`));
export { app, pool };
