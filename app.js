'use strict';

// ── state ──
var SEL = { unit: null, vehicle: null, mode: null };

// ── geo detection ──
var GEO = window.__GEO__ || { country:'US', defaultMetric:false, season:'winter', defaultScenario:'jan_commute' };

function applyGeoDefaults() {
  var geoEl = document.getElementById('geo-status');
  var metric = GEO.defaultMetric;

  // Check localStorage override
  try {
    var ls = localStorage.getItem('ev_metric');
    if (ls !== null) metric = ls === '1';
  } catch(e) {}

  selectUnit(metric ? 'metric' : 'imperial');

  if (geoEl) {
    var country = GEO.country || 'US';
    geoEl.textContent = '📍 Region detected: ' + country + ' · ' + (metric ? 'Metric' : 'Imperial') + ' pre-selected';
    geoEl.className = 'hero-geo active';
  }
}

// ── selection functions ──
function selectUnit(u) {
  SEL.unit = u;
  var imp = document.getElementById('btn-imp');
  var met = document.getElementById('btn-met');
  imp.className = 'unit-btn ' + (u === 'imperial' ? 'active-imp' : 'inactive');
  met.className = 'unit-btn ' + (u === 'metric'   ? 'active-met' : 'inactive');
  try { localStorage.setItem('ev_metric', u === 'metric' ? '1' : '0'); } catch(e) {}
  updateGo();
  track('unit_select', u);
}

function selectVehicle(v) {
  SEL.vehicle = v;
  document.getElementById('vcard-equinox').className = 'vcard' + (v === 'equinox' ? ' active' : '');
  document.getElementById('vcard-blazer').className  = 'vcard' + (v === 'blazer'  ? ' active' : '');
  updateGo();
  track('vehicle_select', v);
}

function selectMode(m) {
  SEL.mode = m;
  document.getElementById('mcard-newuser').className    = 'mcard' + (m === 'new_user'   ? ' active' : '');
  document.getElementById('mcard-enthusiast').className = 'mcard' + (m === 'enthusiast' ? ' active' : '');
  updateGo();
  track('mode_select', m);
}

function updateGo() {
  var btn  = document.getElementById('go-btn');
  var hint = btn.nextElementSibling;
  var dest = document.getElementById('go-dest');

  if (!SEL.unit || !SEL.vehicle || !SEL.mode) {
    btn.disabled = true;
    hint.style.color = '#90EE90';
    dest.textContent = '';
    return;
  }

  btn.disabled = false;
  hint.style.color = '#90EE90';

  // Determine destination
  var page = '';
  if (SEL.mode === 'new_user') {
    page = SEL.vehicle === 'equinox' ? 'new_user_equinox.html' : 'new_user_blazer.html';
  } else {
    page = SEL.vehicle === 'equinox' ? 'equinox_calculator.html' : 'blazer_calculator.html';
  }
  dest.textContent = '→ ' + page;
  dest.dataset.page = page;
}

function goToCalculator() {
  if (!SEL.unit || !SEL.vehicle || !SEL.mode) return;

  var metric   = SEL.unit === 'metric' ? 1 : 0;
  var scenario = GEO.defaultScenario || 'jan_commute';
  var page     = document.getElementById('go-dest').dataset.page;

  track('page_view', page);

  var params = '?metric=' + metric +
               '&scenario=' + encodeURIComponent(scenario) +
               '&geo=' + (window.__GEO__ ? 1 : 0) +
               '&from=landing';

  window.location.href = page + params;
}

// ── analytics ──
function track(event, value) {
  try {
    fetch('/.netlify/functions/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: event, value: String(value), page: 'index' })
    }).catch(function(){});
  } catch(e) {}
}

// ── init ──
track('page_view', 'index');
applyGeoDefaults();