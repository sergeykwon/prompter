import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Easy Prompter — 촬영용 텔레프롬프터",
  description:
    "대본을 붙여넣고 바로 촬영하세요. 모바일·아이패드·웹 화면, 자동 스크롤, 시선 유도선, 미러 모드.",
  openGraph: {
    title: "Easy Prompter — 촬영용 텔레프롬프터",
    description: "대본 보면서 바로 촬영. 시선은 렌즈에 그대로.",
    type: "website",
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Easy Prompter" },
};

export const viewport: Viewport = {
  themeColor: "#F2F4F6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
