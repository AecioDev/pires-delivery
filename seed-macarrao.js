const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findFirst();
  if (!org) {
    console.error("Organization not found.");
    process.exit(1);
  }
  const orgId = org.id;

  // Ensure category "O Melhor Macarrão" exists
  let catMacarrao = await prisma.category.findFirst({
    where: { organizationId: orgId, name: { contains: "O Melhor Macarrão", mode: "insensitive" } }
  });
  if (!catMacarrao) {
    catMacarrao = await prisma.category.create({
      data: { name: "O Melhor Macarrão!", organizationId: orgId, sequence: 1 }
    });
  }

  // Ensure category "Bebidas" exists
  let catBebidas = await prisma.category.findFirst({
    where: { organizationId: orgId, name: { contains: "Bebidas", mode: "insensitive" } }
  });
  if (!catBebidas) {
    catBebidas = await prisma.category.create({
      data: { name: "Bebidas", organizationId: orgId, sequence: 2 }
    });
  }

  const pastas = [
    { name: "Macarrão Pomodoro", description: "Pomodoro é uma delicioso molho à base de tomate italiano, com um toque de manjericão fresco. Oferece uma acidez equilibrada...", price: 23.90 },
    { name: "Macarrão Broccoli", description: "Cremoso e feito com brócolis frescos com toque de bacon. Ideal para nossas massas e nhoque, oferecendo uma combinação leve...", price: 34.90 },
    { name: "Macarrão Parisiense", description: "Parisiense, cremoso e aveludado, feito com presunto picado, ervilhas frescas e um toque de bacon. Sua suavidade tornam este...", price: 34.90 },
    { name: "Macarrão Funghi", description: "Funghi cremoso e aromático, feito com cogumelos selecionados e um toque de vinho branco, trazendo um sabor intenso e...", price: 29.90 },
    { name: "Macarrão Frango com Requeijão Cremoso", description: "Frango desfiado ao molho bechamel, com milho-verde e pedacinhos de bacon. Finalizado com mussarela derretida,...", price: 42.90 },
    { name: "Macarrão Camarão Rosé", description: "Camarão rosé combina o sabor delicado dos camarões com molho pomodoro, molho branco e um toque de especiarias....", price: 47.90 },
    { name: "Macarrão Bolonhesa", description: "O clássico italiano, rico e cheio de sabor, preparado com carne moída, tomates italiano e especiarias. Cozido lentamente para...", price: 29.90 },
    { name: "Macarrão Cheddar com Bacon", description: "Cheddar cremoso e irresistível. Combinado com um toque de bacon. Ideal para nossas massas e nhoque, este molho traz uma...", price: 39.90 },
    { name: "Macarrão Quatro Queijos", description: "Quatro queijos, uma combinação irresistível de queijos com um toque de bacon em um creme suave, sabor equilibrado do...", price: 39.90 },
    { name: "Macarrão Cheddar com Carne e Bacon", description: "Cheddar cremoso e irresistível. Combinado com um toque de carne e bacon. Ideal para nossas massas e nhoques, este molho...", price: 42.90 },
    { name: "Macarrão Ragu de Costela", description: "Ragu de costela macia, cozido por horas com ervas e vinho, em um molho rico e aromático. Servido sobre massa italiana ou...", price: 39.90 },
  ];

  const drinks = [
    { name: "Coca Cola Lata", price: 6.00 },
    { name: "Coca Cola Lata Mini", price: 4.00 },
    { name: "Coca Cola 600ml", price: 9.00 },
    { name: "Fanta Lata", price: 6.00 },
    { name: "Fanta Lata Mini", price: 4.00 },
    { name: "Fanta 600ml", price: 9.00 },
    { name: "Funada Guaraná Lata", price: 5.00 },
    { name: "Funada Guaraná Lata Mini", price: 3.50 },
    { name: "Funada Guaraná 600ml", price: 8.00 },
  ];

  for (const p of pastas) {
    await prisma.product.create({
      data: {
        organizationId: orgId,
        name: p.name,
        description: p.description,
        basePrice: p.price,
        categoryId: catMacarrao.id,
        type: "ITEM"
      }
    });
    console.log(`Created Pasta: ${p.name}`);
  }

  for (const d of drinks) {
    await prisma.product.create({
      data: {
        organizationId: orgId,
        name: d.name,
        description: "",
        basePrice: d.price,
        categoryId: catBebidas.id,
        type: "ITEM"
      }
    });
    console.log(`Created Drink: ${d.name}`);
  }

  console.log("Done seeding products!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
