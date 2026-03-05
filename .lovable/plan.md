

## Plan: Stepped Loading Progress Indicator

Since the actual audit is a single async call (no streaming progress from the edge function), we'll simulate timed steps on the frontend that align with the real backend stages.

### Changes

**1. Update `LoadingScreen.tsx`**
- Accept an optional `url` prop for display context
- Define 3 steps: "Scraping website content..." → "Analyzing accessibility..." → "Generating report..."
- Use a `useEffect` timer to auto-advance steps (0s → step 1, 3s → step 2, 8s → step 3)
- Each step shows: a check icon when complete, a spinner when active, a dimmed dot when pending
- Keep the Eye icon animation and "Viewing your website through the blind lens..." heading
- Replace the generic progress bar with a vertical step indicator below the heading
- Use framer-motion for step transitions

**2. No changes to `Index.tsx` or the edge function**
- The loading screen is purely presentational; it unmounts when the audit completes or errors

### Step indicator design
```text
  ✓  Scraping website content       (completed - green check)
  ●  Analyzing accessibility...      (active - pulsing primary dot)
  ○  Generating report               (pending - muted dot)
```

Each step animates in with opacity/translateY. The progress bar at the bottom reflects overall progress (33% → 66% → 100%) using the existing `Progress` component.

