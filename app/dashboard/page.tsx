import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { PublishCharts } from "@/components/PublishCharts";
import { AppNav } from "@/components/AppNav";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const organizationId = (session as any).organizationId as string;
  const organizationName = (session as any).organizationName as string;

  const byPlatform = await sql`
    SELECT platform, COUNT(*)::int AS count
    FROM publish_events
    WHERE organization_id = ${organizationId}
    GROUP BY platform
    ORDER BY count DESC
  `;

  const byStatus = await sql`
    SELECT status, COUNT(*)::int AS count
    FROM publish_events
    WHERE organization_id = ${organizationId}
    GROUP BY status
    ORDER BY count DESC
  `;

  const recent = await sql`
    SELECT pe.platform, pe.status, pe.published_at, a.title
    FROM publish_events pe
    JOIN articles a ON a.id = pe.article_id
    WHERE pe.organization_id = ${organizationId}
    ORDER BY pe.created_at DESC
    LIMIT 10
  `;

  const [articleCount] = await sql`
    SELECT COUNT(*)::int AS count FROM articles WHERE organization_id = ${organizationId}
  `;

  return (
    <>
      <AppNav />
      <main className="app-main">
        <h1>Dashboard — {organizationName}</h1>

        {byPlatform.length === 0 ? (
          <div className="empty-note">
            {articleCount.count > 0
              ? "Hai articoli generati ma nessuna pubblicazione registrata ancora. Vai in Articoli per pubblicarne uno."
              : "Nessun articolo generato ancora. Vai in Articoli per crearne uno."}
          </div>
        ) : (
          <div className="card">
            <PublishCharts byPlatform={byPlatform as any} byStatus={byStatus as any} />
          </div>
        )}

        <h2>Ultime pubblicazioni</h2>
        {recent.length === 0 ? (
          <p className="empty-note">Compariranno qui non appena pubblichi un articolo.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Articolo</th>
                <th>Piattaforma</th>
                <th>Stato</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r: any, i: number) => (
                <tr key={i}>
                  <td>{r.title}</td>
                  <td>{r.platform}</td>
                  <td><span className={`status-pill ${r.status}`}>{r.status}</span></td>
                  <td>{r.published_at ? new Date(r.published_at).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
}
