import Link from "next/link";
import { requireSession, ROLE_LABELS } from "@/lib/rbac";
import { logout } from "./actions";

const NAV_ITEMS: { href: string; label: string; roles?: string[] }[] = [
  { href: "/dashboard", label: "Início" },
  { href: "/dashboard/tutores", label: "Tutores" },
  { href: "/dashboard/pets", label: "Pets" },
  { href: "/dashboard/consultas", label: "Consultas" },
  { href: "/dashboard/financeiro", label: "Financeiro", roles: ["ADMIN", "FINANCEIRO"] },
  { href: "/dashboard/equipe", label: "Equipe", roles: ["ADMIN"] },
  { href: "/dashboard/configuracoes", label: "Configurações", roles: ["ADMIN"] },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(session.role));

  return (
    <div className="flex min-h-screen bg-platinum">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white sm:flex">
        <div className="px-5 py-5">
          <span className="text-lg font-semibold text-ink-black">PetSystem</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-black hover:bg-platinum"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <p className="text-sm font-medium text-ink-black">{session.name}</p>
            <p className="text-xs text-slate-500">{ROLE_LABELS[session.role]}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink-black hover:bg-platinum"
            >
              Sair
            </button>
          </form>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 sm:hidden">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-black hover:bg-platinum"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
