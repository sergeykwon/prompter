"use client";

import * as React from "react";
import type { DeviceClass, Script, Settings } from "@/lib/types";
import { charCount, estimateSeconds, fmtDuration } from "@/lib/text";
import { AppBar, BottomBar, PrimaryButton } from "./ui";

export default function Editor({
  script,
  settings,
  fontSize,
  device,
  onChange,
  onDelete,
  onBack,
  onPlay,
  onSettings,
}: {
  script: Script;
  settings: Settings;
  fontSize: number;
  device: DeviceClass;
  onChange: (patch: Partial<Script>) => void;
  onDelete: () => void;
  onBack?: () => void;
  onPlay: () => void;
  onSettings: () => void;
}) {
  const [confirmDel, setConfirmDel] = React.useState(false);
  const chars = charCount(script.body);
  const sec = estimateSeconds(script.body, settings.cpm);
  const wide = device !== "mobile";

  const deleteBtn = (
    <button
      onClick={() => (confirmDel ? onDelete() : setConfirmDel(true))}
      onBlur={() => setConfirmDel(false)}
      className={`press rounded-[10px] px-3 py-2 text-[14px] font-bold transition-colors ${
        confirmDel ? "bg-red text-white" : "bg-g100 text-g600"
      }`}
    >
      {confirmDel ? "정말 삭제" : "삭제"}
    </button>
  );

  return (
    <>
      <AppBar onBack={onBack} title="대본" right={deleteBtn} />

      <div className={`flex min-h-0 flex-1 flex-col ${wide ? "px-8 pt-3" : "px-5 pt-1"}`}>
        <input
          value={script.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="제목 (예: 신제품 리뷰 1컷)"
          className={`w-full bg-transparent py-3 font-bold tracking-[-0.035em] text-g900 outline-none placeholder:text-g400 ${
            wide ? "text-[26px]" : "text-[23px]"
          }`}
        />

        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <Chip>{fmtDuration(sec)} 예상</Chip>
          <Chip>{chars.toLocaleString()}자</Chip>
          <button
            onClick={onSettings}
            className="press rounded-[6px] bg-blue-weak px-2 py-1 text-[12px] font-bold text-blue-dark"
          >
            {settings.cpm}자/분 · {fontSize}pt
          </button>
        </div>

        <textarea
          value={script.body}
          onChange={(e) => onChange({ body: e.target.value })}
          placeholder={
            "여기에 대본을 붙여넣으세요.\n\n빈 줄로 문단을 나누면 프롬터에서 읽기 좋게 간격이 벌어집니다."
          }
          className={`w-full flex-1 resize-none rounded-[16px] bg-surface p-5 leading-[1.75] text-g900 outline-none placeholder:text-g400 ${
            wide ? "min-h-[42dvh] text-[16px]" : "min-h-[36dvh] text-[15px]"
          }`}
        />

        <p className={`mt-3 pb-1 text-[13px] leading-[1.6] text-g500 ${wide ? "max-w-[560px]" : ""}`}>
          예상 시간은 {settings.cpm}자/분 기준입니다. 실제 말하는 속도에 맞춰 재생 중에도 바꿀 수
          있어요.
        </p>
      </div>

      <BottomBar>
        <div className={wide ? "mx-auto max-w-[420px]" : ""}>
          <PrimaryButton onClick={onPlay} disabled={chars === 0}>
            프롬터 시작
          </PrimaryButton>
        </div>
      </BottomBar>
    </>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[6px] bg-g100 px-2 py-1 text-[12px] font-bold text-g600 tabular-nums">
      {children}
    </span>
  );
}
