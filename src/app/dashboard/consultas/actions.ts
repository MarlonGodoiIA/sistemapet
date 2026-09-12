"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";

const STATUSES = ["AGENDADA", "EM_ATENDIMENTO", "CONCLUIDA", "CANCELADA"] as const;

const consultaSchema = z.object({
  petId: z.string().min(1, "Selecione o pet"),
  veterinarioId: z.string().min(1, "Selecione o veterinário"),
  dataHora: z.string().min(1, "Informe data e hora"),
  motivo: z.string().min(1, "Informe o motivo da consulta"),
});

const updateSchema = z.object({
  status: z.enum(STATUSES),
  diagnostico: z.string().nullish(),
  prescricao: z.string().nullish(),
});

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createConsulta(formData: FormData) {
  await requireSession();

  const parsed = consultaSchema.safeParse({
    petId: formData.get("petId"),
    veterinarioId: formData.get("veterinarioId"),
    dataHora: formData.get("dataHora"),
    motivo: formData.get("motivo"),
  });

  if (!parsed.success) {
    redirectWithError("/dashboard/consultas", parsed.error.issues[0]?.message ?? "Dados inválidos");
  }

  const { petId, veterinarioId, dataHora, motivo } = parsed.data;

  await prisma.consulta.create({
    data: { petId, veterinarioId, dataHora: new Date(dataHora), motivo },
  });

  revalidatePath("/dashboard/consultas");
  redirect("/dashboard/consultas");
}

export async function updateConsulta(consultaId: string, formData: FormData) {
  await requireSession();

  const parsed = updateSchema.safeParse({
    status: formData.get("status"),
    diagnostico: formData.get("diagnostico"),
    prescricao: formData.get("prescricao"),
  });

  if (!parsed.success) {
    redirectWithError(
      `/dashboard/consultas/${consultaId}`,
      parsed.error.issues[0]?.message ?? "Dados inválidos",
    );
  }

  const { status, diagnostico, prescricao } = parsed.data;

  await prisma.consulta.update({
    where: { id: consultaId },
    data: { status, diagnostico: diagnostico || null, prescricao: prescricao || null },
  });

  revalidatePath("/dashboard/consultas");
  revalidatePath(`/dashboard/consultas/${consultaId}`);
  redirect(`/dashboard/consultas/${consultaId}`);
}

export async function deleteConsulta(consultaId: string) {
  await requireSession();
  await prisma.consulta.delete({ where: { id: consultaId } });
  revalidatePath("/dashboard/consultas");
  redirect("/dashboard/consultas");
}
