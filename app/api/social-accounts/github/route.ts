import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  const organizationId = (session as any).organizationId as string;

  const { owner, repo, branch, postsPath, token } = await req.json();
  if (!owner || !repo || !token) {
    return NextResponse.json({ error: "Campi mancanti" }, { status: 400 });
  }

  await sql`DELETE FROM social_accounts WHERE organization_id = ${organizationId} AND platform = 'github_pages'`;
  await sql`
    INSERT INTO social_accounts (organization_id, platform, access_token_encrypted, config)
    VALUES (${organizationId}, 'github_pages', '', ${JSON.stringify({ owner, repo, branch: branch || "main", postsPath: postsPath || "posts", token })}::jsonb)
  `;

  return NextResponse.json({ ok: true });
}
