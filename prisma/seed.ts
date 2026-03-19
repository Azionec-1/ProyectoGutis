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

  /**
   * Products + sample sales (to populate the system for reports)
   */
  const products = [
    {
      id: "PROD-001",
      name: "Agua 20L",
      price: 12.5,
      stock: 100
    },
    {
      id: "PROD-002",
      name: "Bidón 10L",
      price: 8.0,
      stock: 80
    },
    {
      id: "PROD-003",
      name: "Jugo Natural",
      price: 5.0,
      stock: 50
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product
    });
  }

  // Create a few sample sales so reports show data.
  const client1 = await prisma.client.findUnique({ where: { code: "CLI-001" } });
  const client2 = await prisma.client.findUnique({ where: { code: "CLI-002" } });
  const worker1 = await prisma.worker.findUnique({ where: { documentId: "DOC-001" } });

  if (client1 && worker1) {
    await prisma.sale.upsert({
      where: { id: "SALE-001" },
      update: {},
      create: {
        id: "SALE-001",
        clientId: client1.id,
        workerId: worker1.id,
        status: "ENVIADO",
        paymentMethod: "YAPE_PLIN",
        scheduledAt: new Date(),
        discountAmount: 0,
        subtotalAmount: 37.5,
        totalAmount: 37.5,
        notes: "Venta de prueba",
        items: {
          create: [
            {
              id: "SALE_ITEM_001",
              productId: "PROD-001",
              quantity: 2,
              unitPrice: 12.5,
              totalPrice: 25
            },
            {
              id: "SALE_ITEM_002",
              productId: "PROD-003",
              quantity: 1,
              unitPrice: 5,
              totalPrice: 5
            }
          ]
        },
        inventoryMovements: {
          create: [
            {
              id: "INV_MOVE_001",
              movementType: "SALIDA_VENTA",
              quantity: 2,
              note: "Salida por venta - Agua 20L",
              happenedAt: new Date(),
              clientId: client1.id,
              workerId: worker1.id
            },
            {
              id: "INV_MOVE_002",
              movementType: "SALIDA_VENTA",
              quantity: 1,
              note: "Salida por venta - Jugo Natural",
              happenedAt: new Date(),
              clientId: client1.id,
              workerId: worker1.id
            }
          ]
        }
      }
    });
  }

  if (client2 && worker1) {
    await prisma.sale.upsert({
      where: { id: "SALE-002" },
      update: {},
      create: {
        id: "SALE-002",
        clientId: client2.id,
        workerId: worker1.id,
        status: "PENDIENTE",
        paymentMethod: "EFECTIVO",
        scheduledAt: new Date(),
        discountAmount: 0,
        subtotalAmount: 16,
        totalAmount: 16,
        notes: "Venta testeada",
        items: {
          create: [
            {
              id: "SALE_ITEM_003",
              productId: "PROD-002",
              quantity: 2,
              unitPrice: 8,
              totalPrice: 16
            }
          ]
        },
        inventoryMovements: {
          create: [
            {
              id: "INV_MOVE_003",
              movementType: "SALIDA_VENTA",
              quantity: 2,
              note: "Salida por venta - Bidón 10L",
              happenedAt: new Date(),
              clientId: client2.id,
              workerId: worker1.id
            }
          ]
        }
      }
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
