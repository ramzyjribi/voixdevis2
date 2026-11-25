import type { ReactNode } from "react";

type DesktopSplitProps = {
  left: ReactNode;
  right: ReactNode;
};

export function DesktopSplit({ left, right }: DesktopSplitProps) {
  return (
    <div className="grid h-[calc(100svh-4rem)] grid-cols-[440px_minmax(0,1fr)]">
      <aside className="min-h-0 border-r bg-white">{left}</aside>
      <section className="min-h-0 overflow-auto bg-[#eef2ec]">{right}</section>
    </div>
  );
}
