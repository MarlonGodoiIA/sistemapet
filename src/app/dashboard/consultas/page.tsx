import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";
import { createConsulta } from "./actions";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-ink-black focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/30";

const STATUS_LABELS: Record<string, string> = {
  AGENDADA: "Agendada",
  EM_ATENDIMENTO: "Em atendimento",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

const STATUS_COLORS: Record<string, string> = {
  AGENDADA: "bg-blue-50 text-royal-blue",
  EM_ATENDIMENTO: "bg-orange-50 text-pumpkin-spice",
  CONCLUIDA: "bg-green-50 text-green-700",
  CANCELADA: "bg-slate-100 text-slate-500",
};

export default async function ConsultasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireSession();
  const { error } = await searchParams;

  const [consultas, pets, veterinarios] = await Promise.all([
    prisma.consulta.findMany({
      include: { pet: { include: { cliente: true } }, veterinario: true },
      orderBy: { dataHora: "desc" },
    }),
    prisma.pet.findMany({ include: { cliente: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { role: "VETERINARIO", active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-ink-black">Consultas</h1>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-ink-black">Nova consulta</h2>
        {pets.length === 0 || veterinarios.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            {pets.length === 0 ? "Cadastre um pet" : "Cadastre um veterinário"} antes de agendar
            uma consulta.{" "}
            {pets.length === 0 ? (
              <Link href="/dashboard/pets" className="font-medium text-royal-blue hover:text-dodger-blue">
                Ir para Pets
              </Link>
            ) : (
              <Link href="/dashboard/equipe" className="font-medium text-royal-blue hover:text-dodger-blue">
                Ir para Equipe
              </Link>
            )}
          </p>
        ) : (
          <form action={createConsulta} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-ink-black">Pet *</label>
              <select name="petId" required className={inputClass}>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} ({pet.cliente.name})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-ink-black">Veterinário *</label>
              <select name="veterinarioId" required className={inputClass}>
                {veterinarios.map((vet) => (
                  <option key={vet.id} value={vet.id}>
                    {vet.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-ink-black">Data e hora *</label>
              <input name="dataHora" type="datetime-local" required className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-ink-black">Motivo *</label>
              <input name="motivo" required className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-royal-blue px-4 py-2 text-sm font-medium text-white hover:bg-dodger-blue"
              >
                Agendar consulta
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-ink-black">
          Consultas ({consultas.length})
        </h2>
        <div className="mt-4 divide-y divide-slate-100">
          {consultas.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">Nenhuma consulta agendada ainda.</p>
          ) : (
            consultas.map((consulta) => (
              <Link
                key={consulta.id}
                href={`/dashboard/consultas/${consulta.id}`}
                className="flex items-center justify-between gap-4 py-3 hover:bg-platinum"
              >
                <div>
                  <p className="text-sm font-medium text-ink-black">
                    {consulta.pet.name} ({consulta.pet.cliente.name})
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(consulta.dataHora).toLocaleString("pt-BR")} · Dr(a).{" "}
                    {consulta.veterinario.name} · {consulta.motivo}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[consulta.status]}`}
                >
                  {STATUS_LABELS[consulta.status]}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
