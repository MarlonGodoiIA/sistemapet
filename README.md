# PetSystem

Sistema de gestão para Pet Shop e Clínica Veterinária.

Stack: Next.js (App Router, TypeScript) + Tailwind CSS + Prisma + PostgreSQL.

## Setup local

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o `.env` (copie `.env.example`) com a `DATABASE_URL` de um Postgres local e um `JWT_SECRET`.
3. Aplique as migrações:
   ```bash
   npx prisma migrate dev
   ```
4. Rode o seed (cria usuários de teste):
   ```bash
   npx prisma db seed
   ```
5. Suba o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Usuários de teste (seed)

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | admin@petsystem.com | admin123 |
| Recepcionista | recepcao@petsystem.com | recepcao123 |

## Estrutura

- `src/app` — rotas (App Router)
- `src/lib` — sessão/JWT, RBAC, Prisma client, hashing de senha
- `prisma/schema.prisma` — modelo de dados
- `src/middleware.ts` — protege rotas autenticadas (redireciona para `/login`)

## Design system

Paleta e tipografia (Google Font Inter) configuradas em `src/app/globals.css` via `@theme` do Tailwind v4: `royal-blue`, `dodger-blue`, `platinum`, `spring-green`, `ink-black`, `electric-indigo`, `pumpkin-spice`.
