# PetSystem

Sistema de gestão para Pet Shop e Clínica Veterinária.

Stack: Next.js (App Router, TypeScript) + Tailwind CSS + Prisma + SQLite (arquivo local, sem servidor de banco separado).

## Rodando sem instalar nada (Windows)

Para uso não técnico, existe um pacote pronto ("PetSystem-Windows") com um Node.js portátil embutido e o banco de dados já configurado — basta extrair o `.zip` e dar duplo clique em `Iniciar-PetSystem.bat`. Peça esse pacote separadamente; ele não fica versionado neste repositório (é um artefato de build, não código-fonte).

## Setup local para desenvolvimento

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o `.env` (copie `.env.example`) — o padrão já usa um arquivo SQLite local, não precisa de banco externo.
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
- `src/proxy.ts` — protege rotas autenticadas (redireciona para `/login`)

## Design system

Paleta e tipografia (Google Font Inter) configuradas em `src/app/globals.css` via `@theme` do Tailwind v4: `royal-blue`, `dodger-blue`, `platinum`, `spring-green`, `ink-black`, `electric-indigo`, `pumpkin-spice`.
