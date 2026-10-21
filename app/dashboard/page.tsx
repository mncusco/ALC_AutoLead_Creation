import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { PublishCharts } from "@/components/PublishCharts";

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

  return (
    <main style={{ maxWidth: 960, margin: "2rem auto", fontFamily: "system-ui", padding: "0 1rem" }}>
      <h1>Dashboard — {organizationName}</h1>

      {byPlatform.length === 0 ? (
        <p>Nessuna pubblicazione ancora registrata. I report compariranno qui non appena il motore di generazione/pubblicazione sarà collegato.</p>
      ) : (
        <PublishCharts byPlatform={byPlatform as any} byStatus={byStatus as any} />
      )}

      <h2 style={{ marginTop: 32 }}>Ultime pubblicazioni</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Articolo</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Piattaforma</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Stato</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Data</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((r: any, i: number) => (
            <tr key={i}>
              <td>{r.title}</td>
              <td>{r.platform}</td>
              <td>{r.status}</td>
              <td>{r.published_at ? new Date(r.published_at).toLocaleString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
