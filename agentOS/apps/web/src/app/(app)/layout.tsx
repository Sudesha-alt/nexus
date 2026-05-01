import { Sidebar } from "@/components/layout/Sidebar";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:pl-60">
      <Sidebar />
      <div className="min-h-screen">{children}</div>
    </div>
  );
}
