/**
 * Suppression list endpoints.
 *
 * POST /api/opt-out                            – append an entry to today's CSV
 * GET  /api/suppression/files                  – list all CSV files (auth required)
 * GET  /api/suppression/download/:filename     – download a CSV and mark it (auth required)
 */

import { Router } from "express";
import fs from "fs";
import { promises as fsp } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SUPPRESSION_DIR = join(__dirname, "data", "suppressions");
const SUPPRESSION_META = join(SUPPRESSION_DIR, "meta.json");

fs.mkdirSync(SUPPRESSION_DIR, { recursive: true });

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  try { return JSON.parse(await fsp.readFile(SUPPRESSION_META, "utf8")); }
  catch { return {}; }
}

async function writeMeta(meta) {
  await fsp.writeFile(SUPPRESSION_META, JSON.stringify(meta, null, 2));
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
    const filepath = join(SUPPRESSION_DIR, todayFilename());
    const isNew = !fs.existsSync(filepath);
    const line = `${phone},${email}\n`;
    if (isNew) {
      await fsp.writeFile(filepath, "phone,email\n" + line);
    } else {
      await fsp.appendFile(filepath, line);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/suppression/files
router.get("/suppression/files", requireBasicAuth, async (req, res) => {
  try {
    const entries = await fsp.readdir(SUPPRESSION_DIR);
    const meta = await readMeta();
    const files = await Promise.all(
      entries
        .filter((f) => f.endsWith(".csv"))
        .sort()
        .reverse()
        .map(async (filename) => {
          const stat = await fsp.stat(join(SUPPRESSION_DIR, filename));
          return {
            filename,
            size: stat.size,
            createdAt: stat.birthtime,
            downloadedAt: meta[filename]?.downloadedAt ?? null,
          };
        })
    );

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
      const filepath = join(SUPPRESSION_DIR, filename);
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: "File not found" });
      }
      const meta = await readMeta();
      meta[filename] = {
        ...meta[filename],
        downloadedAt: new Date().toISOString(),
      };
      await writeMeta(meta);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "text/csv");
      fs.createReadStream(filepath).pipe(res);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  }
);

export default router;