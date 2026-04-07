# Extension Icon Design

## Summary

Add a proper extension icon for Reader Tracker so the browser toolbar and extension surfaces show a descriptive, recognizable mark instead of a generic placeholder.

The chosen direction is a mixed document-and-checklist icon that signals both reading structure and tracked progress. The selected visual treatment is a higher-contrast, colorful style so the icon remains legible at small sizes.

## Goals

- Give the extension a clear visual identity in Chrome surfaces
- Reflect the product's purpose: tracking document headings as completed items
- Preserve readability at very small sizes, especially `16x16`

## Non-Goals

- No changes to extension behavior
- No popup or content script redesign
- No branding overhaul beyond adding the icon asset set

## Selected Direction

### Concept

Use a compact document tile with checklist-style rows:

- A square or softly rounded page/container shape
- Two or three horizontal rows to suggest headings or TOC entries
- One completed row with a visible check mark
- Strong dark outline for separation from browser chrome
- Warm but clear accent colors to keep the icon approachable without sacrificing contrast

### Why This Direction

This is the best match for the extension's actual function. Reader Tracker is not just a generic reading app and not just a checklist utility. It turns headings into trackable items, so the icon should emphasize document structure first and completion second.

## Approaches Considered

### 1. TOC Columns Check

Recommended and selected.

Pros:

- Most descriptive of the extension's heading-tracking behavior
- Stays recognizable as both document structure and progress tracking
- Easier to simplify consistently across multiple icon sizes

Cons:

- Slightly busier than a plain page-plus-badge icon

### 2. Page With Floating Check Badge

Not selected.

Pros:

- Clean silhouette
- Easy to read quickly

Cons:

- Weaker signal for headings, TOC, or structural tracking
- Reads more like a generic productivity/check app

### 3. Bookmark Check

Not selected.

Pros:

- Strong reading/bookmark association
- Distinctive shape

Cons:

- Less literal about the extension's heading/checklist behavior
- More likely to imply bookmarking rather than section completion

## Asset Plan

Create one source icon artwork and export these PNG sizes for the extension manifest:

- `16x16`
- `32x32`
- `48x48`
- `128x128`

The manifest should reference the exported icon set using the standard `icons` field. If needed, the action icon can point to the same generated assets.

## Design Constraints

- Optimize the artwork around `16x16` first, not `128x128`
- Keep the row count low enough to avoid visual blur
- Avoid thin strokes that disappear when downscaled
- Use solid fills and clean geometry instead of fine detail
- Ensure the checked row is still distinguishable at the smallest size

## Implementation Shape

### Files

- Add generated icon files under a dedicated asset folder such as `icons/`
- Update `manifest.json` to reference the new assets

### Scope

- Static asset addition only
- Manifest update only
- No JavaScript or CSS changes expected

## Verification

Check the icon in these places after implementation:

- Browser toolbar when the extension is pinned
- Extensions management page
- Any extension picker or overflow menu where smaller icons are shown

Specific verification focus:

- `16x16` remains readable
- Contrast holds up against light and dark browser chrome
- The icon still reads as structured content plus completion, not just a generic checklist

## Risks And Mitigations

### Risk: Small-size blur

Mitigation: simplify internal rows and increase stroke/fill contrast before final export.

### Risk: Icon reads as a generic checklist

Mitigation: preserve the document/container silhouette and row layout so the structural-document cue remains dominant.

### Risk: Overly playful styling reduces clarity

Mitigation: keep color accents restrained and rely on strong outline geometry for recognition.

## Success Criteria

The work is successful if:

- The extension displays a custom icon everywhere Chrome expects one
- The icon is recognizable at `16x16`
- The icon communicates both document structure and tracked completion
- No runtime behavior of the extension changes
