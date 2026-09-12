import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";

export default async function DashboardPage() {
  await requireSession();

  const [totalClientes, totalPets, consultasHoje, saldoAgregado] = await Promise.all([
    prisma.cliente.count(),
    prisma.pet.count(),
    prisma.consulta.count({
      where: {
        dataHora: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(24, 0, 0, 0)),
        },
      },
    }),
    prisma.transacao.groupBy({
      by: ["tipo"],
      _sum: { valor: true },
    }),
  ]);

  const receitas = saldoAgregado.find((t) => t.tipo === "RECEITA")?._sum.valor ?? 0;
  const despesas = saldoAgregado.find((t) => t.tipo === "DESPESA")?._sum.valor ?? 0;
  const saldo = receitas - despesas;

  const cards = [
    { label: "Tutores cadastrados", value: totalClientes },
    { label: "Pets cadastrados", value: totalPets },
    { label: "Consultas hoje", value: consultasHoje },
    {
      label: "Saldo financeiro",
      value: saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-ink-black">Visão geral</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold text-ink-black">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
