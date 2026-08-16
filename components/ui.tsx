"use client";

import * as React from "react";

/** 서비스 워드마크. 토스처럼 장식 없이 굵은 활자 하나로. */
export function Wordmark({ size = 20 }: { size?: number }) {
  return (
    <span
      className="font-bold tracking-[-0.04em] text-g900"
      style={{ fontSize: size, lineHeight: 1.2 }}
    >
      Easy<span className="text-blue">Prompter</span>
    </span>
  );
}

export function AppBar({
  title,
  onBack,
  right,
}: {
  title?: React.ReactNode;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-20 flex h-14 items-center gap-1 bg-bg/85 px-4 backdrop-blur-xl">
      {onBack ? (
        <button
          onClick={onBack}
          aria-label="뒤로"
          className="press -ml-2 flex h-10 w-10 items-center justify-center rounded-full text-g900"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 5l-7 7 7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}
      <div className="min-w-0 flex-1 truncate text-[17px] font-bold tracking-[-0.03em] text-g900">
        {title}
      </div>
      {right}
    </div>
  );
}

export function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 bg-gradient-to-t from-bg via-bg to-transparent px-5 pt-5 pb-[max(16px,env(safe-area-inset-bottom))]">
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="press h-[56px] w-full rounded-[14px] bg-blue text-[17px] font-bold tracking-[-0.02em] text-white disabled:bg-g200 disabled:text-g400"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="press h-[52px] w-full rounded-[14px] bg-g100 text-[16px] font-bold tracking-[-0.02em] text-g700"
    >
      {children}
    </button>
  );
}

/** 흰 카드 — 토스의 기본 컨테이너 */
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[16px] bg-surface ${className}`}>{children}</div>
  );
}

/** 값 하나를 −/+ 로 조절. 큰 숫자를 먼저 보여주고 버튼은 아래에. */
export function Stepper({
  label,
  value,
  unit,
  onDec,
  onInc,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  onDec: () => void;
  onInc: () => void;
  hint?: string;
}) {
  return (
    <div className="rounded-[16px] bg-surface p-5">
      <div className="flex items-end justify-between gap-3">
        <span className="text-[15px] font-semibold text-g700">{label}</span>
        <span className="shrink-0 text-[22px] leading-none font-bold tracking-[-0.03em] text-g900 tabular-nums">
          {value}
          {unit ? (
            <span className="ml-1 text-[13px] font-semibold text-g500">{unit}</span>
          ) : null}
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={onDec}
          aria-label={`${label} 줄이기`}
          className="press grid h-12 flex-1 place-items-center rounded-[12px] bg-g100 text-[20px] font-bold text-g700"
        >
          −
        </button>
        <button
          onClick={onInc}
          aria-label={`${label} 늘리기`}
          className="press grid h-12 flex-1 place-items-center rounded-[12px] bg-g100 text-[20px] font-bold text-g700"
        >
          +
        </button>
      </div>
      {hint ? (
        <p className="mt-3 text-[13px] leading-[1.55] text-g500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Toggle({
  label,
  desc,
  on,
  onToggle,
}: {
  label: string;
  desc?: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      className="press-sm flex w-full items-center gap-4 rounded-[16px] bg-surface p-5 text-left"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-semibold tracking-[-0.02em] text-g900">
          {label}
        </span>
        {desc ? (
          <span className="mt-1 block text-[13px] leading-[1.55] text-g500">{desc}</span>
        ) : null}
      </span>
      <span
        className={`relative h-[32px] w-[52px] shrink-0 rounded-full transition-colors duration-200 ${
          on ? "bg-blue" : "bg-g300"
        }`}
      >
        <span
          className={`absolute top-[3px] h-[26px] w-[26px] rounded-full bg-white shadow-sm transition-[left] duration-200 ${
            on ? "left-[23px]" : "left-[3px]"
          }`}
        />
      </span>
    </button>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        aria-label="닫기"
        onClick={onClose}
        className="fade-in absolute inset-0 bg-g900/40"
      />
      <div className="sheet-in relative mx-auto max-h-[86dvh] w-full max-w-[640px] overflow-y-auto rounded-t-[20px] bg-bg pb-[max(20px,env(safe-area-inset-bottom))]">
        <div className="sticky top-0 z-10 bg-bg px-5 pt-3 pb-4">
          <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-g300" />
          <div className="flex items-center justify-between">
            <h2 className="text-[19px] font-bold tracking-[-0.03em] text-g900">{title}</h2>
            <button
              onClick={onClose}
              className="press rounded-[10px] bg-g100 px-3.5 py-2 text-[14px] font-bold text-g700"
            >
              완료
            </button>
          </div>
        </div>
        <div className="space-y-2 px-5">{children}</div>
      </div>
    </div>
  );
}
