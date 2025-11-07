import type { ReactNode } from "react";
import { Header } from "@/components/common/Header";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function Layout({ children, showHeader = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && <Header />}
      <main className={showHeader ? "" : "min-h-screen"}>{children}</main>
    </div>
  );
}
