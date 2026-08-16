"use client";

import * as React from "react";
import type { Script, Settings } from "@/lib/types";
import { charCount, estimateSeconds, fmtDuration, previewLine } from "@/lib/text";
import { BottomBar, PrimaryButton, Wordmark } from "./ui";

type Variant = "page" | "sidebar";

export default function ScriptList({
  scripts,
  settings,
  activeId,
  variant,
  onOpen,
  onNew,
  onSample,
  onSettings,
}: {
  scripts: Script[];
  settings: Settings;
  activeId?: string | null;
  variant: Variant;
  onOpen: (s: Script) => void;
  onNew: () => void;
  onSample: () => void;
  onSettings: () => void;
}) {
  const sidebar = variant === "sidebar";

  return (
    <>
      <div className={`flex items-center justify-between px-5 ${sidebar ? "pt-6" : "pt-8"}`}>
        <Wordmark size={sidebar ? 18 : 20} />
        <button
          onClick={onSettings}
          aria-label="설정"
          className="press -mr-2 grid h-10 w-10 place-items-center rounded-full text-g600"
        >
          {/* 슬라이더 3줄 — 설정을 '값 조절'로 읽히게 */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
            <circle cx="9" cy="7" r="2.4" fill="currentColor" />
            <circle cx="15.5" cy="12" r="2.4" fill="currentColor" />
            <circle cx="7.5" cy="17" r="2.4" fill="currentColor" />
          </svg>
        </button>
      </div>

      {sidebar ? (
        <div className="px-5 pt-6 pb-3">
          <h2 className="text-[14px] font-bold text-g600">
            내 대본 {scripts.length > 0 ? scripts.length : ""}
          </h2>
        </div>
      ) : (
        <div className="px-5 pt-7 pb-6">
          <h1 className="text-[26px] leading-[1.38] font-bold tracking-[-0.035em] text-g900">
            대본 보면서
            <br />
            바로 촬영하세요
          </h1>
          <p className="mt-2.5 text-[15px] leading-[1.6] text-g600">
            카메라 바로 아래에서 대본이 흘러갑니다.
            <br />
            시선은 렌즈에 그대로.
          </p>
        </div>
      )}

      {scripts.length === 0 ? (
        <div className="px-5">
          <div className="rounded-[16px] bg-surface px-6 py-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blue-weak">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-blue">
                <path
                  d="M5 4.5h14M5 9.5h14M5 14.5h9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M9 19.5h6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity=".4"
                />
              </svg>
            </div>
            <p className="mt-4 text-[16px] font-bold tracking-[-0.02em] text-g900">
              아직 대본이 없어요
            </p>
            <p className="mt-1.5 text-[14px] leading-[1.6] text-g500">
              대본을 붙여넣으면 바로 프롬터로 재생됩니다.
            </p>
            <button
              onClick={onSample}
              className="press mt-5 rounded-[10px] bg-g100 px-4 py-2.5 text-[14px] font-bold text-g700"
            >
              샘플 대본으로 먼저 해보기
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 px-5 pb-4">
          {scripts.map((s) => {
            const sec = estimateSeconds(s.body, settings.cpm);
            const on = sidebar && s.id === activeId;
            return (
              <button
                key={s.id}
                onClick={() => onOpen(s)}
                className={`press-sm flex w-full items-center gap-3 rounded-[16px] p-5 text-left transition-colors ${
                  on ? "bg-blue-weak" : "bg-surface"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-[16px] font-bold tracking-[-0.025em] ${
                      on ? "text-blue-dark" : "text-g900"
                    }`}
                  >
                    {s.title || "제목 없음"}
                  </span>
                  <span className="mt-1 block truncate text-[14px] text-g500">
                    {previewLine(s.body, sidebar ? 26 : 42) || "내용 없음"}
                  </span>
                  <span className="mt-2.5 flex items-center gap-1.5 text-[12px] font-bold text-g600">
                    <span className="rounded-[6px] bg-g100 px-2 py-1 tabular-nums">
                      {fmtDuration(sec)}
                    </span>
                    <span className="rounded-[6px] bg-g100 px-2 py-1 tabular-nums">
                      {charCount(s.body).toLocaleString()}자
                    </span>
                  </span>
                </span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0 text-g400"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex-1" />

      <BottomBar>
        <PrimaryButton onClick={onNew}>새 대본 만들기</PrimaryButton>
      </BottomBar>
    </>
  );
}
