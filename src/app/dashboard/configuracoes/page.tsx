import Link from "next/link";
import { checkRole, ROLE_LABELS } from "@/lib/rbac";

export default async function ConfiguracoesPage() {
  const { allowed, session } = await checkRole(["ADMIN"]);

  if (!allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-platinum px-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-ink-black">
            Acesso restrito
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Seu perfil ({ROLE_LABELS[session.role]}) não tem permissão para
            acessar as configurações. Apenas o Administrador pode.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm font-medium text-royal-blue hover:text-dodger-blue"
          >
            ← Voltar ao dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-platinum px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-4">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-royal-blue hover:text-dodger-blue"
        >
          ← Voltar ao dashboard
        </Link>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-lg font-medium text-ink-black">Configurações</h1>
          <p className="mt-2 text-sm text-slate-600">
            Área restrita ao Administrador. Aqui entrarão, em fases futuras,
            a gestão de usuários/permissões e os dados da empresa.
          </p>
        </div>
      </div>
    </main>
  );
}
