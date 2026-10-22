export function readAuthSessionCookie(cookies: { name: string; value: string }[], origin: string): string | null {
  const name = `${new URL(origin).protocol === 'https:' ? '__Secure-' : ''}authjs.session-token`;
  const whole = cookies.filter(cookie => cookie.name === name && cookie.value);
  const chunks = cookies.filter(cookie => cookie.name.startsWith(`${name}.`) && cookie.value);
  if (whole.length === 1 && chunks.length === 0) return whole[0].value;
  if (whole.length || !chunks.length || chunks.length > 16) return null;
  if (chunks.some(cookie => !/^(0|[1-9]\d*)$/.test(cookie.name.slice(name.length + 1)))) return null;
  const ordered = chunks.map(cookie => ({ ...cookie, index: Number(cookie.name.slice(name.length + 1)) }))
    .sort((a, b) => a.index - b.index);
  if (ordered.some((cookie, index) => cookie.index !== index)) return null;
  return ordered.map(cookie => cookie.value).join('');
}

export function hasIssuedPasswordSession(destination: unknown, origin: string, previous: string | null, issued: string | null): boolean {
  return destination === new URL('/dashboard', origin).href && Boolean(issued) && issued !== previous;
}
