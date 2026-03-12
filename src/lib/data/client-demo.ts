export const demoClients = [
  {
    id: "demo-client-1",
    code: "CLI-001",
    fullName: "Bodega San Martin",
    phone: "987654321",
    address: "Av. Los Laureles 125",
    district: "Tarapoto",
    referenceNote: "Frente a la farmacia central",
    googleMapsUrl: "https://maps.google.com/?q=Tarapoto",
    facadePhotoUrl:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    isActive: true,
    createdAt: new Date("2026-03-09T10:00:00Z"),
    updatedAt: new Date("2026-03-10T11:00:00Z"),
    _count: {
      sales: 5,
      inventoryEvents: 2
    },
    sales: [
      {
        id: "sale-1",
        status: "ENVIADO",
        totalAmount: 72,
        scheduledAt: new Date("2026-03-11T14:00:00Z"),
        paymentMethod: "YAPE_PLIN"
      }
    ],
    inventoryEvents: [
      {
        id: "move-1",
        movementType: "SALIDA_PRESTAMO",
        quantity: 2,
        happenedAt: new Date("2026-03-10T13:00:00Z"),
        note: "Prestamo de bidones retornables"
      }
    ]
  },
  {
    id: "demo-client-2",
    code: "CLI-002",
    fullName: "Restaurant El Mirador",
    phone: "912345678",
    address: "Jr. Comercio 442",
    district: "Morales",
    referenceNote: "Segundo piso, puerta azul",
    googleMapsUrl: "https://maps.google.com/?q=Morales",
    facadePhotoUrl: null,
    isActive: true,
    createdAt: new Date("2026-03-08T09:00:00Z"),
    updatedAt: new Date("2026-03-10T12:00:00Z"),
    _count: {
      sales: 3,
      inventoryEvents: 1
    },
    sales: [],
    inventoryEvents: []
  },
  {
    id: "demo-client-3",
    code: "CLI-003",
    fullName: "Maria Torres",
    phone: "956123789",
    address: "Psje. Amazonas 98",
    district: "La Banda de Shilcayo",
    referenceNote: "Casa con rejas blancas",
    googleMapsUrl: "https://maps.google.com/?q=La+Banda+de+Shilcayo",
    facadePhotoUrl: null,
    isActive: false,
    createdAt: new Date("2026-03-07T08:00:00Z"),
    updatedAt: new Date("2026-03-09T10:30:00Z"),
    _count: {
      sales: 0,
      inventoryEvents: 0
    },
    sales: [],
    inventoryEvents: []
  }
] as const;
