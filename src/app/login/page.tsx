import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-platinum px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-ink-black">PetSystem</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestão de Pet Shop e Clínica Veterinária
          </p>
        </div>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
