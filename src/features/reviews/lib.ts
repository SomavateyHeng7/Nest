/** "Sokha Chan" → "Sokha C." Reviews never show a full name. */
export function publicName(full: string) {
  const [first, ...rest] = full.trim().split(/\s+/);
  return rest.length ? `${first} ${rest[rest.length - 1].charAt(0)}.` : first;
}
