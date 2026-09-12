import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";
import { updateConsulta, deleteConsulta } from "../actions";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-ink-black focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/30";

const STATUS_OPTIONS = [
  { value: "AGENDADA", label: "Agendada" },
  { value: "EM_ATENDIMENTO", label: "Em atendimento" },
  { value: "CONCLUIDA", label: "Concluída" },
  { value: "CANCELADA", label: "Cancelada" },
];

export default async function ConsultaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireSession();
  const { id } = await params;
  const { error } = await searchParams;

  const consulta = await prisma.consulta.findUnique({
    where: { id },
    include: { pet: { include: { cliente: true } }, veterinario: true },
  });

  if (!consulta) notFound();

  const updateConsultaWithId = updateConsulta.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/dashboard/consultas" className="text-sm font-medium text-royal-blue hover:text-dodger-blue">
        ← Voltar para consultas
      </Link>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-lg font-medium text-ink-black">
          {consulta.pet.name} ({consulta.pet.cliente.name})
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {new Date(consulta.dataHora).toLocaleString("pt-BR")} · Dr(a). {consulta.veterinario.name}
        </p>
        <p className="mt-2 text-sm text-ink-black">
          <span className="font-medium">Motivo:</span> {consulta.motivo}
        </p>

        <form action={updateConsultaWithId} className="mt-4 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Status</label>
            <select name="status" defaultValue={consulta.status} className={inputClass}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Diagnóstico</label>
            <textarea
              name="diagnostico"
              rows={3}
              defaultValue={consulta.diagnostico ?? ""}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Prescrição</label>
            <textarea
              name="prescricao"
              rows={3}
              defaultValue={consulta.prescricao ?? ""}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-royal-blue px-4 py-2 text-sm font-medium text-white hover:bg-dodger-blue"
          >
            Salvar
          </button>
        </form>

        <form action={deleteConsulta.bind(null, id)} className="mt-4 border-t border-slate-100 pt-4">
          <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-700">
            Excluir consulta
          </button>
        </form>
      </section>
    </div>
  );
}
