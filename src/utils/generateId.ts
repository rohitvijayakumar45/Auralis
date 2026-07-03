/**
 * Generate a RFC4122 v4 UUID using crypto.getRandomValues().
 *
 * crypto.getRandomValues() is available in ALL browser contexts (secure and
 * insecure). Unlike crypto.randomUUID() which requires a Secure Context
 * (HTTPS or localhost), this implementation works over plain HTTP.
 *
 * This replaces the `uuid` npm package which internally attempts to call
 * crypto.randomUUID() as a fast-path optimization, causing a TypeError
 * in insecure contexts.
 */
export function generateId(): string {
  const rnds = new Uint8Array(16);
  crypto.getRandomValues(rnds);

  // Per RFC 4122 section 4.4: set version (4) and variant (10xx)
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  const hex = Array.from(rnds, (b) => b.toString(16).padStart(2, "0")).join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
