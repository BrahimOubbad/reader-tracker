# Reader Tracker Extension Icon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a descriptive extension icon set that matches the approved document-plus-checklist design and wire it into the Chrome extension manifest.

**Architecture:** Add one source SVG in a dedicated `icons/` folder, export the required PNG sizes from that source, and reference them through the manifest `icons` field and action icon. No runtime JavaScript or CSS behavior changes are needed.

**Tech Stack:** Chrome Extension Manifest V3, static SVG/PNG assets, existing plain HTML/JS extension files

---

## File Structure

- Create: `icons/icon.svg`
- Create: `icons/icon-16.png`
- Create: `icons/icon-32.png`
- Create: `icons/icon-48.png`
- Create: `icons/icon-128.png`
- Modify: `manifest.json`

`icons/icon.svg` is the editable source of truth for the icon artwork. The PNG files are generated artifacts for Chrome surfaces. `manifest.json` references the generated assets.

### Task 1: Add The Source Icon Artwork

**Files:**
- Create: `icons/icon.svg`

- [ ] **Step 1: Create the `icons/` directory**

Run: `mkdir -p icons`
Expected: command exits successfully with no output.

- [ ] **Step 2: Add the approved SVG artwork**

Write `icons/icon.svg` with this content:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Reader Tracker icon">
  <rect x="22" y="18" width="84" height="92" rx="16" fill="#ffffff" stroke="#0f172a" stroke-width="7"/>
  <rect x="36" y="34" width="12" height="12" rx="3" fill="#2563eb"/>
  <line x1="56" y1="40" x2="88" y2="40" stroke="#0f172a" stroke-width="7" stroke-linecap="round"/>
  <rect x="36" y="56" width="12" height="12" rx="3" fill="#7c3aed"/>
  <line x1="56" y1="62" x2="82" y2="62" stroke="#0f172a" stroke-width="7" stroke-linecap="round"/>
  <rect x="36" y="78" width="12" height="12" rx="3" fill="#16a34a"/>
  <path d="M37 84 L41 88 L48 80" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="56" y1="84" x2="76" y2="84" stroke="#0f172a" stroke-width="7" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 3: Verify the SVG file contents**

Run: `sed -n '1,120p' icons/icon.svg`
Expected: output matches the SVG above and includes the document container, three checklist rows, and one checked item.

- [ ] **Step 4: Commit the source artwork**

```bash
git add icons/icon.svg
git commit -m "feat: add extension icon source artwork"
```

### Task 2: Export Chrome Icon Sizes

**Files:**
- Modify: `icons/icon.svg`
- Create: `icons/icon-16.png`
- Create: `icons/icon-32.png`
- Create: `icons/icon-48.png`
- Create: `icons/icon-128.png`

- [ ] **Step 1: Check which raster export tool is available**

Run: `command -v magick || command -v convert`
Expected: output prints a path to ImageMagick. If neither command exists, stop and install ImageMagick before proceeding.

- [ ] **Step 2: Export the required PNG sizes from the SVG**

If `magick` exists, run:

```bash
magick -background none icons/icon.svg -resize 16x16 icons/icon-16.png
magick -background none icons/icon.svg -resize 32x32 icons/icon-32.png
magick -background none icons/icon.svg -resize 48x48 icons/icon-48.png
magick -background none icons/icon.svg -resize 128x128 icons/icon-128.png
```

If only `convert` exists, run:

```bash
convert -background none icons/icon.svg -resize 16x16 icons/icon-16.png
convert -background none icons/icon.svg -resize 32x32 icons/icon-32.png
convert -background none icons/icon.svg -resize 48x48 icons/icon-48.png
convert -background none icons/icon.svg -resize 128x128 icons/icon-128.png
```

Expected: four PNG files are created with no command errors.

- [ ] **Step 3: Verify the generated assets exist**

Run: `ls -l icons/icon.svg icons/icon-16.png icons/icon-32.png icons/icon-48.png icons/icon-128.png`
Expected: all five files are listed and each PNG has a non-zero size.

- [ ] **Step 4: Sanity-check the image dimensions**

If `magick` exists, run:

```bash
magick identify icons/icon-16.png icons/icon-32.png icons/icon-48.png icons/icon-128.png
```

If only `identify` exists, run:

```bash
identify icons/icon-16.png icons/icon-32.png icons/icon-48.png icons/icon-128.png
```

Expected: dimensions read exactly `16x16`, `32x32`, `48x48`, and `128x128`.

- [ ] **Step 5: Commit the exported icon set**

```bash
git add icons/icon-16.png icons/icon-32.png icons/icon-48.png icons/icon-128.png
git commit -m "feat: export extension icon assets"
```

### Task 3: Wire Icons Into The Manifest

**Files:**
- Modify: `manifest.json`

- [ ] **Step 1: Write a failing check for missing manifest icons**

Run: `rg -n '"icons"|"default_icon"' manifest.json`
Expected: before the change, no `icons` field is present and no `default_icon` field is present under `action`.

- [ ] **Step 2: Update `manifest.json` to reference the icon set**

Replace `manifest.json` with this content:

```json
{
  "manifest_version": 3,
  "name": "Reader Tracker",
  "version": "1.1",
  "description": "Turn headings into checkboxes and track reading progress with collapsible sections",
  "permissions": ["storage"],
  "icons": {
    "16": "icons/icon-16.png",
    "32": "icons/icon-32.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png",
      "48": "icons/icon-48.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["styles.css"]
    }
  ]
}
```

- [ ] **Step 3: Verify the manifest now includes the icon references**

Run: `sed -n '1,220p' manifest.json`
Expected: `icons` exists at the top level and `action.default_icon` exists with the expected file paths.

- [ ] **Step 4: Commit the manifest wiring**

```bash
git add manifest.json
git commit -m "feat: wire extension icons into manifest"
```

### Task 4: Verify In Chrome

**Files:**
- Test: `manifest.json`
- Test: `icons/icon-16.png`
- Test: `icons/icon-32.png`
- Test: `icons/icon-48.png`
- Test: `icons/icon-128.png`

- [ ] **Step 1: Review the final file set locally**

Run: `git status --short`
Expected: only the intended icon files and `manifest.json` are modified or newly added.

- [ ] **Step 2: Reload the unpacked extension in Chrome**

Manual action:

1. Open `chrome://extensions`
2. Enable Developer mode if it is not already enabled
3. Click Reload on the Reader Tracker extension, or use Load unpacked if this branch has not been loaded yet

Expected: Chrome reloads the extension without manifest errors.

- [ ] **Step 3: Verify icon readability in Chrome surfaces**

Manual checks:

1. Confirm the toolbar icon appears when the extension is pinned
2. Confirm the icon appears on the extensions management page
3. Confirm the smallest rendered icon still reads as a structured document with one completed item

Expected: the icon is visible, crisp enough at small sizes, and no generic placeholder icon appears.

- [ ] **Step 4: If the `16x16` icon is blurry, simplify before re-export**

Edit `icons/icon.svg` by removing one checklist row and slightly increasing the check and line thickness, then repeat Task 2 before continuing.

Use this simplified SVG if needed:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Reader Tracker icon">
  <rect x="22" y="18" width="84" height="92" rx="16" fill="#ffffff" stroke="#0f172a" stroke-width="8"/>
  <rect x="36" y="42" width="14" height="14" rx="3" fill="#2563eb"/>
  <line x1="58" y1="49" x2="88" y2="49" stroke="#0f172a" stroke-width="8" stroke-linecap="round"/>
  <rect x="36" y="72" width="14" height="14" rx="3" fill="#16a34a"/>
  <path d="M38 79 L43 84 L51 74" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="58" y1="79" x2="80" y2="79" stroke="#0f172a" stroke-width="8" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 5: Commit the verified final state**

```bash
git add icons/icon.svg icons/icon-16.png icons/icon-32.png icons/icon-48.png icons/icon-128.png manifest.json
git commit -m "feat: add Reader Tracker extension icons"
```
