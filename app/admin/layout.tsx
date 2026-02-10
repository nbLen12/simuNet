import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { NavLink } from "@/components/nav-link";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const user = await getCurrentUser();

  if (user.role !== "ADMIN") {
    redirect(`/unauthorized?required=ADMIN&current=${user.role}`);
  }

  return (
    <div className="portal-shell admin">
      <aside className="sidebar">
        <div className="title">FSM Admin Portal</div>
        <nav>
          <NavLink href="/admin" label="Dashboard" />
          <NavLink href="/admin/inbox" label="Intake Inbox" />
          <NavLink href="/admin/jobs" label="Jobs" />
          <NavLink href="/admin/approvals" label="Approvals" />
          <NavLink href="/admin/archive" label="Archive" />
        </nav>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <strong>{user.name}</strong>
            <span className="meta" style={{ marginLeft: "0.45rem" }}>
              ({user.role})
            </span>
          </div>
          <Link className="btn ghost" href="/">
            Switch User
          </Link>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
