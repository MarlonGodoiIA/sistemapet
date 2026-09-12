"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";

const clienteSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  phone: z.string().min(1, "Informe o telefone"),
  email: z.string().email("E-mail inválido").nullish().or(z.literal("")),
  address: z.string().nullish(),
  notes: z.string().nullish(),
});

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createCliente(formData: FormData) {
  await requireSession();

  const parsed = clienteSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    redirectWithError("/dashboard/tutores", parsed.error.issues[0]?.message ?? "Dados inválidos");
  }

  const { name, phone, email, address, notes } = parsed.data;

  await prisma.cliente.create({
    data: { name, phone, email: email || null, address: address || null, notes: notes || null },
  });

  revalidatePath("/dashboard/tutores");
  redirect("/dashboard/tutores");
}

export async function updateCliente(clienteId: string, formData: FormData) {
  await requireSession();

  const parsed = clienteSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    redirectWithError(
      `/dashboard/tutores/${clienteId}`,
      parsed.error.issues[0]?.message ?? "Dados inválidos",
    );
  }

  const { name, phone, email, address, notes } = parsed.data;

  await prisma.cliente.update({
    where: { id: clienteId },
    data: { name, phone, email: email || null, address: address || null, notes: notes || null },
  });

  revalidatePath("/dashboard/tutores");
  revalidatePath(`/dashboard/tutores/${clienteId}`);
  redirect(`/dashboard/tutores/${clienteId}`);
}

export async function deleteCliente(clienteId: string) {
  await requireSession();
  await prisma.cliente.delete({ where: { id: clienteId } });
  revalidatePath("/dashboard/tutores");
  redirect("/dashboard/tutores");
}
