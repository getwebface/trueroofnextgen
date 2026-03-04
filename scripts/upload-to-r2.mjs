#!/usr/bin/env node
/**
 * scripts/upload-to-r2.mjs
 *
 * Context-Aware R2 Upload Utility — True Roof NextGen
 *
 * Uploads media (images + videos) to the `trueroof-images` R2 bucket and
 * generates / updates `src/data/media-manifest.json` so the SmartMedia
 * component can score and select the best asset for any given context.
 *
 * ── File Naming Standard ──────────────────────────────────────────────────────
 *   [type]-[keyword1]-[keyword2]-[weather].ext
 *
 *   type    : "img" (image) | "vid" (video)
 *   keywords: one or more descriptive words separated by hyphens
 *   weather : final segment — one of: sunny | rain | storm | wind | frost |
 *             overcast | hot | clear | all  (use "all" for weather-agnostic)
 *
 *   Examples:
 *     img-terracotta-repair-sunny.jpg
 *     img-ridge-cap-rebedding-storm.webp
 *     vid-drone-inspection-all.mp4
 *     vid-coating-timelapse-clear.webm
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 *   node scripts/upload-to-r2.mjs [source-dir]
 *
 *   Default source-dir: public/media/
 *
 * ── Requirements ──────────────────────────────────────────────────────────────
 *   - wrangler must be installed (it's in devDependencies)
 *   - You must be logged in: npx wrangler login
 */

import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, relative, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── Configuration ────────────────────────────────────────────────────────────
const BUCKET_NAME = 'trueroof-images';

/** Root of the project (one level up from /scripts) */
const PROJECT_ROOT = fileURLToPath(new URL('..', import.meta.url));

/** Where to read local media from (CLI arg or default) */
const sourceDir = process.argv[2]
    ? join(process.cwd(), process.argv[2])
    : join(PROJECT_ROOT, 'public', 'media');

/** Where the manifest lives inside the project */
const MANIFEST_PATH = join(PROJECT_ROOT, 'src', 'data', 'media-manifest.json');

// ─── Known weather affinity tokens ───────────────────────────────────────────
const WEATHER_TOKENS = new Set([
    'sunny', 'rain', 'storm', 'wind', 'frost', 'overcast', 'hot', 'clear', 'all',
]);

// ─── MIME map ─────────────────────────────────────────────────────────────────
function mimeType(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const map = {
        // Images
        webp: 'image/webp',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        avif: 'image/avif',
        svg: 'image/svg+xml',
        ico: 'image/x-icon',
        // Videos
        mp4: 'video/mp4',
        webm: 'video/webm',
        mov: 'video/quicktime',
        // Fonts
        woff2: 'font/woff2',
    };
    return map[ext ?? ''] ?? 'application/octet-stream';
}

// ─── Parse filename → manifest fields ────────────────────────────────────────
/**
 * Parse a media filename into its semantic components.
 *
 * Naming convention:  [type]-[kw1]-[kw2]-...-[weather].ext
 *
 * Returns null if the file does not follow the convention (it will still be
 * uploaded, but won't appear in the manifest).
 *
 * @param {string} filename  e.g. "img-terracotta-repair-sunny.jpg"
 * @returns {{ type: 'image'|'video', keywords: string[], weather_affinity: string } | null}
 */
function parseFilename(filename) {
    const nameWithoutExt = basename(filename, extname(filename));
    const parts = nameWithoutExt.split('-');

    if (parts.length < 3) return null;

    // First segment determines media type
    const typePrefix = parts[0].toLowerCase();
    let type;
    if (typePrefix === 'img') {
        type = 'image';
    } else if (typePrefix === 'vid') {
        type = 'video';
    } else {
        // Not following convention — skip manifest entry
        return null;
    }

    // Last segment is weather affinity (if recognised), otherwise treat as keyword
    const lastPart = parts[parts.length - 1].toLowerCase();
    let weather_affinity;
    let keywordParts;

    if (WEATHER_TOKENS.has(lastPart)) {
        weather_affinity = lastPart;
        keywordParts = parts.slice(1, -1); // strip type prefix + weather suffix
    } else {
        weather_affinity = 'all';
        keywordParts = parts.slice(1); // strip type prefix only
    }

    const keywords = keywordParts.filter(Boolean);
    if (keywords.length === 0) return null;

    return { type, keywords, weather_affinity };
}

// ─── Recursive directory walker ───────────────────────────────────────────────
function walkDir(dir) {
    const entries = readdirSync(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...walkDir(fullPath));
        } else {
            files.push(fullPath);
        }
    }
    return files;
}

// ─── Load / initialise manifest ───────────────────────────────────────────────
function loadManifest() {
    if (existsSync(MANIFEST_PATH)) {
        try {
            return JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
        } catch {
            console.warn('⚠️   Existing manifest is malformed — starting fresh.');
        }
    }
    return [];
}

function saveManifest(entries) {
    mkdirSync(dirname(MANIFEST_PATH), { recursive: true });
    writeFileSync(MANIFEST_PATH, JSON.stringify(entries, null, 2), 'utf-8');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log(`\n📦  True Roof — Context-Aware R2 Upload Utility`);
console.log(`    Bucket   : ${BUCKET_NAME}`);
console.log(`    Source   : ${sourceDir}`);
console.log(`    Manifest : ${MANIFEST_PATH}\n`);

let files;
try {
    files = walkDir(sourceDir);
} catch (err) {
    if (err.code === 'ENOENT') {
        console.error(`❌  Source directory not found: ${sourceDir}`);
        console.error(`    Create it, add your media files, then run this script again.`);
        console.error(`    Tip: mkdir -p ${sourceDir}`);
        process.exit(1);
    }
    throw err;
}

if (files.length === 0) {
    console.warn('⚠️   No files found in source directory. Nothing to upload.');
    process.exit(0);
}

console.log(`🔍  Found ${files.length} file(s) to process.\n`);

// Load existing manifest so we can upsert entries
const manifest = loadManifest();
// Build a lookup by url for easy upsert
const manifestByUrl = new Map(manifest.map(entry => [entry.url, entry]));

let uploaded = 0;
let failed = 0;
let skipped = 0;
let manifestUpdated = 0;

for (const filePath of files) {
    const key = relative(sourceDir, filePath);
    const mime = mimeType(filePath);
    const r2Url = `/cdn/${key}`;
    const fname = basename(filePath);

    process.stdout.write(`  ↑  ${key} ... `);

    try {
        execFileSync(
            'npx',
            [
                'wrangler',
                'r2', 'object', 'put',
                `${BUCKET_NAME}/${key}`,
                '--file', filePath,
                '--content-type', mime,
            ],
            { stdio: 'pipe' },
        );
        console.log('✅');
        uploaded++;
    } catch (err) {
        console.log('❌  FAILED');
        console.error(`     ${err.stderr?.toString().trim() ?? err.message}`);
        failed++;
        continue; // Don't add failed uploads to the manifest
    }

    // ── Manifest entry ──────────────────────────────────────────────────────
    const parsed = parseFilename(fname);

    if (!parsed) {
        console.log(`     ⚠️  Filename "${fname}" does not follow the naming convention.`);
        console.log(`        Expected: [img|vid]-[kw1]-[kw2]-[weather].ext`);
        console.log(`        This file was uploaded but will NOT appear in the SmartMedia manifest.`);
        skipped++;
        continue;
    }

    const existingEntry = manifestByUrl.get(r2Url);

    const entry = {
        url: r2Url,
        type: parsed.type,
        keywords: parsed.keywords,
        weather_affinity: parsed.weather_affinity,
        // Preserve any manually-tweaked base_score; default to 1.0 for new entries
        base_score: existingEntry?.base_score ?? 1.0,
    };

    manifestByUrl.set(r2Url, entry);
    manifestUpdated++;
    console.log(`     📋  Manifest entry → type="${parsed.type}" keywords=[${parsed.keywords.join(', ')}] weather="${parsed.weather_affinity}"`);
}

// Write updated manifest
const finalManifest = Array.from(manifestByUrl.values());
saveManifest(finalManifest);

console.log('\n─────────────────────────────────────────────────────────────');
console.log(`✅  Uploaded        : ${uploaded}`);
if (failed > 0) console.log(`❌  Failed          : ${failed}`);
if (skipped > 0) console.log(`⚠️   Skipped manifest: ${skipped} (non-standard filenames)`);
console.log(`📋  Manifest entries: ${finalManifest.length} total (${manifestUpdated} added/updated)`);
console.log(`    Written to: ${MANIFEST_PATH}`);
console.log('\n📸  Access your media at:');
console.log(`    https://trueroofnextgen.com/cdn/<key>`);
console.log(`    e.g. https://trueroofnextgen.com/cdn/img-hero-terracotta-sunny.webp\n`);
