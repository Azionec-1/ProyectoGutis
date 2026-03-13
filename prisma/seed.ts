import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const clients = [
    {
      code: "CLI-001",
      fullName: "Bodega San Martin",
      phone: "987654321",
      address: "Av. Los Laureles 125",
      district: "Tarapoto",
      referenceNote: "Frente a la farmacia central",
      googleMapsUrl: "https://maps.google.com/?q=Tarapoto",
      isActive: true
    },
    {
      code: "CLI-002",
      fullName: "Restaurant El Mirador",
      phone: "912345678",
      address: "Jr. Comercio 442",
      district: "Morales",
      referenceNote: "Segundo piso, puerta azul",
      googleMapsUrl: "https://maps.google.com/?q=Morales",
      isActive: true
    },
    {
      code: "CLI-003",
      fullName: "Maria Torres",
      phone: "956123789",
      address: "Psje. Amazonas 98",
      district: "La Banda de Shilcayo",
      referenceNote: "Casa con rejas blancas",
      googleMapsUrl: "https://maps.google.com/?q=La+Banda+de+Shilcayo",
      isActive: false
    }
  ];

  for (const client of clients) {
    await prisma.client.upsert({
      where: { code: client.code },
      update: client,
      create: client
    });
  }

  const workers = [
    {
      fullName: "Juan Perez",
      phone: "987111222",
      documentId: "DOC-001",
      vehicleNote: "Moto lineal",
      isActive: true
    },
    {
      fullName: "Maria Garcia",
      phone: "987333444",
      documentId: "DOC-002",
      vehicleNote: "Motocar",
      isActive: true
    }
  ];

  for (const worker of workers) {
    await prisma.worker.upsert({
      where: { documentId: worker.documentId },
      update: worker,
      create: worker
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
