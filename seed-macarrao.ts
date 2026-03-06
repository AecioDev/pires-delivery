// @ts-nocheck
import { prisma } from "./lib/db.ts";

async function main() {
  const org = await prisma.organization.findFirst();
  if (!org) {
    console.error("Organization not found.");
    process.exit(1);
  }
  const orgId = org.id;

  // Ensure category "Clássicos da Casa Pires" exists
  let catMacarrao = await prisma.category.findFirst({
    where: { organizationId: orgId, name: { contains: "Clássicos da Casa Pires", mode: "insensitive" } }
  });
  if (!catMacarrao) {
    catMacarrao = await prisma.category.create({
      data: { name: "Clássicos da Casa Pires", organizationId: orgId, sequence: 1 }
    });
  }

  // Ensure category "Crocantes da Casa Pires" exists
  let catFrangos = await prisma.category.findFirst({
    where: { organizationId: orgId, name: { contains: "Crocantes da Casa Pires", mode: "insensitive" } }
  });
  if (!catFrangos) {
    catFrangos = await prisma.category.create({
      data: { name: "Crocantes da Casa Pires", organizationId: orgId, sequence: 2 }
    });
  }

  // Ensure category "Bebidas" exists
  let catBebidas = await prisma.category.findFirst({
    where: { organizationId: orgId, name: { contains: "Bebidas", mode: "insensitive" } }
  });
  if (!catBebidas) {
    catBebidas = await prisma.category.create({
      data: { name: "Bebidas", organizationId: orgId, sequence: 3 }
    });
  }

  const pastas = [
    { name: "Pomodoro", description: "O clássico que nunca falha em dar água na boca! Nosso Pomodoro traz um molho vermelhinho e super aveludado, com aquele toque inconfundível de manjericão fresco e acidez na medida certa. Abraça perfeitamente a sua massa ou nhoque da Casa Pires, e ainda ganha aquela chuvinha de queijo e cebolinha fresca pra finalizar. Simplesmente irresistível!", price: 23.90 },
    { name: "Bolonhesa", description: "Aquele clássico suculento que não tem erro! Nossa Bolonhesa traz carne moída refogada no capricho, super bem temperada em um molho encorpado e cozido lentamente. Abraça perfeitamente a sua massa ou nhoque, ganhando aquela chuva de queijo e cebolinha fresca pra finalizar. Bom demais!", price: 29.90 },
    { name: "Brocoli", description: "Aquele toque defumado irresistível mergulhado na cremosidade! Nosso molho une brócolis frescos e pedacinhos de bacon em um creme leve, saboroso e super equilibrado. Envolve perfeitamente a sua massa ou nhoque, e ainda ganha aquela chuva de queijo e cebolinha fresca pra finalizar. Surpreendente e delicioso!", price: 34.90 },
    { name: "Cheddar com Bacon", description: "Pura perdição em forma de molho! Nosso Cheddar super cremoso derrete na boca, abraçando sua massa ou nhoque junto com pedacinhos irresistíveis de bacon. Uma verdadeira explosão de sabor que você também pode turbinar pedindo a versão com carne! Pra fechar, aquela chuva de queijo e cebolinha fresca. É de lamber os beiços!", price: 39.90 },
    { name: "Parisiense", description: "Aquele molho aveludado que é puro conforto! Nosso Parisiense traz um creme super suave e envolvente com presunto picadinho, ervilhas frescas e um toque especial de bacon. Abraça com perfeição a sua massa ou nhoque, e ganha aquela chuvinha de queijo e cebolinha fresca pra fechar. Delicadeza e muito sabor!", price: 34.90 },
    { name: "Quatro Queijos", description: "Uma explosão de cremosidade pra ninguém botar defeito! Nosso molho traz o equilíbrio perfeito entre parmesão, muçarela, gorgonzola e provolone derretidos em um creme super suave, com aquele toque irresistível de bacon. Abraça a sua massa ou nhoque de um jeito surreal e, pra fechar, ganha aquela chuvinha de queijo e cebolinha fresca. Derrete na boca!", price: 39.90 },
    { name: "Funghi", description: "Sofisticação que desmancha na boca! Nosso molho Funghi é super cremoso e aromático, preparado com cogumelos selecionados e aquele toque especial de vinho branco. Traz um sabor marcante que abraça perfeitamente a sua massa ou nhoque. E pra fechar com chave de ouro, ganha aquela chuvinha de queijo e cebolinha fresca. Uma verdadeira experiência!", price: 29.90 },
    { name: "Cheddar com Carne e Bacon", description: "Pura perdição elevada ao quadrado! Nosso Cheddar super cremoso derrete na boca, abraçando a sua massa ou nhoque junto com carne suculenta e pedacinhos irresistíveis de bacon. Uma verdadeira explosão de sabor pra quem ama um prato indulgente! Pra fechar, ganha aquela chuvinha de queijo e cebolinha fresca. Impossível resistir!", price: 42.90 },
    { name: "Frango com Requeijão Cremoso", description: "O queridinho que abraça o estômago! Nosso frango desfiado vem mergulhado em um molho bechamel super cremoso, com milho-verde e pedacinhos de bacon. Envolve a sua massa ou nhoque com perfeição e ganha aquela finalização caprichada: mussarela derretida, muito requeijão cremoso, mais bacon e cebolinha fresca. Não tem como dar errado!", price: 42.90 },
    { name: "Ragu de Fraldinha", description: "O verdadeiro sabor do aconchego! Nosso Ragu traz uma fraldinha super macia, cozida lentamente por horas com ervas e um toque de vinho até desmanchar. Forma um molho rico e aromático que abraça perfeitamente a sua massa ou nhoque. Pra fechar com chave de ouro, ganha aquela chuvinha de queijo e cebolinha fresca. Uma experiência única e cheia de sabor!", price: 39.90 }
  ];

  const frangos = [
    { name: "Coxa e Sobrecoxa (O clássico suculento)", description: 'O verdadeiro segredo da casa! Cortes super carnudos preparados com uma técnica exclusiva da chef: fritos até a pele ficar incrivelmente sequinha e estalando de tão crocante, sem usar nenhum tipo de empanado. Por dentro, aquela carne suculenta e marinada no capricho. Uma experiência surreal!', price: 25.00 },
    { name: "Coxa Crocante (O clássico pra comer com as mãos)", description: 'Feita pra comer com as mãos e lamber os dedos! Nossas coxas de frango trazem muito tempero e são preparadas com a técnica exclusiva da chef Fátima. O resultado? Uma pele douradinha, sequinha e absurdamente estalante, sem usar nenhuma grama de farinha ou empanado, guardando uma carne super macia e suculenta por dentro. Bom demais!', price: 20.00 },
    { name: "Sobrecoxa (A rainha da suculência)", description: 'O corte favorito de quem ama sabor em dobro! A sobrecoxa já é a parte mais suculenta do frango, e aqui ela ganha um toque de mestre. Frita até a pele ficar fininha, hiper crocante e purinha – totalmente sem empanar. Muito tempero, maciez extrema desmanchando por dentro e aquela crocância surreal por fora. Uma verdadeira experiência!', price: 22.00 },
    { name: "Coxinha da Asa (O petisco que vicia)", description: 'Aquele petisco impossível de comer um só! Nossas coxinhas da asa levam nosso tempero especial e são fritas na nossa técnica secreta. O resultado? Uma pele douradinha, absurdamente crocante e zero empanada, guardando uma carne macia e suculenta por dentro. É de lamber os dedos!', price: 28.00 },
    { name: "Tulipas (A queridinha da galera)", description: 'A majestade do nosso cardápio! Tulipas suculentas preparadas com a nossa receita exclusiva que garante uma crocância surreal e sequinha por fora, sem precisar de massa ou farinha. O tempero da chef é um espetáculo à parte que deixa a carne molhadinha por dentro. Vai devorar rapidinho!', price: 30.00 },
    { name: "Combo Casa Pires (Mix de cortes)", description: 'Na dúvida, vá de tudo! Um mix perfeito e bem servido com nossos melhores cortes, todos preparados na nossa técnica secreta. Crocância absurda por fora, carne desmanchando de suculenta por dentro e totalmente sem empanado. A pedida certeira para compartilhar!', price: 45.00 }
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
        type: "ITEM",
        status: "ACTIVE"
      }
    });
    console.log(`Created Pasta: ${p.name}`);
  }

  for (const f of frangos) {
    await prisma.product.create({
      data: {
        organizationId: orgId,
        name: f.name,
        description: f.description,
        basePrice: f.price,
        categoryId: catFrangos.id,
        type: "ITEM",
        status: "ACTIVE"
      }
    });
    console.log(`Created Frango Frito: ${f.name}`);
  }

  for (const d of drinks) {
    await prisma.product.create({
      data: {
        organizationId: orgId,
        name: d.name,
        description: "",
        basePrice: d.price,
        categoryId: catBebidas.id,
        type: "ITEM",
        status: "ACTIVE"
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
