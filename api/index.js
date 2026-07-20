import express from "express";
import dotenv from "dotenv";
import pages from "../pages.js";
import suppressionRouter from "../suppression.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Local-dev convenience mounts (see bottom of file) — these are the same
// handler files deployed as individual Vercel Functions in production.
// Importing them here costs nothing extra: today's single app.js bundle
// already includes all of this code together.
import postcodecheckHandler from './postcodecheck.js';
import validateMobileHandler from './validate/mobile.js';
import validateLandlineHandler from './validate/landline.js';
import validateEmailHandler from './validate/email.js';
import lookupPafHandler from './lookup/paf.js';
import lookupMobilePaymentTypeHandler from './lookup/mobile-payment-type.js';
import smsSendHandler from './sms/send.js';
import smsVerifyHandler from './sms/verify.js';
import leadHandler from './lead.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', suppressionRouter);

app.set('view engine', 'ejs');
app.set('views', join(__dirname, '..', 'views'));

// Domain-aware SSR routing — must come before express.static
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const host = req.hostname
    .replace(/^www\./, '')
    .replace(/\.local$/, '.nl'); // local dev: vastelastenonderzoek.local → vastelastenonderzoek.nl

  let lookupHost = host;

  //used for local mobile testing directly on phone
  const proxyHostname = process.argv[2] || '';
  if (req.hostname === proxyHostname) {
    lookupHost = 'vastelastenonderzoek.nl';
  }

  const normalizedPath = req.path !== '/' ? req.path.replace(/\/$/, '') : '/';

  const page = pages.find(p => p.domains.some(d => d.domain === lookupHost));
  const domainEntry = page?.domains.find(d => d.domain === lookupHost);
  const route = page?.routes.find(r => r.path === normalizedPath);

  if (!page || !domainEntry || !route) return next();

  const viewData = {
    ...page.defaultViewData,
    ...route.routeViewData,
    clarityId: domainEntry.clarityId,
    query: req.query,
  };
  console.log(viewData);
  res.render(route.view, viewData);
});

app.use(express.static(join(__dirname, '..', 'public')));

// ─── Sovendus clickout page ───────────────────────────────────────────────────
// Opened in a new tab from the thank-you page; renders the Sovendus integration.
app.get('/sovendus', (req, res) => {
  res.render('sovendus', {
    trafficSourceNumber: process.env.SOV_TRAFFIC_SOURCE_NUMBER || '',
    trafficMediumNumber: process.env.SOV_TRAFFIC_MEDIUM_NUMBER || '',
    sessionId:           Date.now().toString(36),
    firstName:           req.query.firstName  || '',
    lastName:            req.query.lastName   || '',
    email:               req.query.email      || '',
    zipcode:             req.query.zipcode    || '',
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Local-dev convenience: mount the split-out API handlers (each its own Vercel
// Function in production) onto this same Express app so `npm run dev` keeps
// serving every route from one process, unchanged from before the split. In
// production these mounts are never reached — Vercel's filesystem routing
// intercepts /api/* at the dedicated function file before this rewrite target
// ever runs. These mounts stay unconditional (not gated by NODE_ENV) so tests
// can exercise them directly via supertest, exactly like app.js did before.
app.post('/api/postcodecheck', postcodecheckHandler);
app.post('/api/validate/mobile', validateMobileHandler);
app.post('/api/validate/landline', validateLandlineHandler);
app.post('/api/validate/email', validateEmailHandler);
app.post('/api/lookup/paf', lookupPafHandler);
app.post('/api/lookup/mobile-payment-type', lookupMobilePaymentTypeHandler);
app.post('/api/sms/send', smsSendHandler);
app.post('/api/sms/verify', smsVerifyHandler);
app.post('/api/lead', leadHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => console.log("Proxy running on http://127.0.0.1:3000"));
}

// Export the Express app
export default app;
