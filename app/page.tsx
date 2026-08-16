"use client";

import * as React from "react";
import type { Script, Settings } from "@/lib/types";
import { DEFAULT_SETTINGS, FONT_MAX, FONT_MIN } from "@/lib/types";
import { useDevice } from "@/lib/device";
import {
  SAMPLE_BODY,
  loadScripts,
  loadSettings,
  newId,
  saveScripts,
  saveSettings,
} from "@/lib/store";
import ScriptList from "@/components/ScriptList";
import Editor from "@/components/Editor";
import Prompter from "@/components/Prompter";
import SettingsPanel from "@/components/SettingsPanel";
import { Sheet, Wordmark } from "@/components/ui";

type View = "list" | "edit" | "play";

export default function Page() {
  const device = useDevice();
  const [ready, setReady] = React.useState(false);
  const [view, setView] = React.useState<View>("list");
  const [scripts, setScripts] = React.useState<Script[]>([]);
  const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [sheet, setSheet] = React.useState(false);

  React.useEffect(() => {
    setScripts(loadScripts());
    setSettings(loadSettings());
    setReady(true);
  }, []);

  const active = React.useMemo(
    () => scripts.find((s) => s.id === activeId) ?? null,
    [scripts, activeId],
  );

  const fontSize = settings.fontSize[device];

  const commit = React.useCallback((next: Script[]) => {
    const sorted = [...next].sort((a, b) => b.updatedAt - a.updatedAt);
    setScripts(sorted);
    saveScripts(sorted);
  }, []);

  const patchSettings = React.useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const setFontSize = React.useCallback(
    (n: number) => {
      const v = Math.max(FONT_MIN, Math.min(FONT_MAX, Math.round(n)));
      setSettings((prev) => {
        const next = { ...prev, fontSize: { ...prev.fontSize, [device]: v } };
        saveSettings(next);
        return next;
      });
    },
    [device],
  );

  const create = React.useCallback(
    (body = "", title = "") => {
      const s: Script = { id: newId(), title, body, updatedAt: Date.now() };
      commit([s, ...scripts]);
      setActiveId(s.id);
      setView("edit");
    },
    [commit, scripts],
  );

  const patchActive = React.useCallback(
    (patch: Partial<Script>) => {
      if (!activeId) return;
      commit(
        scripts.map((s) =>
          s.id === activeId ? { ...s, ...patch, updatedAt: Date.now() } : s,
        ),
      );
    },
    [activeId, commit, scripts],
  );

  const removeActive = React.useCallback(() => {
    if (!activeId) return;
    commit(scripts.filter((s) => s.id !== activeId));
    setActiveId(null);
    setView("list");
  }, [activeId, commit, scripts]);

  if (!ready) return <main className="h-[100dvh] bg-bg" />;

  // ── 프롬터는 세 레이아웃 공통으로 전체화면 ─────────
  if (view === "play" && active) {
    return (
      <Prompter
        script={active}
        settings={settings}
        fontSize={fontSize}
        device={device}
        onFontSize={setFontSize}
        onSettings={patchSettings}
        onExit={() => setView("edit")}
      />
    );
  }

  const settingsProps = {
    settings,
    fontSize,
    onFontSize: setFontSize,
    onSettings: patchSettings,
    device,
  };

  const listProps = {
    scripts,
    settings,
    activeId,
    onOpen: (s: Script) => {
      setActiveId(s.id);
      setView("edit");
    },
    onNew: () => create(),
    onSample: () => create(SAMPLE_BODY, "샘플 · 제품 리뷰"),
    onSettings: () => setSheet(true),
  };

  const editorProps = {
    settings,
    fontSize,
    device,
    onChange: patchActive,
    onDelete: removeActive,
    onPlay: () => setView("play"),
    onSettings: () => setSheet(true),
  };

  // ── 모바일 — 한 화면씩 이동 ────────────────────────
  if (device === "mobile") {
    return (
      <main className="mx-auto flex h-[100dvh] w-full max-w-[560px] flex-col overflow-y-auto bg-bg">
        {view === "list" && <ScriptList variant="page" {...listProps} />}
        {view === "edit" && active && (
          <Editor
            script={active}
            {...editorProps}
            onBack={() => setView("list")}
          />
        )}
        <Sheet open={sheet} onClose={() => setSheet(false)} title="프롬터 설정">
          <SettingsPanel {...settingsProps} />
        </Sheet>
      </main>
    );
  }

  // ── 아이패드 — 목록 | 편집 2단 ─────────────────────
  // ── 웹 — 목록 | 편집 | 설정 3단 ────────────────────
  const desktop = device === "desktop";

  return (
    <main className="flex h-[100dvh] w-full bg-bg">
      <aside
        className={`flex h-full shrink-0 flex-col overflow-y-auto border-r border-line bg-bg ${
          desktop ? "w-[340px]" : "w-[300px]"
        }`}
      >
        <ScriptList variant="sidebar" {...listProps} />
      </aside>

      <section className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
        {active ? (
          <Editor script={active} {...editorProps} />
        ) : (
          <EmptyPane onNew={() => create()} />
        )}
      </section>

      {desktop && (
        <aside className="flex h-full w-[340px] shrink-0 flex-col overflow-y-auto border-l border-line bg-bg px-5 pt-6 pb-8">
          <h2 className="mb-4 text-[14px] font-bold text-g600">프롬터 설정</h2>
          <div className="space-y-2">
            <SettingsPanel {...settingsProps} />
          </div>
        </aside>
      )}

      {/* 아이패드는 설정을 바텀시트로 */}
      {!desktop && (
        <Sheet open={sheet} onClose={() => setSheet(false)} title="프롬터 설정">
          <SettingsPanel {...settingsProps} />
        </Sheet>
      )}
    </main>
  );
}

function EmptyPane({ onNew }: { onNew: () => void }) {
  return (
    <div className="grid h-full place-items-center px-8">
      <div className="text-center">
        <Wordmark size={26} />
        <p className="mt-5 text-[15px] leading-[1.7] text-g500">
          왼쪽에서 대본을 고르거나
          <br />새 대본을 만들어 시작하세요.
        </p>
        <button
          onClick={onNew}
          className="press mt-6 h-[54px] rounded-[14px] bg-blue px-8 text-[16px] font-bold text-white"
        >
          새 대본
        </button>
      </div>
    </div>
  );
}
