import Link from "next/link";
import { redirect } from "next/navigation";
import { NavLink } from "@/components/nav-link";
import { PwaRegister } from "@/components/tech/pwa-register";
import { getCurrentUser } from "@/lib/auth";

export default async function TechLayout({
  children
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const user = await getCurrentUser();

  if (user.role !== "TECH") {
    redirect(`/unauthorized?required=TECH&current=${user.role}`);
  }

  return (
    <div className="portal-tech">
      <PwaRegister />
      <header className="tech-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong>Technician Portal</strong>
            <div className="meta" style={{ color: "#b4dacb" }}>
              {user.name}
            </div>
          </div>
          <Link className="btn ghost" href="/">
            Switch
          </Link>
        </div>
      </header>

      <main className="tech-content">{children}</main>

      <nav className="tech-nav">
        <NavLink href="/tech" label="My Jobs" />
        <NavLink href="/tech/queue" label="Upload Queue" />
        <NavLink href="/" label="Launcher" />
      </nav>
    </div>
  );
}
