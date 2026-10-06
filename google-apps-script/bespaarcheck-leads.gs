/**
 * De Grote Bespaarcheck 2026 — lead intake Web App.
 *
 * This script is NOT deployed from this repo — it has to be pasted into the
 * Apps Script editor bound to the Google Sheet that should receive leads.
 * Kept here for version control / reference only.
 *
 * Setup:
 * 1. Open (or create) the Google Sheet that should receive leads.
 * 2. Extensions > Apps Script. Delete any boilerplate code and paste this
 *    file's contents in its place.
 * 3. Project Settings (gear icon, left sidebar) > Script Properties >
 *    "Add script property" > name it SHARED_SECRET, value = a long random
 *    string. Put that exact same value in the BESPAARCHECK_SHEETS_SECRET
 *    environment variable on Vercel.
 * 4. Deploy > New deployment > gear icon next to "Select type" > Web app.
 *      Execute as: Me
 *      Who has access: Anyone
 * 5. Click Deploy, authorize the script when prompted, then copy the Web
 *    App URL it gives you. Put that URL in the BESPAARCHECK_SHEETS_WEBHOOK_URL
 *    environment variable on Vercel.
 * 6. Whenever you edit this script afterwards, you must create a NEW
 *    deployment version (Deploy > Manage deployments > pencil icon > Version:
 *    New version > Deploy) — saving the script alone does not update the
 *    live Web App URL's behavior.
 *
 * The "Leads" tab and its header row are created automatically on first
 * run, and the header row is re-written on every call so it always matches
 * the COLUMNS below — if you change COLUMNS, existing data rows keep their
 * old values in whatever column position they were written to, so clear
 * old rows after a schema change instead of leaving them to misalign under
 * the new header.
 */

var SHEET_NAME = 'Leads';

// Each column is a human-readable header (for non-technical readers of the
// sheet) plus a function that pulls its value out of the parsed lead body.
// The 13 quiz answers and 4 UTM fields are flattened into their own named
// columns instead of one JSON blob, same reasoning for both.
var COLUMNS = [
  { header: 'Ontvangen op',              get: function (d) { return d.received_at; } },
  { header: 'Actie',                     get: function (d) { return d.actie; } },
  { header: 'Aanhef',                    get: function (d) { return d.aanhef; } },
  { header: 'Voornaam',                  get: function (d) { return d.voornaam; } },
  { header: 'Achternaam',                get: function (d) { return d.achternaam; } },
  { header: 'Geboortedatum',             get: function (d) { return d.geboortedatum; } },
  { header: 'E-mailadres',               get: function (d) { return d.email; } },
  { header: 'Postcode',                  get: function (d) { return d.postcode; } },
  { header: 'Huisnummer',                get: function (d) { return d.huisnummer; } },
  { header: 'Toevoeging',                get: function (d) { return d.toevoeging; } },
  { header: 'Straat',                    get: function (d) { return d.straat; } },
  { header: 'Plaats',                    get: function (d) { return d.plaats; } },
  { header: 'Provincie',                 get: function (d) { return d.stateName; } },
  { header: 'Adres geverifieerd',        get: function (d) { return d.adres_geverifieerd; } },
  { header: 'Telefoon',                  get: function (d) { return d.telefoon; } },
  { header: 'Telefoon geverifieerd',     get: function (d) { return d.telefoon_geverifieerd; } },
  { header: 'Toestemming',               get: function (d) { return d.consent; } },
  { header: 'Toestemmingstekst',         get: function (d) { return d.consent_tekst; } },
  { header: 'Elektrische/hybride auto?', get: function (d) { return antwoord(d, 'eauto'); } },
  { header: 'Elektrische fiets?',        get: function (d) { return antwoord(d, 'efiets'); } },
  { header: 'Energierekening p/m',       get: function (d) { return antwoord(d, 'rekening'); } },
  { header: 'Heeft zonnepanelen?',       get: function (d) { return antwoord(d, 'zonnepanelen'); } },
  { header: 'Type energiecontract',      get: function (d) { return antwoord(d, 'contract'); } },
  { header: 'Interesse in thuisbatterij?', get: function (d) { return antwoord(d, 'batterij'); } },
  { header: 'Wil verduurzamen?',         get: function (d) { return antwoord(d, 'verduurzamen'); } },
  { header: 'Tevreden internet/tv?',     get: function (d) { return antwoord(d, 'internet'); } },
  { header: 'Type woning',               get: function (d) { return antwoord(d, 'woningtype'); } },
  { header: 'Koop of huur?',             get: function (d) { return antwoord(d, 'koophuur'); } },
  { header: 'Gezinssamenstelling',       get: function (d) { return antwoord(d, 'gezin'); } },
  { header: 'Huidige energieleverancier', get: function (d) { return antwoord(d, 'energieleverancier'); } },
  { header: 'Huidige internetprovider',  get: function (d) { return antwoord(d, 'internetprovider'); } },
  { header: 'UTM source',                get: function (d) { return d.utm ? d.utm.source : ''; } },
  { header: 'UTM medium',                get: function (d) { return d.utm ? d.utm.medium : ''; } },
  { header: 'UTM campaign',              get: function (d) { return d.utm ? d.utm.campaign : ''; } },
  { header: 'UTM content',               get: function (d) { return d.utm ? d.utm.content : ''; } },
  { header: 'Verzonden op',              get: function (d) { return d.verzonden_op; } }
];

function antwoord(data, key) {
  var val = data.antwoorden ? data.antwoorden[key] : undefined;
  return (val === undefined || val === null) ? '' : val;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var expectedSecret = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
    if (expectedSecret && data.secret !== expectedSecret) {
      return jsonOutput({ result: 'error', error: 'invalid secret' });
    }

    var sheet = getOrCreateSheet();
    var row = COLUMNS.map(function (col) {
      var val = col.get(data);
      if (val === undefined || val === null) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      return val;
    });
    sheet.appendRow(row);

    return jsonOutput({ result: 'created' });
  } catch (err) {
    return jsonOutput({ result: 'error', error: String(err) });
  }
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  var headers = COLUMNS.map(function (col) { return col.header; });
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  return sheet;
}

// Apps Script Web Apps always respond with HTTP 200 for a doPost that
// doesn't throw — callers must check the "result" field in the JSON body
// to tell success from failure (see api/bespaarcheck-lead.js).
function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
