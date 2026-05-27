import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";

async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  try {
    const bcrypt = await import("bcryptjs");
    return bcrypt.compare(plain, hashed);
  } catch {
    return false;
  }
}

async function findOrCreateOAuthUser(email: string, name?: string | null) {
  if (!supabase) return null;
  const normalized = email.toLowerCase().trim();

  const { data: existing } = await supabase
    .from("users")
    .select("id, email, name")
    .eq("email", normalized)
    .maybeSingle();

  if (existing) return existing;

  const referralCode = "GS" + Math.random().toString(36).slice(2, 10).toUpperCase();
  const { data: created, error } = await supabase
    .from("users")
    .insert({
      email: normalized,
      name: name ?? normalized.split("@")[0],
      password_hash: "OAUTH_NO_PASSWORD",
      referral_code: referralCode,
    })
    .select("id, email, name")
    .single();

  if (error || !created) return null;

  const v1 = await supabase.from("users").update({ email_verified: true }).eq("id", created.id);
  if (v1.error) {
    await supabase
      .from("users")
      .update({ email_verified: new Date().toISOString() } as never)
      .eq("id", created.id);
  }

  return created;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),

    CredentialsProvider({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;
        if (!supabase) return null;

        const { data: user } = await supabase
          .from("users")
          .select("id, email, password_hash, name, email_verified")
          .eq("email", email.toLowerCase().trim())
          .single();

        if (!user?.password_hash) return null;
        if (user.password_hash === "OAUTH_NO_PASSWORD") return null;
        if (!user.email_verified) return null;

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),

    CredentialsProvider({
      id: "email-code",
      name: "Email Code",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string)?.toLowerCase().trim();
        const code = credentials?.code as string;
        if (!email || !code) return null;
        if (!supabase) return null;

        const { data: record } = await supabase
          .from("verification_codes")
          .select("id, email, code, used, expires_at")
          .eq("email", email)
          .eq("code", code)
          .eq("used", false)
          .gte("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!record) return null;

        await supabase.from("verification_codes").update({ used: true }).eq("id", record.id);

        const { data: user } = await supabase
          .from("users")
          .select("id, email, name")
          .eq("email", email)
          .single();

        if (!user) return null;

        if (!(user as Record<string, unknown>).email_verified) {
          await supabase.from("users").update({ email_verified: true }).eq("id", user.id);
        }

        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),

    CredentialsProvider({
      id: "telegram-token",
      name: "Telegram",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const token = credentials?.token as string;
        if (!token) return null;
        if (!supabase) return null;

        const { data: record } = await supabase
          .from("telegram_login_tokens")
          .select("*")
          .eq("token", token)
          .gte("expires_at", new Date().toISOString())
          .maybeSingle();

        if (!record) return null;
        if ((record as Record<string, unknown>).used === true) return null;

        const markUsed = await supabase.from("telegram_login_tokens").update({ used: true }).eq("id", (record as { id: string }).id);
        if (markUsed.error) {
          await supabase.from("telegram_login_tokens").delete().eq("id", (record as { id: string }).id);
        }

        const telegramEmail = `tg_${record.telegram_id}@telegram.user`;
        const displayName = [record.first_name, record.last_name].filter(Boolean).join(" ") || record.username || `Telegram ${record.telegram_id}`;

        const user = await findOrCreateOAuthUser(telegramEmail, displayName);
        if (!user) return null;

        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const dbUser = await findOrCreateOAuthUser(user.email, user.name);
        if (dbUser) user.id = dbUser.id;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});
