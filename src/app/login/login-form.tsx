"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="w-full max-w-sm space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-ink-black">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-ink-black focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/30"
          placeholder="voce@petsystem.com"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-ink-black">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-ink-black focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/30"
          placeholder="••••••••"
        />
      </div>

      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-royal-blue px-4 py-2 font-medium text-white transition hover:bg-dodger-blue disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
