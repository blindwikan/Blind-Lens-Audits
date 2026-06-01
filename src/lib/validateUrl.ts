/**
 * validateUrl — the "bouncer" for the audit form.
 *
 * Returns a human-friendly error string if the URL is invalid,
 * or null if everything looks good.
 */

// Private/local addresses that can't be reached from the internet
const PRIVATE_PATTERNS = [
  /^https?:\/\/localhost/i,
  /^https?:\/\/127\./,
  /^https?:\/\/192\.168\./,
  /^https?:\/\/10\./,
  /^https?:\/\/172\.(1[6-9]|2\d|3[01])\./,
  /^https?:\/\/\[?::1\]?/,   // IPv6 loopback
];

export function validateUrl(input: string): string | null {
  const trimmed = input.trim();

  // 1. Empty
  if (!trimmed) {
    return "Please enter a website URL.";
  }

  // 2. Missing protocol — common mistake: typing "google.com" instead of "https://google.com"
  if (!/^https?:\/\//i.test(trimmed)) {
    return `Please start your URL with https:// — for example: https://${trimmed}`;
  }

  // 3. Not a valid URL structure
  try {
    new URL(trimmed);
  } catch {
    return "That doesn't look like a valid URL. Try something like https://google.com";
  }

  // 4. Private / local addresses — the audit APIs can't reach these
  for (const pattern of PRIVATE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return "Only public websites can be audited. Localhost and private network addresses won't work.";
    }
  }

  // All good!
  return null;
}
