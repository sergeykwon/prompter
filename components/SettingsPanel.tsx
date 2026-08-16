"use client";

import * as React from "react";
import type { DeviceClass, Settings } from "@/lib/types";
import { CPM_MAX, CPM_MIN, FONT_MAX, FONT_MIN } from "@/lib/types";
import { DEVICE_LABEL } from "@/lib/device";
import { Stepper, Toggle } from "./ui";

const FONT_HINT: Record<DeviceClass, string> = {
  mobile: "촬영 거리에서 편하게 읽히는 크기로. 폰은 40~52가 무난합니다.",
  tablet: "아이패드를 카메라 옆에 세워둘 거리라면 55~75가 무난합니다.",
  desktop: "모니터를 1m 이상 떨어뜨려 쓰면 70~100까지 키우세요.",
};

export default function SettingsPanel({
  settings,
  fontSize,
  onFontSize,
  onSettings,
  device,
}: {
  settings: Settings;
  fontSize: number;
  onFontSize: (n: number) => void;
  onSettings: (patch: Partial<Settings>) => void;
  device: DeviceClass;
}) {
  return (
    <>
      <div className="flex items-center justify-between rounded-[16px] bg-surface px-5 py-4">
        <span className="text-[15px] font-semibold text-g700">현재 화면</span>
        <span className="rounded-[8px] bg-blue-weak px-2.5 py-1 text-[13px] font-bold text-blue-dark">
          {DEVICE_LABEL[device]}
        </span>
      </div>

      <Stepper
        label="속도"
        value={settings.cpm}
        unit="자/분"
        hint="한국어 자연스러운 말하기 속도는 300~380자/분입니다. 재생 중에도 바꿀 수 있어요."
        onDec={() => onSettings({ cpm: Math.max(CPM_MIN, settings.cpm - 10) })}
        onInc={() => onSettings({ cpm: Math.min(CPM_MAX, settings.cpm + 10) })}
      />
      <Stepper
        label={`글자 크기 · ${DEVICE_LABEL[device]}`}
        value={fontSize}
        unit="pt"
        hint={`${FONT_HINT[device]} 화면별로 따로 저장됩니다.`}
        onDec={() => onFontSize(Math.max(FONT_MIN, fontSize - 2))}
        onInc={() => onFontSize(Math.min(FONT_MAX, fontSize + 2))}
      />
      <Stepper
        label="줄 간격"
        value={settings.lineHeight.toFixed(2)}
        onDec={() =>
          onSettings({ lineHeight: Math.max(1.2, +(settings.lineHeight - 0.05).toFixed(2)) })
        }
        onInc={() =>
          onSettings({ lineHeight: Math.min(2.4, +(settings.lineHeight + 0.05).toFixed(2)) })
        }
      />
      <Stepper
        label="시선 유도선 위치"
        value={Math.round(settings.eyeLine * 100)}
        unit="%"
        hint="렌즈에 가까울수록 시선이 자연스럽습니다. 화면 위쪽에 둘수록 카메라를 보는 것처럼 보여요."
        onDec={() => onSettings({ eyeLine: Math.max(0.12, +(settings.eyeLine - 0.02).toFixed(2)) })}
        onInc={() => onSettings({ eyeLine: Math.min(0.6, +(settings.eyeLine + 0.02).toFixed(2)) })}
      />
      <Toggle
        label="미러 모드"
        desc="빔스플리터 프롬터 리그에 반사시킬 때 켜세요. 좌우가 뒤집힙니다."
        on={settings.mirror}
        onToggle={() => onSettings({ mirror: !settings.mirror })}
      />

      <div className="rounded-[16px] bg-surface p-5">
        <p className="text-[15px] font-semibold text-g700">재생 중 조작</p>
        <ul className="mt-3 space-y-2">
          <Row k="화면 탭">재생 / 일시정지</Row>
          <Row k="하단 바">속도 · 글자 크기 · 처음으로 · 미러</Row>
          <Row k="키보드">스페이스 재생 · ↑↓ 위치 · ←→ 속도 · Esc 나가기</Row>
        </ul>
      </div>
    </>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-[13.5px] leading-[1.55]">
      <span className="w-[68px] shrink-0 font-bold text-g600">{k}</span>
      <span className="min-w-0 flex-1 text-g500">{children}</span>
    </li>
  );
}
