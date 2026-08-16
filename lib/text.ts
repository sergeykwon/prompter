/** 공백을 뺀 글자 수 — 발화 시간 추정의 기준 */
export function charCount(body: string) {
  return body.replace(/\s/g, "").length;
}

/** 초 단위 예상 소요 시간 */
export function estimateSeconds(body: string, cpm: number) {
  const n = charCount(body);
  if (!n || cpm <= 0) return 0;
  return (n / cpm) * 60;
}

export function fmtDuration(sec: number) {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

/** 빈 줄을 문단 경계로 보고 나눈다 */
export function toParagraphs(body: string) {
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function previewLine(body: string, max = 46) {
  const one = body.replace(/\s+/g, " ").trim();
  return one.length > max ? `${one.slice(0, max)}…` : one;
}
