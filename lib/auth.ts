import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sql } from "./db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const rows = await sql`
          SELECT u.id, u.email, u.password_hash, u.role,
                 u.organization_id, o.name AS organization_name
          FROM users u
          JOIN organizations o ON o.id = u.organization_id
          WHERE u.email = ${credentials.email}
          LIMIT 1
        `;
        const user = rows[0];
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password_hash as string);
        if (!valid) return null;

        return {
          id: user.id as string,
          email: user.email as string,
          role: user.role as string,
          organizationId: user.organization_id as string,
          organizationName: user.organization_name as string,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.organizationId = u.organizationId;
        token.organizationName = u.organizationName;
        token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).organizationId = token.organizationId;
      (session as any).organizationName = token.organizationName;
      (session as any).role = token.role;
      return session;
    },
  },
};
