# Media Upload Guide — True Roof NextGen
## Standard Operating Procedure (SOP) for the SmartMedia System

> **Version:** 1.0 — March 2026
> **Maintainer:** Website Admin Team

---

## Overview

The True Roof website automatically selects the most contextually relevant image or video for every section of the site based on:

1. **Current weather** in the visitor's city (sunny, storm, rain, frost, etc.)
2. **Page context** (hero background, service card thumbnail, location grid thumbnail, process steps, promo card, texture section)
3. **A daily rotation algorithm** — the best-scoring asset changes once per day to keep the site feeling fresh without layout thrashing on reload.

**Your only job as a contributor is to name the file correctly and run one command.**

---

## Step 1 — File Naming Convention

> ⚠️ **Critical.** Files that do not follow this convention will still upload to R2, but they will NOT appear in the SmartMedia scoring system and will never be auto-selected.

### Format

```
[type]-[keyword1]-[keyword2]-...-[weather].ext
```

| Segment | Required | Values | Example |
|---------|----------|--------|---------|
| `type` | ✅ | `img` or `vid` | `img` |
| `keyword(s)` | ✅ | One or more words, separated by hyphens. Use descriptive terms that match page context (see keyword table below). | `terracotta-repair` |
| `weather` | ✅ | One of: `sunny` `rain` `storm` `wind` `frost` `overcast` `hot` `clear` `all` | `sunny` |
| `.ext` | ✅ | Image: `.jpg` `.jpeg` `.webp` `.png` `.avif` — Video: `.mp4` `.webm` | `.jpg` |

### Valid Examples

```
img-terracotta-repair-sunny.jpg          ✅ image, repair context, sunny weather
img-ridge-cap-rebedding-storm.webp       ✅ image, ridge cap context, storm weather
img-roof-inspection-all.jpg              ✅ image, inspection context, any weather
img-melbourne-cleaning-rain.webp         ✅ image, cleaning + city context, rain
vid-drone-inspection-all.mp4             ✅ video, drone footage, any weather
vid-coating-timelapse-clear.mp4          ✅ video, coating timelapse, clear weather
vid-hero-roof-restoration-sunny.mp4      ✅ video, hero placement, sunny
```

### Invalid Examples (will not appear in SmartMedia)

```
hero-image.jpg         ❌ — no type prefix (img/vid) and no weather suffix
RoofPhoto_Final.jpg    ❌ — uppercase, underscores, no type/weather
drone_vid.mp4          ❌ — underscores, no type prefix, no weather suffix
image.webp             ❌ — no keywords or type prefix
```

### Useful Keywords by Context

| Page / Section | Recommended Keywords | Example Usages |
|----------------|----------------------|----------------|
| Homepage Hero | `hero`, `roof`, `melbourne` | `vid-hero-roof-sunny.mp4` |
| Service Pages (Hero) | `service`, `<slug-words>` | `img-service-metal-flashings-all.jpg` |
| Service Cards (Grid) | `service`, `<slug-words>` | `img-service-tiled-restoration-all.webp` |
| Location Cards (Grid) | `location`, `<suburb-name>` | `img-location-wallan-all.jpg` |
| Process Steps | `cleaning`, `structual`, `rebedding`, `coating` | `img-cleaning-pressure-all.webp` |
| Pricing Cards | `cleaning`, `pointing`, `restoration` | `img-restoration-premium-all.jpg` |
| TextureTechnology section | `texture`, `membrane`, `coating`, `tile` | `vid-texture-membrane-all.mp4` |
| PromoCard / general | `promo`, `discount`, `offer`, `inspection` | `img-promo-discount-all.jpg` |

---

## Step 2 — Prepare Your Files

1. **Create the media directory** if it doesn't exist:

   ```bash
   mkdir -p public/media
   ```

2. **Rename your files** to follow the naming convention — do this *before* running the upload script. Batch rename with any tool you prefer (Finder, Explorer, or `mv` in terminal).

3. **Place renamed files** into `public/media/`. Subdirectories are fine and will be preserved as the R2 key:

   ```
   public/media/
   ├── img-terracotta-repair-sunny.webp
   ├── img-ridge-cap-storm.jpg
   ├── vid-drone-inspection-all.mp4
   └── services/
       └── img-coating-timelapse-clear.webp
   ```

---

## Step 3 — Run the Upload Script

```bash
node scripts/upload-to-r2.mjs
```

**Optional: specify a custom source directory:**

```bash
node scripts/upload-to-r2.mjs ./path/to/my/media
```

### What the Script Does

1. Recursively scans `public/media/` for all files.
2. Uploads each file to the `trueroof-images` R2 bucket via Wrangler.
3. Parses the filename to extract `type`, `keywords`, and `weather_affinity`.
4. **Upserts** `src/data/media-manifest.json` — adding new entries and preserving any manually-adjusted `base_score` values on existing ones.
5. Reports a summary: files uploaded, manifest entries written.

### Prerequisites

- You must be authenticated with Wrangler. If you haven't already:

  ```bash
  npx wrangler login
  ```

- `node` v18+ is required (check with `node --version`).

---

## Step 4 — Optionally Adjust `base_score`

After running the script, `src/data/media-manifest.json` will contain an entry for each uploaded file. Each entry has a `base_score` property (default: `1.0`).

**You can manually increase `base_score` to promote a specific asset:**

```json
{
  "url": "/cdn/img-terracotta-hero-sunny.webp",
  "type": "image",
  "keywords": ["terracotta", "hero"],
  "weather_affinity": "sunny",
  "base_score": 2.5
}
```

Scores above 1.0 will bias the algorithm toward this asset in relevant contexts. Scores of 0 will effectively hide the asset. Running the script again after adding new files will preserve your custom `base_score` values.

---

## Video Best Practices

> [!IMPORTANT]
> Follow these guidelines *before* uploading. Videos are delivered unprocessed from R2 — the browser streams them directly.

| Rule | Detail |
|------|--------|
| **File size** | Keep under **5 MB** per video. Aim for 2–3 MB for background loops. |
| **Format** | Prefer **MP4 (H.264)** for maximum compatibility. Add a `.webm` (VP9) version for modern browsers if possible. |
| **Resolution** | 1920×1080 is ideal. 1280×720 is acceptable for background use. Avoid 4K — it will cause buffering. |
| **Duration** | Keep loops short: **4–15 seconds**. Background videos loop continuously — shorter = less data. |
| **Audio** | **No audio track.** Strip it before uploading. Videos autoplay `muted` but having an audio track wastes bandwidth. |
| **Frame rate** | 24fps is perfectly fine for background cinematic loops. |
| **Content** | Avoid text or important details in the video — it's a background element. Focus on mood, movement, and texture. |

### Strip Audio (ffmpeg — one command)

```bash
ffmpeg -i input.mp4 -an -c:v copy output-noaudio.mp4
```

### Compress + Strip Audio in One Pass

```bash
ffmpeg -i input.mp4 -an -vcodec libx264 -crf 26 -preset slow -movflags +faststart output.mp4
```

A `crf` of 24–28 is a good range for background video quality vs. file size.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| File uploaded but not appearing on site | Check the filename follows the naming convention exactly |
| `wrangler: not found` error | Run `npx wrangler login` and retry |
| Manifest not updating | Check the `src/data/` directory is writable |
| Want to remove an asset | Delete its entry from `media-manifest.json` (the file remains in R2 unless manually deleted via Cloudflare dashboard) |
| `base_score` was reset | The script only resets `base_score` for *new* entries. Existing entries' scores are preserved. |

---

## Architecture Reference

```
Upload Flow:
  public/media/[named-file.ext]
    │
    ▼  node scripts/upload-to-r2.mjs
    ├── → R2 Bucket: trueroof-images
    │       └── Accessible at: /cdn/<key>
    │
    └── → src/data/media-manifest.json
             └── Read at build time by SmartMedia.astro

Scoring Flow (per page render):
  SmartMedia.astro receives contextKeywords + preferredType
    │
    ├── Reads media-manifest.json
    ├── Reads Astro.locals.weatherContext.event
    ├── Scores each entry:
    │     +2 for weather_affinity match
    │     +1 per matching contextKeyword
    │     × base_score multiplier
    ├── Top-3 candidates selected
    └── Daily hash (YYYYMMDD + keywords) picks the winner
         → Renders <picture> or <video> with scanline overlay
```
