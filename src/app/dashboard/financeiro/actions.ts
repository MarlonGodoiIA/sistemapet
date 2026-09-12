"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

const transacaoSchema = z.object({
  tipo: z.enum(["RECEITA", "DESPESA"]),
  descricao: z.string().min(1, "Informe a descrição"),
  valor: z.string().min(1, "Informe o valor"),
  categoria: z.string().nullish(),
  data: z.string().min(1, "Informe a data"),
});

function redirectWithError(message: string): never {
  redirect(`/dashboard/financeiro?error=${encodeURIComponent(message)}`);
}

export async function createTransacao(formData: FormData) {
  await requireRole(["ADMIN", "FINANCEIRO"]);

  const parsed = transacaoSchema.safeParse({
    tipo: formData.get("tipo"),
    descricao: formData.get("descricao"),
    valor: formData.get("valor"),
    categoria: formData.get("categoria"),
    data: formData.get("data"),
  });

  if (!parsed.success) {
    redirectWithError(parsed.error.issues[0]?.message ?? "Dados inválidos");
  }

  const { tipo, descricao, valor, categoria, data } = parsed.data;
  const valorNumerico = Number(valor.replace(",", "."));

  if (Number.isNaN(valorNumerico) || valorNumerico <= 0) {
    redirectWithError("Informe um valor válido");
  }

  await prisma.transacao.create({
    data: {
      tipo,
      descricao,
      valor: valorNumerico,
      categoria: categoria || null,
      data: new Date(data),
    },
  });

  revalidatePath("/dashboard/financeiro");
  redirect("/dashboard/financeiro");
}

export async function deleteTransacao(transacaoId: string) {
  await requireRole(["ADMIN", "FINANCEIRO"]);
  await prisma.transacao.delete({ where: { id: transacaoId } });
  revalidatePath("/dashboard/financeiro");
  redirect("/dashboard/financeiro");
}
