export const CBS_TIMEOUTS = {
  ELEMENT:    10_000,
  AJAX:        8_000,   // was 30s — CBS background polling was burning full timeout
  TOAST:      10_000,   // was 15s
  NAVIGATION: 30_000,
  LOGIN:      30_000,
  SHORT:       2_000,   // was 3s
  SAVE:       10_000,
} as const;
