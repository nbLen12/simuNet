import Link from "next/link";

export default async function UnauthorizedPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.ReactElement> {
  const params = await searchParams;
  const required = params.required ?? "UNKNOWN";
  const current = params.current ?? "UNKNOWN";

  return (
    <main className="container" style={{ paddingTop: "3rem" }}>
      <section className="card" style={{ maxWidth: "640px", margin: "0 auto" }}>
        <h1>Access Denied</h1>
        <p>
          This route requires role <strong>{String(required)}</strong>, while current session role is
          <strong> {String(current)}</strong>.
        </p>
        <p className="meta">
          Use the portal switch links on the landing page to open the correct route for your user.
        </p>
        <Link className="btn secondary" href="/">
          Back to Launcher
        </Link>
      </section>
    </main>
  );
}
