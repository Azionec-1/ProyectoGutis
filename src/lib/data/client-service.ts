import { Prisma } from "@prisma/client";
import { demoClients } from "@/lib/data/client-demo";
import { prisma } from "@/lib/prisma";
import { clientSchema, type ClientFormValues } from "@/lib/validation/client";

const clientSelect = {
  id: true,
  code: true,
  fullName: true,
  phone: true,
  address: true,
  district: true,
  referenceNote: true,
  googleMapsUrl: true,
  facadePhotoUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      sales: true,
      inventoryEvents: true
    }
  }
} satisfies Prisma.ClientSelect;

async function hasClientTable() {
  try {
    const result = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'Client'
    `;

    return result.length > 0;
  } catch {
    return false;
  }
}

export async function listClients(search?: string, status?: string) {
  if (!(await hasClientTable())) {
    return demoClients.filter((client) => {
      const matchesSearch = search
        ? [client.fullName, client.code, client.phone, client.district]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
        : true;
      const matchesStatus =
        status === "active" ? client.isActive : status === "inactive" ? !client.isActive : true;

      return matchesSearch && matchesStatus;
    });
  }

  try {
    return await prisma.client.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { fullName: { contains: search } },
                  { code: { contains: search } },
                  { phone: { contains: search } },
                  { district: { contains: search } }
                ]
              }
            : {},
          status === "active" ? { isActive: true } : {},
          status === "inactive" ? { isActive: false } : {}
        ]
      },
      select: clientSelect,
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }]
    });
  } catch {
    return demoClients.filter((client) => {
      const matchesSearch = search
        ? [client.fullName, client.code, client.phone, client.district]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
        : true;
      const matchesStatus =
        status === "active" ? client.isActive : status === "inactive" ? !client.isActive : true;

      return matchesSearch && matchesStatus;
    });
  }
}

export async function getClientMetrics() {
  if (!(await hasClientTable())) {
    return {
      total: demoClients.length,
      active: demoClients.filter((client) => client.isActive).length,
      inactive: demoClients.filter((client) => !client.isActive).length,
      latest: [...demoClients]
        .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
        .slice(0, 3)
        .map(({ id, fullName, district, createdAt }) => ({
          id,
          fullName,
          district,
          createdAt
        }))
    };
  }

  try {
    const [total, active, inactive, latest] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { isActive: true } }),
      prisma.client.count({ where: { isActive: false } }),
      prisma.client.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fullName: true,
          district: true,
          createdAt: true
        }
      })
    ]);

    return {
      total,
      active,
      inactive,
      latest
    };
  } catch {
    return {
      total: demoClients.length,
      active: demoClients.filter((client) => client.isActive).length,
      inactive: demoClients.filter((client) => !client.isActive).length,
      latest: [...demoClients]
        .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
        .slice(0, 3)
        .map(({ id, fullName, district, createdAt }) => ({
          id,
          fullName,
          district,
          createdAt
        }))
    };
  }
}

export async function getClientById(id: string) {
  if (!(await hasClientTable())) {
    return demoClients.find((client) => client.id === id) ?? null;
  }

  try {
    return await prisma.client.findUnique({
      where: { id },
      select: {
        ...clientSelect,
        sales: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            totalAmount: true,
            scheduledAt: true,
            paymentMethod: true
          }
        },
        inventoryEvents: {
          take: 5,
          orderBy: { happenedAt: "desc" },
          select: {
            id: true,
            movementType: true,
            quantity: true,
            happenedAt: true,
            note: true
          }
        }
      }
    });
  } catch {
    return demoClients.find((client) => client.id === id) ?? null;
  }
}

export async function getClientDashboardData() {
  const clients = await listClients();
  const recent = [...clients]
    .sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)))
    .slice(0, 4)
    .map((client) => ({
      id: client.id,
      fullName: client.fullName,
      district: client.district,
      createdAt: new Date(client.createdAt)
    }));

  return {
    total: clients.length,
    active: clients.filter((client) => client.isActive).length,
    inactive: clients.filter((client) => !client.isActive).length,
    recent
  };
}

export async function createClient(input: ClientFormValues) {
  const parsed = clientSchema.parse(input);
  const code = parsed.code?.trim() ? parsed.code : await getNextClientCode();

  return prisma.client.create({
    data: {
      ...parsed,
      code,
      googleMapsUrl: parsed.googleMapsUrl || null,
      facadePhotoUrl: parsed.facadePhotoUrl || null,
      referenceNote: parsed.referenceNote || null
    }
  });
}

export async function updateClient(id: string, input: ClientFormValues) {
  const parsed = clientSchema.parse(input);

  return prisma.client.update({
    where: { id },
    data: {
      ...parsed,
      code: parsed.code || undefined,
      googleMapsUrl: parsed.googleMapsUrl || null,
      facadePhotoUrl: parsed.facadePhotoUrl || null,
      referenceNote: parsed.referenceNote || null
    }
  });
}

async function getNextClientCode() {
  try {
    if (!(await hasClientTable())) {
      return `CLI-${String(demoClients.length + 1).padStart(3, "0")}`;
    }

    const latestClient = await prisma.client.findFirst({
      orderBy: { createdAt: "desc" },
      select: { code: true }
    });

    const lastNumber = latestClient?.code.match(/(\d+)$/)?.[1];
    const nextNumber = lastNumber ? Number(lastNumber) + 1 : (await prisma.client.count()) + 1;

    return `CLI-${String(nextNumber).padStart(3, "0")}`;
  } catch {
    return `CLI-${String(demoClients.length + 1).padStart(3, "0")}`;
  }
}
