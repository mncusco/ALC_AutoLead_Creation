import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { STARTER_TEMPLATES } from "@/lib/starterTemplates";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: Request) {
  const { organizationName, email, password } = await req.json();

  if (!organizationName || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password too short" }, { status: 400 });
  }

  const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const slug = `${slugify(organizationName)}-${Math.random().toString(36).slice(2, 7)}`;
  const passwordHash = await bcrypt.hash(password, 10);

  const [org] = await sql`
    INSERT INTO organizations (name, slug, plan)
    VALUES (${organizationName}, ${slug}, 'trial')
    RETURNING id
  `;

  await sql`
    INSERT INTO users (organization_id, email, password_hash, role)
    VALUES (${org.id}, ${email}, ${passwordHash}, 'owner')
  `;

  for (const tpl of STARTER_TEMPLATES) {
    await sql`
      INSERT INTO content_templates (organization_id, name, label, language, prompt)
      VALUES (${org.id}, ${tpl.name}, ${tpl.label}, ${tpl.language}, ${tpl.prompt})
    `;
  }

  return NextResponse.json({ ok: true });
}
