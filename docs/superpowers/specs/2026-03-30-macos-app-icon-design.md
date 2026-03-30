# macOS App Icon Design

Date: 2026-03-30
Status: Approved for planning
Topic: Add a native-feeling macOS app icon for the packaged `.app`

## Context

The current macOS app bundle does not define a dedicated application icon.

- `scripts/build-macos-app.sh` creates the `.app` bundle and `Info.plist`, but does not add an `.icns` asset or set `CFBundleIconFile`.
- The repository currently only contains a web-facing `logo.svg` at `apps/web/public/logo.svg`.
- The user wants the installed macOS `.app` to look like a real Mac application, not a web asset dropped into Finder.

## Goals

- Create a dedicated macOS app icon with a native-feeling visual language.
- Keep the core product symbol as an abstract ring with a center point.
- Shift the color palette from the current bright blue web logo to a neutral silver / blue-gray macOS palette.
- Package the icon into the `.app` so Finder, Dock, and the Applications folder show the new icon.

## Non-Goals

- Redesigning the in-app UI or web branding.
- Creating a DMG disk icon.
- Updating Windows or Android icons.
- Reworking the product symbol into a checkmark or literal sign-in metaphor.

## User-Approved Design Direction

The icon direction is based on the selected `C. Frosted Beacon` concept.

### Visual language

- Native-feeling macOS app icon, not a favicon-style flat mark
- Rounded-square app tile
- Frosted silver / blue-gray base
- Minimal, calm, tool-like presentation
- No text, no badge, no literal checkmark

### Symbol

- Keep the abstract ring motif from the current identity
- Keep a centered point as the focal element
- Avoid adding secondary metaphors that compete with the ring

### Color

- Neutral silver / blue-gray palette
- Slightly cool tone rather than bright saturated blue
- Contrast tuned so the icon remains legible at Dock scale

### Finish

- Soft depth and subtle material feel are allowed
- Should feel closer to a modern macOS utility icon than a marketing illustration
- Restraint is preferred over decorative detail

## Proposed Approach

Add a dedicated macOS icon asset pipeline and wire it into the existing bundle build.

1. Create a source icon asset representing the approved `Frosted Beacon` direction.
2. Export the icon into the sizes needed for a macOS `.iconset`.
3. Convert the `.iconset` into a single `.icns` file.
4. Copy the `.icns` file into `Contents/Resources` during app bundle creation.
5. Add the correct icon key to `Info.plist` so macOS uses the new icon.

## Asset Strategy

The implementation should prefer a repo-owned, editable source asset.

Recommended options, in order:

1. A dedicated SVG source for the macOS icon
2. A generated iconset directory derived from that source
3. A checked-in `.icns` artifact used by the packaging script

The source asset should be kept separate from the existing web logo because the design goals are different.

## Packaging Requirements

The macOS packaging flow should:

- include the icon asset in `Contents/Resources`
- set `CFBundleIconFile` in `Info.plist`
- keep the existing app name and bundle structure unchanged
- continue working whether signing is enabled or skipped

## Verification

Implementation is only correct if all of the following are true:

1. The built `.app` contains the `.icns` asset in `Contents/Resources`.
2. `Info.plist` points to the icon correctly.
3. Finder shows the new icon for the `.app`.
4. The icon is recognizable at small sizes in Finder / Dock.
5. The new icon design still reads as the same product family through the ring-and-center motif.

## Risks

- Reusing the existing web logo directly would produce a non-native result.
- Over-styling the icon would make it feel more like a promotional badge than a Mac utility app.
- If the icon is too low-contrast, the ring motif may disappear at small sizes.
- If only the `.icns` is added without the proper plist key, macOS may continue showing a generic icon.

## Planning Boundary

The next step is to write an implementation plan covering:

- source asset creation or derivation
- `.icns` generation workflow
- bundle script changes
- local verification on macOS Finder / Dock
