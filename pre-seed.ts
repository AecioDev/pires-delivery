import { prisma } from "./lib/db.ts";

async function main() {
  let org = await prisma.organization.findFirst();
  if (!org) {
    console.log("Creating default organization Pires Delivery...");
    org = await prisma.organization.create({
      data: {
        name: "Pires Delivery",
        slug: "pires-delivery",
      }
    });
  }
  console.log("Organization ID:", org.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
