const STORAGE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '/storage');

export function getAvatarUrl(avatar) {
  if (!avatar) return null;
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
  return `${STORAGE_URL}/${avatar}`;
}
