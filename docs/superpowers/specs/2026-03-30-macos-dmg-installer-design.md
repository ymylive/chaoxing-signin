# macOS DMG Installer Design

Date: 2026-03-30
Status: Approved for planning
Topic: Replace the current minimal DMG with a standard macOS installer disk layout

## Context

The current macOS packaging script creates the DMG by compressing the app bundle directly:

```bash
hdiutil create -volname "${APP_NAME}" -srcfolder "${APP_DIR}" -ov -format UDZO "dist/${DMG_NAME}"
```

This produces a disk image that only contains the `.app` bundle. It does not include an `Applications` alias, Finder window layout, icon placement, or any installer affordance. As a result:

- Users cannot perform the normal drag-to-install flow.
- The DMG window looks unfinished and inconsistent with standard macOS distribution patterns.
- Project documentation says users should drag the app into `Applications`, but the release artifact does not support that flow.

## Goals

- Produce a standard macOS installer DMG that supports drag-to-install.
- Make the mounted DMG visually match a classic macOS installation disk.
- Keep the implementation inside the existing shell-based packaging flow.
- Ensure the output is stable when the DMG is reopened.

## Non-Goals

- Redesigning the app icon or in-app UI.
- Introducing external packaging dependencies such as `create-dmg`.
- Solving notarization, Gatekeeper, or code-signing policy beyond preserving current behavior.
- Adding branded marketing artwork to the installer window.

## User Experience

When a user opens the DMG, Finder should show a classic installer layout:

- Left: `超星学习通签到.app`
- Right: `Applications` alias
- Middle: a light visual cue such as an arrow
- Window size is fixed and intentionally composed
- Visual style is minimal and close to native macOS expectations
- Background is plain white or a very light neutral background
- No promotional copy or decorative branding

The intended user action is obvious without additional explanation: drag the app to `Applications`.

## Proposed Approach

Use a two-stage DMG creation flow in `scripts/build-macos-app.sh`.

### Stage 1: Build app bundle

Retain the existing app bundle creation flow:

- create `.app` bundle structure
- copy executables
- write `Info.plist`
- write `PkgInfo`
- optionally sign the app

This stage should remain functionally equivalent to the current behavior.

### Stage 2: Build a staged installer disk

Replace the current one-line DMG creation with a staged process:

1. Create a temporary writable DMG sized for the app bundle plus installer assets.
2. Mount the writable DMG.
3. Copy `超星学习通签到.app` into the mounted volume.
4. Create an `Applications` alias in the mounted volume.
5. Optionally add a hidden background asset if needed for the final visual.
6. Use AppleScript and Finder to configure:
   - window size
   - icon view mode
   - toolbar/status bar visibility
   - icon size
   - text size if needed
   - icon positions for app and `Applications`
   - optional background image
7. Flush filesystem metadata and detach the mounted volume.
8. Convert the writable image to a compressed read-only DMG for distribution.
9. Remove temporary artifacts.

## Visual Specification

The installer should look like a classic macOS app distribution disk.

### Layout

- Window width should be wide enough to separate source app and destination alias cleanly.
- The app icon should sit on the left third of the window.
- The `Applications` alias should sit on the right third.
- A light arrow asset may be placed between them if Finder background composition requires it.

### Styling

- Prefer Finder-native appearance over custom branding.
- Use white or near-white background.
- Avoid gradients, dark themes, heavy typography, or hero graphics.
- If a background asset is required, it should be subtle enough to read as native rather than promotional.

### Asset policy

- Add at most the minimal assets required for the layout.
- Prefer no background image if Finder layout alone is sufficient.
- If an arrow is used, keep it neutral and understated.

## Implementation Details

### Script changes

The main changes belong in `scripts/build-macos-app.sh`.

The script should:

- create temporary writable DMG paths
- mount and capture the device path and mount point reliably
- create the `Applications` alias with a native macOS mechanism
- run AppleScript only after the volume is mounted and Finder can see it
- wait long enough for Finder metadata to persist before detach
- convert the temporary image into the final compressed DMG

### Finder automation

Finder scripting is acceptable here because the target platform is macOS and the output is a Finder-oriented artifact.

The script should explicitly set:

- current view to icon view
- toolbar visibility to false
- status bar visibility to false
- window bounds
- arrangement to not arranged
- icon size
- icon positions

If a background image is used, it should live in a hidden folder such as `.background` inside the mounted image.

### Reliability considerations

- Mount point parsing must be deterministic.
- Temporary files must be cleaned up even if a later step fails.
- The script should fail loudly if alias creation, AppleScript configuration, detach, or conversion fails.
- The final DMG file name should stay compatible with existing release expectations, or documentation must be updated in the same implementation if the name changes.

## Verification

Implementation is only considered correct if these checks pass:

1. Opening the DMG shows both the app and an `Applications` target.
2. The user can drag the app onto `Applications`.
3. Reopening the DMG preserves the intended Finder layout.
4. The app bundle remains launchable after being copied to `/Applications`.
5. The packaging script works without requiring new third-party packaging tools.

Manual verification is expected because Finder layout is visual and platform-specific.

## Risks

- Finder automation can be timing-sensitive on CI or slower machines.
- Alias creation can differ from plain symlink creation; using the wrong mechanism would degrade the native install experience.
- If a background asset is used, path handling inside the mounted volume must match Finder expectations exactly.
- Unsigned apps may still trigger macOS security prompts; this is a separate concern from installer layout and should not be conflated with DMG correctness.

## Open Decisions Resolved

- Visual direction: classic macOS installer layout
- Branding level: minimal, effectively native
- Tooling: existing shell script, no external DMG packaging dependency
- Primary issue to solve first: missing drag-to-install target in the DMG

## Planning Boundary

The next step is to write an implementation plan that covers:

- shell-script changes
- any new installer assets
- local verification flow on macOS
- whether README or macOS installation docs need a naming or behavior update
