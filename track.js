import { neon } from ‘@neondatabase/serverless’;

export default async (req) => {
if (req.method !== ‘POST’) {
return new Response(‘Method not allowed’, { status: 405 });
}

let body;
try {
body = await req.json();
} catch {
return new Response(‘Bad JSON’, { status: 400 });
}

const { event, value, page } = body;

// Whitelist valid event names — never trust client input
const VALID_EVENTS = [
// Landing page
‘vehicle_select’,   // equinox | blazer
‘mode_select’,      // new_user | enthusiast
‘unit_select’,      // imperial | metric
‘page_view’,        // index | equinox_calculator | blazer_calculator | new_user_equinox | new_user_blazer
// Calculator
‘scenario_click’,
‘drivetrain_click’,
‘unit_switch’,
‘tab_view’,
‘temp_set’,
// New user flow
‘guided_complete’,
‘guided_question’
];

if (!VALID_EVENTS.includes(event)) {
return new Response(‘Invalid event’, { status: 400 });
}

const safeValue = String(value || ‘’).slice(0, 64);
const safePage  = String(page  || ‘’).slice(0, 32);

const sql = neon(process.env.NETLIFY_DATABASE_URL);

// Create table if it doesn’t exist (safe to run every time)
await sql`CREATE TABLE IF NOT EXISTS events ( id        BIGSERIAL PRIMARY KEY, event     TEXT NOT NULL, value     TEXT, page      TEXT, ts        TIMESTAMPTZ DEFAULT NOW() )`;

// Add page column if it doesn’t exist (safe migration for existing installs)
await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS page TEXT`;

await sql`INSERT INTO events (event, value, page) VALUES (${event}, ${safeValue}, ${safePage})`;

return new Response(‘ok’, { status: 200 });
};

export const config = { path: ‘/.netlify/functions/track’ };