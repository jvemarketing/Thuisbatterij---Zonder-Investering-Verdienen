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
 * A header row and a "Leads" tab are created automatically on first run.
 */

var SHEET_NAME = 'Leads';

var COLUMNS = [
  'received_at', 'actie', 'aanhef', 'voornaam', 'achternaam', 'geboortedatum',
  'email', 'postcode', 'huisnummer', 'toevoeging', 'straat', 'plaats',
  'stateName', 'adres_geverifieerd', 'telefoon', 'telefoon_geverifieerd',
  'consent', 'consent_tekst', 'antwoorden', 'utm', 'verzonden_op'
];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var expectedSecret = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
    if (expectedSecret && data.secret !== expectedSecret) {
      return jsonOutput({ result: 'error', error: 'invalid secret' });
    }

    var sheet = getOrCreateSheet();
    var row = COLUMNS.map(function (key) {
      var val = data[key];
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
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
  }
  return sheet;
}

// Apps Script Web Apps always respond with HTTP 200 for a doPost that
// doesn't throw — callers must check the "result" field in the JSON body
// to tell success from failure (see api/bespaarcheck-lead.js).
function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
