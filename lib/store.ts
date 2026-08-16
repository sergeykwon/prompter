"use client";

import { DEFAULT_SETTINGS, type Script, type Settings } from "./types";

const SCRIPTS_KEY = "prompter.scripts.v1";
const SETTINGS_KEY = "prompter.settings.v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadScripts(): Script[] {
  if (typeof window === "undefined") return [];
  const list = safeParse<Script[]>(localStorage.getItem(SCRIPTS_KEY), []);
  return Array.isArray(list) ? list.sort((a, b) => b.updatedAt - a.updatedAt) : [];
}

export function saveScripts(list: Script[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SCRIPTS_KEY, JSON.stringify(list));
  } catch {
    /* 저장 공간 부족 등 — 재생에는 영향 없음 */
  }
}

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const raw = safeParse<Record<string, unknown>>(localStorage.getItem(SETTINGS_KEY), {});
  const merged = { ...DEFAULT_SETTINGS, ...raw } as Settings;

  // v1 마이그레이션: fontSize가 숫자 하나였던 시절의 값을 모바일 값으로 옮긴다
  const fs = (raw as { fontSize?: unknown }).fontSize;
  if (typeof fs === "number") {
    merged.fontSize = { ...DEFAULT_SETTINGS.fontSize, mobile: fs };
  } else {
    merged.fontSize = { ...DEFAULT_SETTINGS.fontSize, ...(fs as object | undefined) };
  }
  return merged;
}

export function saveSettings(s: Settings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* noop */
  }
}

export function newId() {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const SAMPLE_BODY = `안녕하세요, 오늘은 제가 3주 동안 직접 써본 제품 하나를 가져왔습니다.

결론부터 말씀드릴게요. 이 가격대에서는 이만한 선택지가 없습니다.

먼저 가장 마음에 들었던 점.
버튼 하나로 모든 설정이 끝난다는 거예요. 매번 메뉴를 들어갈 필요가 없습니다.

물론 단점도 있습니다.
무게가 생각보다 나갑니다. 매일 들고 다니실 거라면 한 번 더 고민해보세요.

정리하면, 집에서 주로 쓰실 분께는 자신 있게 추천드립니다.
반대로 휴대성이 1순위라면 다른 선택지를 보시는 게 낫습니다.

궁금한 점은 댓글에 남겨주세요. 다음 영상에서 뵙겠습니다.`;
