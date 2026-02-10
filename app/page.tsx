import Link from "next/link";
import { ROLE_HOME, listDemoUsers } from "@/lib/auth";

export default function HomePage(): React.ReactElement {
  const users = listDemoUsers();

  return (
    <main className="container" style={{ paddingTop: "3rem", display: "grid", gap: "1rem" }}>
      <section className="card">
        <h1>simuNet Field Service Management</h1>
        <p className="meta">
          Single Next.js deployment with role-based portals: <code>/admin</code>, <code>/tech</code>, and
          <code> /client</code>.
        </p>
      </section>

      <section className="card">
        <h2>Quick Role Switch (Demo)</h2>
        <div className="grid cols-2">
          {users.map((user) => (
            <article key={user.id} className="card" style={{ background: "#fdfefe" }}>
              <h3 style={{ marginBottom: "0.3rem" }}>{user.name}</h3>
              <p className="meta" style={{ marginTop: 0 }}>
                Role: {user.role}
              </p>
              <Link
                className="btn"
                href={`/api/auth/switch?userId=${user.id}&next=${ROLE_HOME[user.role]}`}
              >
                Open {ROLE_HOME[user.role]}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
