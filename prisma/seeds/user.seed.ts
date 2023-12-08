import { PrismaClient, UserRole } from "@prisma/client";
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();
const saltRounds = 10;
const password = process.env.WEBMASTER_PASSWORD;

export async function seedUsers() {
  console.log("Seeding users...");
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  await prisma.user.create({
    data: {
      email: "webmaster@scoutingdonbosco.nl",
      name: "webmaster",
      password: hashedPassword,
      roles: [UserRole.WEBMASTER],
    },
  });
  console.log("Seeded users!");
  return;
}
