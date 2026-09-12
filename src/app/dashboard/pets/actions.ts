"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";

const petSchema = z.object({
  clienteId: z.string().min(1, "Selecione o tutor"),
  name: z.string().min(1, "Informe o nome do pet"),
  species: z.string().min(1, "Informe a espécie"),
  breed: z.string().nullish(),
  birthDate: z.string().nullish(),
  weightKg: z.string().nullish(),
  notes: z.string().nullish(),
});

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function parsePetForm(formData: FormData) {
  return petSchema.safeParse({
    clienteId: formData.get("clienteId"),
    name: formData.get("name"),
    species: formData.get("species"),
    breed: formData.get("breed"),
    birthDate: formData.get("birthDate"),
    weightKg: formData.get("weightKg"),
    notes: formData.get("notes"),
  });
}

export async function createPet(returnTo: string, formData: FormData) {
  await requireSession();
  const parsed = parsePetForm(formData);

  if (!parsed.success) {
    redirectWithError(returnTo, parsed.error.issues[0]?.message ?? "Dados inválidos");
  }

  const { clienteId, name, species, breed, birthDate, weightKg, notes } = parsed.data;

  await prisma.pet.create({
    data: {
      clienteId,
      name,
      species,
      breed: breed || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      weightKg: weightKg ? Number(weightKg) : null,
      notes: notes || null,
    },
  });

  revalidatePath("/dashboard/pets");
  revalidatePath(`/dashboard/tutores/${clienteId}`);
  redirect(returnTo);
}

export async function updatePet(petId: string, returnTo: string, formData: FormData) {
  await requireSession();
  const parsed = parsePetForm(formData);

  if (!parsed.success) {
    redirectWithError(returnTo, parsed.error.issues[0]?.message ?? "Dados inválidos");
  }

  const { clienteId, name, species, breed, birthDate, weightKg, notes } = parsed.data;

  await prisma.pet.update({
    where: { id: petId },
    data: {
      clienteId,
      name,
      species,
      breed: breed || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      weightKg: weightKg ? Number(weightKg) : null,
      notes: notes || null,
    },
  });

  revalidatePath("/dashboard/pets");
  revalidatePath(`/dashboard/tutores/${clienteId}`);
  redirect(returnTo);
}

export async function deletePet(petId: string, clienteId: string, returnTo: string) {
  await requireSession();
  await prisma.pet.delete({ where: { id: petId } });
  revalidatePath("/dashboard/pets");
  revalidatePath(`/dashboard/tutores/${clienteId}`);
  redirect(returnTo);
}
