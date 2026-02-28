import { neon } from ‘@neondatabase/serverless’;

export default async (req) => {
const sql = neon(process.env.NETLIFY_DATABASE_URL);

try {
// Top scenarios
const scenarios = await sql`SELECT value, COUNT(*) as count FROM events WHERE event = 'scenario_click' GROUP BY value ORDER BY count DESC LIMIT 20`;

```
// Drivetrain split
const drivetrains = await sql`
  SELECT value, COUNT(*) as count
  FROM events
  WHERE event = 'drivetrain_click'
  GROUP BY value ORDER BY count DESC
`;

// Unit preference
const units = await sql`
  SELECT value, COUNT(*) as count
  FROM events
  WHERE event IN ('unit_switch', 'unit_select')
  GROUP BY value ORDER BY count DESC
`;

// Vehicle selection from landing page
const vehicles = await sql`
  SELECT value, COUNT(*) as count
  FROM events
  WHERE event = 'vehicle_select'
  GROUP BY value ORDER BY count DESC
`;

// Page views
const pages = await sql`
  SELECT page, COUNT(*) as count
  FROM events
  WHERE event = 'page_view'
  GROUP BY page ORDER BY count DESC
`;

// Tab views
const tabs = await sql`
  SELECT value, COUNT(*) as count
  FROM events
  WHERE event = 'tab_view'
  GROUP BY value ORDER BY count DESC
`;

// Total events last 7 days
const recent = await sql`
  SELECT DATE(ts) as day, COUNT(*) as count
  FROM events
  WHERE ts > NOW() - INTERVAL '7 days'
  GROUP BY day ORDER BY day DESC
`;

return new Response(JSON.stringify({
  scenarios, drivetrains, units, vehicles, pages, tabs, recent
}), {
  status: 200,
  headers: { 'Content-Type': 'application/json' }
});
```

} catch (err) {
return new Response(JSON.stringify({ error: err.message }), {
status: 500,
headers: { ‘Content-Type’: ‘application/json’ }
});
}
};

export const config = { path: ‘/.netlify/functions/stats’ };