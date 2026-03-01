export default async function handler(request, context) {
const response = await context.next();

// Only process HTML responses
const contentType = response.headers.get("content-type") || "";
if (!contentType.includes("text/html")) return response;

// Get country from Netlify’s built-in geo detection
const country = context.geo?.country?.code || "US";

// Determine units
// Canada = metric, USA = imperial, everyone else = metric
const defaultMetric = country !== "US";

// Determine season based on current month and hemisphere
const month = new Date().getMonth(); // 0=Jan, 11=Dec

// Southern hemisphere countries flip the seasons
const southernHemisphere = ["AU","NZ","ZA","AR","CL","BR","PE","UY"].includes(country);

// Northern hemisphere seasons
// Winter: Dec(11) Jan(0) Feb(1)
// Spring: Mar(2) Apr(3) May(4)
// Summer: Jun(5) Jul(6) Aug(7)
// Autumn: Sep(8) Oct(9) Nov(10)
let season;
if (southernHemisphere) {
// Flip the seasons for southern hemisphere
if (month >= 11 || month <= 1) season = "summer";
else if (month >= 2 && month <= 4) season = "autumn";
else if (month >= 5 && month <= 7) season = "winter";
else season = "spring";
} else {
if (month >= 11 || month <= 1) season = "winter";
else if (month >= 2 && month <= 4) season = "spring";
else if (month >= 5 && month <= 7) season = "summer";
else season = "autumn";
}

// Map season to default opening scenario key
// These match the scenario keys in the app
const seasonScenario = {
winter: "jan_commute",   // January Commute — dramatic ghost bars, most impactful
spring: "city_commute",  // City Commute — moderate, relatable spring morning
summer: "aug_errand",    // August Errand Run — A/C penalty front and centre
autumn: "city_commute"   // City Commute — autumn morning commute feel
};

const defaultScenario = seasonScenario[season];

// Read the HTML
const text = await response.text();

// Inject geo defaults into the page as early as possible
// We insert a small script right after <head> opens
const injection = `

<script>
  // Injected by Netlify edge function — geo and season defaults
  window.__GEO__ = {
    country: "${country}",
    defaultMetric: ${defaultMetric},
    season: "${season}",
    defaultScenario: "${defaultScenario}"
  };
</script>`;

const modified = text.replace("<head>", "<head>" + injection);

return new Response(modified, {
status: response.status,
headers: response.headers
});
}

