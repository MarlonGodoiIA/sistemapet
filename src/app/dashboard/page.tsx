import Link from "next/link";
import { requireSession, ROLE_LABELS } from "@/lib/rbac";
import { logout } from "./actions";

export default async function DashboardPage() {
  const session = await requireSession();

  return (
    <main className="min-h-screen bg-platinum px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink-black">PetSystem</h1>
            <p className="text-sm text-slate-500">
              Olá, {session.name} · {ROLE_LABELS[session.role]}
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink-black hover:bg-white"
            >
              Sair
            </button>
          </form>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-ink-black">
            Fase 0 concluída
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Login, sessão e controle de permissões por perfil estão
            funcionando. As próximas fases (Clientes, Pets, Agenda...) serão
            construídas a partir daqui.
          </p>
          <Link
            href="/dashboard/configuracoes"
            className="mt-4 inline-block text-sm font-medium text-royal-blue hover:text-dodger-blue"
          >
            Testar área restrita (somente Administrador) →
          </Link>
        </section>
      </div>
    </main>
  );
}
