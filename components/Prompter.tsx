"use client";

import * as React from "react";
import type { DeviceClass, Script, Settings } from "@/lib/types";
import { CPM_MAX, CPM_MIN, FONT_MAX, FONT_MIN, TEXT_LAYOUT } from "@/lib/types";
import { charCount, fmtDuration, toParagraphs } from "@/lib/text";

type Props = {
  script: Script;
  settings: Settings;
  fontSize: number;
  device: DeviceClass;
  onFontSize: (n: number) => void;
  onSettings: (patch: Partial<Settings>) => void;
  onExit: () => void;
};

const HIDE_MS = 2600;

export default function Prompter({
  script,
  settings,
  fontSize,
  device,
  onFontSize,
  onSettings,
  onExit,
}: Props) {
  const paras = React.useMemo(() => toParagraphs(script.body), [script.body]);
  const chars = React.useMemo(() => charCount(script.body), [script.body]);
  const layout = TEXT_LAYOUT[device];
  const compact = device === "mobile";
  const fontStep = compact ? 4 : 6;

  const trackRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLDivElement>(null);
  const timeRef = React.useRef<HTMLSpanElement>(null);
  const barRef = React.useRef<HTMLDivElement>(null);

  const posRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const lastRef = React.useRef(0);
  const travelRef = React.useRef(1);
  const wakeRef = React.useRef<{ release: () => Promise<void> } | null>(null);
  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [count, setCount] = React.useState<number | null>(null);
  const [chrome, setChrome] = React.useState(true);

  const pxPerSec = React.useCallback(() => {
    const travel = travelRef.current;
    if (!chars || travel <= 0) return 0;
    return (travel / chars) * (settings.cpm / 60);
  }, [chars, settings.cpm]);

  const paint = React.useCallback(() => {
    const travel = travelRef.current;
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(0,${-posRef.current}px,0)`;
    }
    const ratio = travel > 0 ? Math.min(1, posRef.current / travel) : 0;
    if (barRef.current) barRef.current.style.width = `${ratio * 100}%`;
    const sp = pxPerSec();
    if (timeRef.current) {
      timeRef.current.textContent =
        sp > 0 ? fmtDuration((travel - posRef.current) / sp) : "0:00";
    }
  }, [pxPerSec]);

  /** 글자 크기·행간·화면 폭이 바뀌면 이동 거리를 다시 재고 진행률을 유지한다 */
  const measure = React.useCallback(() => {
    const h = textRef.current?.offsetHeight ?? 0;
    const prev = travelRef.current;
    const next = Math.max(1, h);
    if (prev > 0 && next !== prev) {
      posRef.current = (posRef.current / prev) * next;
    }
    travelRef.current = next;
    paint();
  }, [paint]);

  React.useLayoutEffect(() => {
    measure();
  }, [measure, fontSize, settings.lineHeight, script.body, device]);

  React.useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [measure]);

  // ── 화면 꺼짐 방지 ────────────────────────────────
  React.useEffect(() => {
    let cancelled = false;
    const acquire = async () => {
      try {
        const wl = (navigator as unknown as {
          wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> };
        }).wakeLock;
        if (!wl) return;
        const lock = await wl.request("screen");
        if (cancelled) void lock.release();
        else wakeRef.current = lock;
      } catch {
        /* 미지원 브라우저 — 무시 */
      }
    };
    void acquire();
    const onVis = () => {
      if (document.visibilityState === "visible") void acquire();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      void wakeRef.current?.release().catch(() => {});
      wakeRef.current = null;
    };
  }, []);

  // ── 스크롤 루프 ───────────────────────────────────
  React.useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    lastRef.current = performance.now();
    const step = (t: number) => {
      const dt = Math.min(0.1, (t - lastRef.current) / 1000);
      lastRef.current = t;
      posRef.current += pxPerSec() * dt;
      if (posRef.current >= travelRef.current) {
        posRef.current = travelRef.current;
        paint();
        setPlaying(false);
        setDone(true);
        setChrome(true);
        return;
      }
      paint();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [playing, pxPerSec, paint]);

  // ── 컨트롤 자동 숨김 ──────────────────────────────
  const bumpChrome = React.useCallback(() => {
    setChrome(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setChrome(false), HIDE_MS);
  }, []);

  React.useEffect(() => {
    if (playing) bumpChrome();
    else {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setChrome(true);
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [playing, bumpChrome]);

  // ── 카운트다운 ────────────────────────────────────
  const startCountdown = React.useCallback(() => {
    setDone(false);
    setCount(3);
  }, []);

  React.useEffect(() => {
    if (count === null) return;
    if (count === 0) {
      setCount(null);
      setPlaying(true);
      return;
    }
    const id = setTimeout(() => setCount((c) => (c === null ? null : c - 1)), 800);
    return () => clearTimeout(id);
  }, [count]);

  const toggle = React.useCallback(() => {
    if (count !== null) return;
    if (done) {
      posRef.current = 0;
      paint();
      startCountdown();
      return;
    }
    if (playing) setPlaying(false);
    else if (posRef.current === 0) startCountdown();
    else setPlaying(true);
  }, [count, done, playing, paint, startCountdown]);

  const restart = React.useCallback(() => {
    setPlaying(false);
    setDone(false);
    setCount(null);
    posRef.current = 0;
    paint();
  }, [paint]);

  const nudge = React.useCallback(
    (dir: -1 | 1) => {
      posRef.current = Math.max(
        0,
        Math.min(travelRef.current, posRef.current + dir * fontSize * settings.lineHeight * 2),
      );
      setDone(false);
      paint();
    },
    [paint, fontSize, settings.lineHeight],
  );

  // ── 키보드 (웹 / 아이패드 키보드) ─────────────────
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        toggle();
      } else if (e.key === "Escape") onExit();
      else if (e.key === "ArrowUp") {
        e.preventDefault();
        nudge(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        nudge(1);
      } else if (e.key === "ArrowLeft") {
        onSettings({ cpm: Math.max(CPM_MIN, settings.cpm - 10) });
      } else if (e.key === "ArrowRight") {
        onSettings({ cpm: Math.min(CPM_MAX, settings.cpm + 10) });
      }
      bumpChrome();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, onExit, nudge, onSettings, settings.cpm, bumpChrome]);

  const eyePct = `${settings.eyeLine * 100}%`;

  const speedGroup = (
    <Group>
      <Ctl label="속도 줄이기" onClick={() => onSettings({ cpm: Math.max(CPM_MIN, settings.cpm - 20) })}>
        <span className="text-[16px] font-black">−</span>
      </Ctl>
      <div className="min-w-0 flex-1 px-1 text-center">
        <div className="text-[15px] leading-tight font-black tabular-nums text-white">
          {settings.cpm}
        </div>
        <div className="text-[10px] leading-tight font-bold text-white/45">자/분</div>
      </div>
      <Ctl label="속도 올리기" onClick={() => onSettings({ cpm: Math.min(CPM_MAX, settings.cpm + 20) })}>
        <span className="text-[16px] font-black">+</span>
      </Ctl>
    </Group>
  );

  const fontGroup = (
    <Group>
      <Ctl label="글자 작게" onClick={() => onFontSize(Math.max(FONT_MIN, fontSize - fontStep))}>
        <span className="text-[12px] font-black">가</span>
      </Ctl>
      <div className="min-w-0 flex-1 px-1 text-center">
        <div className="text-[15px] leading-tight font-black tabular-nums text-white">
          {fontSize}
        </div>
        <div className="text-[10px] leading-tight font-bold text-white/45">pt</div>
      </div>
      <Ctl label="글자 크게" onClick={() => onFontSize(Math.min(FONT_MAX, fontSize + fontStep))}>
        <span className="text-[19px] font-black">가</span>
      </Ctl>
    </Group>
  );

  const restartBtn = (
    <Ctl label="처음으로" onClick={restart}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 5v6h6M4.6 13a7.6 7.6 0 1 0 1.6-5.2L4 11"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Ctl>
  );

  const mirrorBtn = (
    <Ctl
      label="미러 모드"
      active={settings.mirror}
      onClick={() => onSettings({ mirror: !settings.mirror })}
    >
      <span className="text-[13px] font-black">◧</span>
    </Ctl>
  );

  const playBtn = (
    <button
      onClick={toggle}
      aria-label={playing ? "일시정지" : "재생"}
      className={`press grid shrink-0 place-items-center rounded-full bg-blue text-white ${
        compact ? "h-14 w-14" : "h-14 w-16"
      }`}
    >
      {playing ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4.4" height="16" rx="1.4" />
          <rect x="13.6" y="4" width="4.4" height="16" rx="1.4" />
        </svg>
      ) : (
        <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 4.5l13 7.5-13 7.5z" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-black select-none">
      {/* 대본 (미러 모드는 이 레이어만 반전) */}
      <div
        className="absolute inset-0"
        style={{ transform: settings.mirror ? "scaleX(-1)" : undefined }}
      >
        <div ref={trackRef} className="absolute inset-x-0 top-0 will-change-transform">
          <div
            className="mx-auto w-full"
            style={{
              maxWidth: layout.maxWidth,
              paddingLeft: layout.padX,
              paddingRight: layout.padX,
              paddingTop: `calc(${settings.eyeLine} * 100dvh)`,
            }}
          >
            <div
              ref={textRef}
              style={{
                fontSize,
                lineHeight: settings.lineHeight,
                letterSpacing: "-0.02em",
              }}
              className="font-semibold text-white"
            >
              {paras.map((p, i) => (
                <p key={i} className={i === 0 ? "" : "mt-[1.1em]"}>
                  {p.split("\n").map((line, j) => (
                    <React.Fragment key={j}>
                      {j > 0 ? <br /> : null}
                      {line}
                    </React.Fragment>
                  ))}
                </p>
              ))}
            </div>
          </div>
          <div style={{ height: "100dvh" }} />
        </div>
      </div>

      {/* 시선 유도선 — 카메라 렌즈에 가장 가까운 높이 */}
      <div
        className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
        style={{ top: eyePct }}
      >
        <div className="h-0 w-0 border-y-[7px] border-l-[10px] border-y-transparent border-l-blue" />
        <div className="h-px flex-1 bg-blue/30" />
        <div className="h-0 w-0 border-y-[7px] border-r-[10px] border-y-transparent border-r-blue" />
      </div>

      {/* 위아래 페이드 — 읽는 줄에 시선이 모이게 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[24dvh] bg-gradient-to-b from-black via-black/85 to-transparent" />
      {/* 아래쪽은 '앞으로 읽을' 구간 — 미리 보이도록 옅게만 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[26dvh] bg-gradient-to-t from-black via-black/45 to-transparent" />

      {/* 탭 영역 */}
      <button
        aria-label={playing ? "일시정지" : "재생"}
        onClick={() => {
          toggle();
          bumpChrome();
        }}
        className="absolute inset-0 z-20"
      />

      {/* 상단 바 */}
      <div
        className={`absolute inset-x-0 top-0 z-30 transition-opacity duration-300 ${
          chrome ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="h-[3px] w-full bg-white/10">
          <div ref={barRef} className="h-full bg-blue" style={{ width: "0%" }} />
        </div>
        <div className={`flex items-center gap-2 pt-3 ${compact ? "px-4" : "px-6"}`}>
          <button
            onClick={onExit}
            className="press rounded-[10px] bg-black/55 px-3.5 py-2 text-[13.5px] font-bold text-white backdrop-blur"
          >
            나가기
          </button>
          <div className="min-w-0 flex-1 truncate px-1 text-center text-[13px] font-semibold text-white/55">
            {script.title || "제목 없음"}
          </div>
          <div className="rounded-[10px] bg-black/55 px-3.5 py-2 text-[13.5px] font-bold tabular-nums text-white backdrop-blur">
            <span ref={timeRef}>0:00</span>
          </div>
        </div>
      </div>

      {/* 하단 컨트롤 */}
      <div
        className={`absolute inset-x-0 bottom-0 z-30 pb-[max(16px,env(safe-area-inset-bottom))] transition-opacity duration-300 ${
          compact ? "px-4" : "px-6"
        } ${chrome ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div
          className={`mx-auto rounded-[18px] bg-black/65 p-2 backdrop-blur-xl ${
            compact ? "max-w-[560px]" : "max-w-[760px]"
          }`}
        >
          {compact ? (
            <>
              {/* 모바일 — 2행 */}
              <div className="flex items-stretch gap-2">
                {speedGroup}
                {fontGroup}
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                {restartBtn}
                {playBtn}
                {mirrorBtn}
              </div>
            </>
          ) : (
            /* 아이패드 · 웹 — 1행 */
            <div className="flex items-center gap-2.5">
              {restartBtn}
              <div className="min-w-0 flex-1">{speedGroup}</div>
              {playBtn}
              <div className="min-w-0 flex-1">{fontGroup}</div>
              {mirrorBtn}
            </div>
          )}
        </div>

        {!playing && count === null && !done ? (
          <p className="mt-3 text-center text-[12px] font-semibold text-white/40">
            {device === "desktop"
              ? "스페이스 재생 · ↑↓ 위치 · ←→ 속도 · Esc 나가기"
              : "화면을 탭하면 시작 · 정지"}
          </p>
        ) : null}
      </div>

      {/* 카운트다운 */}
      {count !== null && count > 0 && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-black/75">
          <span
            key={count}
            className="count-pop leading-none font-black text-blue"
            style={{ fontSize: compact ? 112 : 180 }}
          >
            {count}
          </span>
        </div>
      )}

      {/* 완료 */}
      {done && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-black/85 px-8">
          <div className="w-full max-w-[320px] text-center">
            <p className="text-[24px] font-bold tracking-[-0.03em] text-white">대본 끝</p>
            <p className="mt-2 text-[14px] text-white/55">수고하셨습니다. 컷 확인하세요.</p>
            <button
              onClick={() => {
                posRef.current = 0;
                paint();
                startCountdown();
              }}
              className="press mt-7 h-[54px] w-full rounded-[14px] bg-blue text-[16px] font-bold text-white"
            >
              다시 재생
            </button>
            <button
              onClick={onExit}
              className="press mt-2 h-[54px] w-full rounded-[14px] bg-white/12 text-[16px] font-bold text-white"
            >
              나가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1 rounded-[14px] bg-white/[0.07] p-1">
      {children}
    </div>
  );
}

function Ctl({
  children,
  onClick,
  label,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`press grid h-11 w-11 shrink-0 place-items-center rounded-[12px] ${
        active ? "bg-blue text-white" : "bg-white/12 text-white hover:bg-white/20"
      }`}
    >
      {children}
    </button>
  );
}
