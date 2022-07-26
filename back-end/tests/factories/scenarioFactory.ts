import { faker } from "@faker-js/faker";
import { prisma } from "./../../src/database.js";

export async function deleteAllData() {
    await prisma.$transaction([
    prisma.$executeRaw`TRUNCATE TABLE recommendations`,
    ]);
}