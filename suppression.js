/**
 * Suppression list endpoints — backed by Vercel Blob.
 *
 * POST /api/opt-out                            – append an entry to today's CSV blob
 * GET  /api/suppression/files                  – list all CSV blobs (auth required)
 * GET  /api/suppression/download/:filename     – download a CSV and mark it (auth required)
 *
 * Requires BLOB_READ_WRITE_TOKEN in the environment.
 * Set up: Vercel Dashboard → Storage → Blob → connect project → vercel env pull
 */

import { Router } from "express";
import { put, list } from "@vercel/blob";

const BLOB_PREFIX = "suppressions/";
const META_PATH = `${BLOB_PREFIX}meta.json`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Private blobs require the token in the Authorization header to read.
function fetchBlob(url) {
  return fetch(url, {
    headers: { authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });
}

function todayFilename() {
  return `suppressions_${new Date().toISOString().slice(0, 10)}.csv`;
}

function normalisePhone(raw) {
  if (!raw) return "";
  const s = String(raw).trim().replace(/\s+/g, "");
  if (s.startsWith("+")) return s;
  if (s.startsWith("00")) return "+" + s.slice(2);
  if (s.startsWith("0")) return "+31" + s.slice(1);
  return s;
}

async function readMeta() {
  try {
    const { blobs } = await list({ prefix: META_PATH });
    if (blobs.length === 0) return {};
    const res = await fetchBlob(blobs[0].url);
    return await res.json();
  } catch {
    return {};
  }
}

async function writeMeta(meta) {
  await put(META_PATH, JSON.stringify(meta, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

function requireBasicAuth(req, res, next) {
  const auth = req.headers["authorization"] ?? "";
  if (!auth.startsWith("Basic ")) {
    res.set("WWW-Authenticate", 'Basic realm="Suppression"');
    return res.status(401).send("Unauthorized");
  }
  const decoded = Buffer.from(auth.slice(6), "base64").toString();
  const colon = decoded.indexOf(":");
  const user = decoded.slice(0, colon);
  const pass = decoded.slice(colon + 1);
  if (
    user !== process.env.SUPPRESSION_USER ||
    pass !== process.env.SUPPRESSION_PASS
  ) {
    res.set("WWW-Authenticate", 'Basic realm="Suppression"');
    return res.status(401).send("Unauthorized");
  }
  next();
}

// ─── Router ───────────────────────────────────────────────────────────────────

const router = Router();

// POST /api/opt-out   { email, mobile }
router.post("/opt-out", async (req, res) => {
  try {
    const email = String(req.body.email ?? "").trim();
    const phone = normalisePhone(req.body.mobile ?? req.body.phone ?? "");
    if (!email && !phone) {
      return res.status(400).json({ error: "email or mobile is required" });
    }

    const blobPath = `${BLOB_PREFIX}${todayFilename()}`;
    const { blobs } = await list({ prefix: blobPath });

    let content = "phone,email\n";
    if (blobs.length > 0) {
      const existing = await fetchBlob(blobs[0].url);
      content = await existing.text();
    }
    content += `${phone},${email}\n`;

    await put(blobPath, content, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/suppression/files
router.get("/suppression/files", requireBasicAuth, async (req, res) => {
  try {
    const { blobs } = await list({ prefix: BLOB_PREFIX });
    const meta = await readMeta();

    const files = blobs
      .filter((b) => b.pathname.endsWith(".csv"))
      .sort((a, b) => b.pathname.localeCompare(a.pathname))
      .map((b) => {
        const filename = b.pathname.replace(BLOB_PREFIX, "");
        return {
          filename,
          size: b.size,
          createdAt: b.uploadedAt,
          downloadedAt: meta[filename]?.downloadedAt ?? null,
        };
      });

    res.render("suppression/files", { files });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/suppression/download/:filename
router.get(
  "/suppression/download/:filename",
  requireBasicAuth,
  async (req, res) => {
    try {
      const { filename } = req.params;
      if (
        filename.includes("..") ||
        filename.includes("/") ||
        !filename.endsWith(".csv")
      ) {
        return res.status(400).json({ error: "Invalid filename" });
      }

      const { blobs } = await list({ prefix: `${BLOB_PREFIX}${filename}` });
      if (blobs.length === 0) {
        return res.status(404).json({ error: "File not found" });
      }

      const meta = await readMeta();
      meta[filename] = {
        ...meta[filename],
        downloadedAt: new Date().toISOString(),
      };
      await writeMeta(meta);

      const blobRes = await fetchBlob(blobs[0].url);
      const content = await blobRes.text();
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "text/csv");
      res.send(content);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  }
);

export default router;
