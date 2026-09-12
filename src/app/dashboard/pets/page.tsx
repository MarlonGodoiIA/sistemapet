import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";
import { createPet } from "./actions";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-ink-black focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/30";

export default async function PetsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; q?: string }>;
}) {
  await requireSession();
  const { error, q } = await searchParams;

  const [pets, clientes] = await Promise.all([
    prisma.pet.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q } },
              { species: { contains: q } },
              { cliente: { name: { contains: q } } },
            ],
          }
        : undefined,
      include: { cliente: true },
      orderBy: { name: "asc" },
    }),
    prisma.cliente.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const createPetHere = createPet.bind(null, "/dashboard/pets");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-ink-black">Pets</h1>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-ink-black">Novo pet</h2>
        {clientes.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            Cadastre um tutor primeiro em{" "}
            <Link href="/dashboard/tutores" className="font-medium text-royal-blue hover:text-dodger-blue">
              Tutores
            </Link>
            .
          </p>
        ) : (
          <form action={createPetHere} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-ink-black">Tutor *</label>
              <select name="clienteId" required className={inputClass}>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.name}
                  </option>
                ))}
              </select>
            </div>
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
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-royal-blue px-4 py-2 text-sm font-medium text-white hover:bg-dodger-blue"
              >
                Cadastrar pet
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium text-ink-black">Pets cadastrados ({pets.length})</h2>
          <form className="w-56">
            <input name="q" defaultValue={q} placeholder="Buscar pet/tutor" className={inputClass} />
          </form>
        </div>
        <div className="mt-4 divide-y divide-slate-100">
          {pets.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">Nenhum pet cadastrado ainda.</p>
          ) : (
            pets.map((pet) => (
              <Link
                key={pet.id}
                href={`/dashboard/tutores/${pet.clienteId}`}
                className="flex items-center justify-between py-3 hover:bg-platinum"
              >
                <div>
                  <p className="text-sm font-medium text-ink-black">{pet.name}</p>
                  <p className="text-xs text-slate-500">
                    {pet.species}
                    {pet.breed ? ` · ${pet.breed}` : ""} · tutor: {pet.cliente.name}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
