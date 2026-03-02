#!/usr/bin/env node
/**
 * scripts/upload-to-r2.mjs
 *
 * Uploads a local directory of images to the `trueroof-images` R2 bucket.
 *
 * Usage:
 *   node scripts/upload-to-r2.mjs [source-dir]
 *
 * Default source-dir: public/images/
 *
 * Requirements:
 *   - `wrangler` must be installed (it's in devDependencies via the project)
 *   - You must be logged in: run `npx wrangler login` first
 *
 * Examples:
 *   node scripts/upload-to-r2.mjs
 *   node scripts/upload-to-r2.mjs ./assets/images
 *
 * The R2 key is the relative path inside the source dir. For example:
 *   public/images/hero.webp  →  r2 key: hero.webp
 *   public/images/services/tile.webp  →  r2 key: services/tile.webp
 *
 * After upload, reference images in your templates as:
 *   /cdn/hero.webp  (served by src/pages/cdn/[...path].ts)
 */

import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── Configuration ────────────────────────────────────────────────────────────
const BUCKET_NAME = 'trueroof-images';

// Root of the project (one level up from /scripts)
const PROJECT_ROOT = fileURLToPath(new URL('..', import.meta.url));

// Where to read local images from (override via CLI arg)
const sourceDir = process.argv[2]
    ? join(process.cwd(), process.argv[2])
    : join(PROJECT_ROOT, 'public', 'images');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Recursively collect every file path under a directory.
 * @param {string} dir
 * @returns {string[]}
 */
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

/**
 * Derive a MIME content-type string from a file extension.
 * Wrangler uses this to set the correct Content-Type in R2 metadata,
 * which the CDN proxy then forwards to the browser.
 * @param {string} filename
 * @returns {string}
 */
function mimeType(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const map = {
        webp: 'image/webp',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        avif: 'image/avif',
        svg: 'image/svg+xml',
        ico: 'image/x-icon',
        woff2: 'font/woff2',
    };
    return map[ext ?? ''] ?? 'application/octet-stream';
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log(`\n📦  True Roof — R2 Upload Utility`);
console.log(`    Bucket : ${BUCKET_NAME}`);
console.log(`    Source : ${sourceDir}\n`);

let files;
try {
    files = walkDir(sourceDir);
} catch (err) {
    if (err.code === 'ENOENT') {
        console.error(`❌  Source directory not found: ${sourceDir}`);
        console.error(`    Create it and add your images, then run this script again.`);
        console.error(`    Tip: mkdir -p ${sourceDir}`);
        process.exit(1);
    }
    throw err;
}

if (files.length === 0) {
    console.warn('⚠️   No files found in source directory. Nothing to upload.');
    process.exit(0);
}

console.log(`🔍  Found ${files.length} file(s) to upload.\n`);

let uploaded = 0;
let failed = 0;

for (const filePath of files) {
    // The R2 key mirrors the relative path inside `sourceDir`
    const key = relative(sourceDir, filePath);
    const mime = mimeType(filePath);

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
            { stdio: 'pipe' }
        );
        console.log('✅');
        uploaded++;
    } catch (err) {
        console.log('❌  FAILED');
        console.error(`     ${err.stderr?.toString().trim() ?? err.message}`);
        failed++;
    }
}

console.log('\n─────────────────────────────────────────');
console.log(`✅  Uploaded : ${uploaded}`);
if (failed > 0) {
    console.log(`❌  Failed   : ${failed}`);
}
console.log('\n📸  Access your images at:');
console.log(`    https://trueroofnextgen.com/cdn/<key>`);
console.log(`    e.g. https://trueroofnextgen.com/cdn/hero.webp\n`);
