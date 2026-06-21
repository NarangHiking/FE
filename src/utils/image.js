// R2 이미지 키 → 공개 URL 변환 (공용)
// VITE_R2_URL = Cloudflare R2 public base (예: https://pub-xxxx.r2.dev)
// storedFilename 이 이미 전체 URL이면 그대로 사용. 키면 base 를 붙이고 공백/한글은 encodeURI.
const R2_BASE = import.meta.env.VITE_R2_URL ?? '';

export function imageUrl(s) {
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return encodeURI(s);
  return R2_BASE ? `${R2_BASE.replace(/\/$/, '')}/${encodeURI(s.replace(/^\//, ''))}` : '';
}
