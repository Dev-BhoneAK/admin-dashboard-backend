import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const checkEmail = async (email) => {
  return prisma.admin.findUnique({
    where: { email: email },
  });
};
