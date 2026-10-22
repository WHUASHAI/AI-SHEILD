type AccountRepository = {
  findUser(id: string): Promise<{id: string} | null>;
  findProvider(id: string): Promise<{userId: string} | null>;
  createGoogle(id: string, email: string, name: string | null): Promise<string>;
};
export async function resolveAccountIdentity(subject: string, profile: {email?: string | null; name?: string | null} | null, repo: AccountRepository) {
  const separator = subject.indexOf(':');
  const provider = subject.slice(0, separator), id = subject.slice(separator + 1);
  if (separator < 0 || !id) throw new Error('Invalid account identity.');
  if (provider === 'credentials') {
    const user = await repo.findUser(id);
    if (!user) throw new Error('Account no longer exists.');
    return user.id;
  }
  if (provider !== 'google') throw new Error('Unsupported account identity.');
  const existing = await repo.findProvider(id);
  if (existing) return existing.userId;
  if (!profile?.email) throw new Error('Verified account email is required.');
  return repo.createGoogle(id, profile.email.toLowerCase(), profile.name ?? null);
}
