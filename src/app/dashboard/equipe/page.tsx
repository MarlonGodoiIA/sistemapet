import { prisma } from "@/lib/prisma";
import { checkRole, ROLE_LABELS } from "@/lib/rbac";
import { createUser, toggleUserActive } from "./actions";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-ink-black focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/30";

export default async function EquipePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { allowed } = await checkRole(["ADMIN"]);
  const { error } = await searchParams;

  if (!allowed) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-ink-black">Acesso restrito</h1>
        <p className="mt-2 text-sm text-slate-600">Apenas o Administrador pode gerenciar a equipe.</p>
      </div>
    );
  }

  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-ink-black">Equipe</h1>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-ink-black">Novo membro da equipe</h2>
        <form action={createUser} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Nome *</label>
            <input name="name" required className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">E-mail *</label>
            <input name="email" type="email" required className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Senha provisória *</label>
            <input name="password" type="password" required minLength={6} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink-black">Perfil *</label>
            <select name="role" required className={inputClass}>
              <option value="VETERINARIO">Veterinário</option>
              <option value="RECEPCIONISTA">Recepcionista</option>
              <option value="GROOMER">Groomer (Banho e Tosa)</option>
              <option value="FINANCEIRO">Financeiro</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-royal-blue px-4 py-2 text-sm font-medium text-white hover:bg-dodger-blue"
            >
              Cadastrar
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-ink-black">Usuários ({users.length})</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink-black">
                  {user.name}
                  {!user.active ? (
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      inativo
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-slate-500">
                  {user.email} · {ROLE_LABELS[user.role]}
                </p>
              </div>
              <form action={toggleUserActive.bind(null, user.id, !user.active)}>
                <button
                  type="submit"
                  className="text-xs font-medium text-royal-blue hover:text-dodger-blue"
                >
                  {user.active ? "Desativar" : "Reativar"}
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
