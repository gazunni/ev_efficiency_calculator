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
‘vehicle_select’, ‘mode_select’, ‘unit_select’, ‘page_view’,
‘scenario_click’, ‘drivetrain_click’, ‘unit_switch’,
‘tab_view’, ‘temp_set’, ‘guided_complete’, ‘guided_question’
];

if (!VALID_EVENTS.includes(event)) {
return new Response(‘Invalid event’, { status: 400 });
}

const safeValue = String(value || ‘’).slice(0, 64);
const safePage  = String(page  || ‘’).slice(0, 32);

const sql = neon(process.env.NETLIFY_DATABASE_URL);

// Table and schema already established — insert only
await sql`INSERT INTO events (event, value, page) VALUES (${event}, ${safeValue}, ${safePage})`;

return new Response(‘ok’, { status: 200 });
};

export const config = { path: ‘/.netlify/functions/track’ };
