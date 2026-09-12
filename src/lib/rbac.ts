import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/lib/session";
import type { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  RECEPCIONISTA: "Recepcionista",
  VETERINARIO: "Veterinário",
  GROOMER: "Groomer (Banho e Tosa)",
  FINANCEIRO: "Financeiro",
  CLIENTE: "Cliente (tutor)",
};

/** Middleware já garante sessão nas rotas protegidas; isto cobre o caso de borda de cookie expirado entre o middleware e o render. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export type RoleCheck =
  | { allowed: true; session: SessionPayload }
  | { allowed: false; session: SessionPayload };

export async function checkRole(allowed: Role[]): Promise<RoleCheck> {
  const session = await requireSession();
  return { allowed: allowed.includes(session.role), session };
}
