import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";
import { createCliente } from "./actions";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-ink-black focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/30";

export default async function TutoresPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; q?: string }>;
}) {
  await requireSession();
  const { error, q } = await searchParams;

  const clientes = await prisma.cliente.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { phone: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : undefined,
    include: { _count: { select: { pets: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-ink-black">Tutores</h1>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-ink-black">Novo tutor</h2>
        <form action={createCliente} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Nome *</label>
            <input name="name" required className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Telefone *</label>
            <input name="phone" required className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">E-mail</label>
            <input name="email" type="email" className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Endereço</label>
            <input name="address" className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-royal-blue px-4 py-2 text-sm font-medium text-white hover:bg-dodger-blue"
            >
              Cadastrar tutor
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium text-ink-black">
            Tutores cadastrados ({clientes.length})
          </h2>
          <form className="w-56">
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por nome/telefone"
              className={inputClass}
            />
          </form>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {clientes.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">Nenhum tutor cadastrado ainda.</p>
          ) : (
            clientes.map((cliente) => (
              <Link
                key={cliente.id}
                href={`/dashboard/tutores/${cliente.id}`}
                className="flex items-center justify-between py-3 hover:bg-platinum"
              >
                <div>
                  <p className="text-sm font-medium text-ink-black">{cliente.name}</p>
                  <p className="text-xs text-slate-500">
                    {cliente.phone}
                    {cliente.email ? ` · ${cliente.email}` : ""}
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {cliente._count.pets} pet(s)
                </span>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
