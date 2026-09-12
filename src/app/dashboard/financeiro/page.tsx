import { prisma } from "@/lib/prisma";
import { checkRole } from "@/lib/rbac";
import { createTransacao, deleteTransacao } from "./actions";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-ink-black focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/30";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { allowed } = await checkRole(["ADMIN", "FINANCEIRO"]);
  const { error } = await searchParams;

  if (!allowed) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-ink-black">Acesso restrito</h1>
        <p className="mt-2 text-sm text-slate-600">
          Apenas Administrador e Financeiro podem acessar esta área.
        </p>
      </div>
    );
  }

  const transacoes = await prisma.transacao.findMany({ orderBy: { data: "desc" } });
  const receitas = transacoes.filter((t) => t.tipo === "RECEITA").reduce((sum, t) => sum + t.valor, 0);
  const despesas = transacoes.filter((t) => t.tipo === "DESPESA").reduce((sum, t) => sum + t.valor, 0);
  const saldo = receitas - despesas;

  const currency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-ink-black">Financeiro</h1>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Receitas</p>
          <p className="mt-1 text-xl font-semibold text-green-700">{currency(receitas)}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Despesas</p>
          <p className="mt-1 text-xl font-semibold text-red-600">{currency(despesas)}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Saldo</p>
          <p className="mt-1 text-xl font-semibold text-ink-black">{currency(saldo)}</p>
        </div>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-ink-black">Novo lançamento</h2>
        <form action={createTransacao} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Tipo *</label>
            <select name="tipo" required className={inputClass}>
              <option value="RECEITA">Receita</option>
              <option value="DESPESA">Despesa</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Valor (R$) *</label>
            <input name="valor" required type="number" step="0.01" min="0" className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Descrição *</label>
            <input name="descricao" required className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Categoria</label>
            <input name="categoria" placeholder="Ex: banho, ração, salário..." className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Data *</label>
            <input name="data" type="date" required defaultValue={today()} className={inputClass} />
          </div>
          <div className="flex items-end sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-royal-blue px-4 py-2 text-sm font-medium text-white hover:bg-dodger-blue"
            >
              Lançar
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-ink-black">
          Lançamentos ({transacoes.length})
        </h2>
        <div className="mt-4 divide-y divide-slate-100">
          {transacoes.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">Nenhum lançamento ainda.</p>
          ) : (
            transacoes.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink-black">{t.descricao}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(t.data).toLocaleDateString("pt-BR")}
                    {t.categoria ? ` · ${t.categoria}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-medium ${t.tipo === "RECEITA" ? "text-green-700" : "text-red-600"}`}
                  >
                    {t.tipo === "RECEITA" ? "+" : "-"}
                    {currency(t.valor)}
                  </span>
                  <form action={deleteTransacao.bind(null, t.id)}>
                    <button type="submit" className="text-xs font-medium text-red-600 hover:text-red-700">
                      Excluir
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
