import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  const seedUsers = [
    {
      name: "Admin PetSystem",
      email: "admin@petsystem.com",
      password: "admin123",
      role: "ADMIN" as const,
    },
    {
      name: "Recepção PetSystem",
      email: "recepcao@petsystem.com",
      password: "recepcao123",
      role: "RECEPCIONISTA" as const,
    },
  ];

  for (const user of seedUsers) {
    const passwordHash = await hashPassword(user.password);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role,
      },
    });
    console.log(`Usuário pronto: ${user.email} / ${user.password}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
