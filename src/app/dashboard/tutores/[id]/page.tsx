import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";
import { updateCliente, deleteCliente } from "../actions";
import { createPet, deletePet } from "@/app/dashboard/pets/actions";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-ink-black focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/30";

export default async function TutorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireSession();
  const { id } = await params;
  const { error } = await searchParams;

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: { pets: { orderBy: { name: "asc" } } },
  });

  if (!cliente) notFound();

  const returnTo = `/dashboard/tutores/${id}`;
  const updateClienteWithId = updateCliente.bind(null, id);
  const createPetForTutor = createPet.bind(null, returnTo);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/dashboard/tutores" className="text-sm font-medium text-royal-blue hover:text-dodger-blue">
        ← Voltar para tutores
      </Link>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-lg font-medium text-ink-black">Dados do tutor</h1>
        <form action={updateClienteWithId} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Nome *</label>
            <input name="name" required defaultValue={cliente.name} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Telefone *</label>
            <input name="phone" required defaultValue={cliente.phone} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">E-mail</label>
            <input name="email" type="email" defaultValue={cliente.email ?? ""} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Endereço</label>
            <input name="address" defaultValue={cliente.address ?? ""} className={inputClass} />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-royal-blue px-4 py-2 text-sm font-medium text-white hover:bg-dodger-blue"
            >
              Salvar alterações
            </button>
          </div>
        </form>
        <form action={deleteCliente.bind(null, id)} className="mt-4 border-t border-slate-100 pt-4">
          <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-700">
            Excluir tutor (e todos os pets vinculados)
          </button>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-ink-black">Adicionar pet</h2>
        <form action={createPetForTutor} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input type="hidden" name="clienteId" value={cliente.id} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Nome *</label>
            <input name="name" required className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Espécie *</label>
            <input name="species" required placeholder="Cão, gato..." className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Raça</label>
            <input name="breed" className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Data de nascimento</label>
            <input name="birthDate" type="date" className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Peso (kg)</label>
            <input name="weightKg" type="number" step="0.1" className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-royal-blue px-4 py-2 text-sm font-medium text-white hover:bg-dodger-blue"
            >
              Adicionar pet
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-ink-black">
          Pets de {cliente.name} ({cliente.pets.length})
        </h2>
        <div className="mt-4 divide-y divide-slate-100">
          {cliente.pets.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">Nenhum pet cadastrado ainda.</p>
          ) : (
            cliente.pets.map((pet) => (
              <div key={pet.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink-black">{pet.name}</p>
                  <p className="text-xs text-slate-500">
                    {pet.species}
                    {pet.breed ? ` · ${pet.breed}` : ""}
                  </p>
                </div>
                <form action={deletePet.bind(null, pet.id, cliente.id, returnTo)}>
                  <button type="submit" className="text-xs font-medium text-red-600 hover:text-red-700">
                    Remover
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
