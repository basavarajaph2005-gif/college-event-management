# Implementation Plan: URL-Encoded Banner Sharing

## Overview
Implement a view-only sharing feature that allows users to share a specific banner design via a unique public URL. The design state will be encoded directly into the URL query parameters, eliminating the need for a backend database.

## Plan
1. **Utility Module (`src/utils/shareUtils.ts`)**
   - Implement `encodeBannerContent(content: BannerContent): string` using Base64 encoding.
   - Implement `decodeBannerContent(encoded: string): BannerContent | null` for decoding.

2. **App Initialization (`src/App.tsx`)**
   - Add a `useEffect` hook in `App.tsx` that runs on mount.
   - Check `window.location.search` for a `share` parameter.
   - If present, decode the content and use `setBannerContent` to load the shared design.

3. **Banner Studio UI (`src/components/BannerStudio.tsx`)**
   - Add a "Share Design" button to the Banner Studio header.
   - On click, this button will:
     - Generate the sharing URL: `window.location.origin + '?share=' + encodeBannerContent(content)`.
     - Copy this URL to the user's clipboard.
     - Show a "Link Copied!" toast notification.

## Verification
- Validate that the URL encodes and decodes correctly.
- Ensure the state updates to the shared design upon navigating to the URL.
- Confirm the design is view-only (no editing restrictions needed at the URL level, as the app structure itself enforces this by design, and this implementation is purely for loading state).
