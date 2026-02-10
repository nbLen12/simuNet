import Link from "next/link";
import { redirect } from "next/navigation";
import { NavLink } from "@/components/nav-link";
import { getCurrentUser } from "@/lib/auth";

export default async function ClientLayout({
  children
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const user = await getCurrentUser();

  if (user.role !== "CLIENT") {
    redirect(`/unauthorized?required=CLIENT&current=${user.role}`);
  }

  return (
    <div className="portal-client">
      <header className="client-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div>
            <strong>Client Supervisor Portal</strong>
            <div className="meta" style={{ color: "#ffd8bf" }}>
              {user.name}
            </div>
          </div>
          <div className="client-nav">
            <NavLink href="/client" label="Diary Approvals" />
            <Link href="/" className="btn ghost">
              Switch
            </Link>
          </div>
        </div>
      </header>
      <main className="container" style={{ paddingTop: "1rem", display: "grid", gap: "1rem" }}>
        {children}
      </main>
    </div>
  );
}
