"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { hashPassword } from "@/lib/auth";

const ROLES = ["ADMIN", "RECEPCIONISTA", "VETERINARIO", "GROOMER", "FINANCEIRO", "CLIENTE"] as const;

const userSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres"),
  role: z.enum(ROLES),
});

function redirectWithError(message: string): never {
  redirect(`/dashboard/equipe?error=${encodeURIComponent(message)}`);
}

export async function createUser(formData: FormData) {
  await requireRole(["ADMIN"]);

  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    redirectWithError(parsed.error.issues[0]?.message ?? "Dados inválidos");
  }

  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirectWithError("Já existe um usuário com este e-mail");
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({ data: { name, email, passwordHash, role } });

  revalidatePath("/dashboard/equipe");
  redirect("/dashboard/equipe");
}

export async function toggleUserActive(userId: string, active: boolean) {
  await requireRole(["ADMIN"]);
  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/dashboard/equipe");
  redirect("/dashboard/equipe");
}
