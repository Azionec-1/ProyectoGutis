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
      SELECT name FROM sqlite_master WHERE type='table' AND name='Client'
    `;
    return result.length > 0;
  } catch {
    return false;
  }
}

function buildClientWhere(search?: string, status?: string): Prisma.ClientWhereInput {
  const filters: Prisma.ClientWhereInput[] = [];

  if (search) {
    filters.push({
      OR: [
        { fullName: { contains: search } },
        { code: { contains: search } },
        { phone: { contains: search } },
        { district: { contains: search } }
      ]
    });
  }

  if (status === "active") {
    filters.push({ isActive: true });
  }

  if (status === "inactive") {
    filters.push({ isActive: false });
  }

  return filters.length ? { AND: filters } : {};
}

function filterDemoClients(search?: string, status?: string) {
  const normalizedSearch = search?.toLowerCase();

  return demoClients.filter((client) => {
    const matchesSearch = normalizedSearch
      ? [client.fullName, client.code, client.phone, client.district]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)
      : true;

    const matchesStatus =
      status === "active"
        ? client.isActive
        : status === "inactive"
        ? !client.isActive
        : true;

    return matchesSearch && matchesStatus;
  });
}

function getDemoClientMetrics() {
  return {
    total: demoClients.length,
    active: demoClients.filter((c) => c.isActive).length,
    inactive: demoClients.filter((c) => !c.isActive).length,
    latest: [...demoClients]
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
      .slice(0, 3)
      .map((c) => ({
        id: c.id,
        fullName: c.fullName,
        district: c.district,
        createdAt: c.createdAt
      }))
  };
}

export async function listClients(search?: string, status?: string) {
  if (!(await hasClientTable())) {
    return filterDemoClients(search, status);
  }

  try {
    return await prisma.client.findMany({
      where: buildClientWhere(search, status),
      select: clientSelect,
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }]
    });
  } catch {
    return filterDemoClients(search, status);
  }
}

export async function listClientsPaginated({
  search,
  status,
  page = 1,
  pageSize = 8
}: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const safePage = Math.max(1, page);
  const take = Math.max(1, pageSize);
  const skip = (safePage - 1) * take;

  if (!(await hasClientTable())) {
    const filtered = filterDemoClients(search, status);

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / take));
    const currentPage = Math.min(safePage, totalPages);
    const start = (currentPage - 1) * take;

    return {
      items: filtered.slice(start, start + take),
      total,
      page: currentPage,
      totalPages
    };
  }

  try {
    const where = buildClientWhere(search, status);

    const [total, items] = await Promise.all([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        select: clientSelect,
        orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
        skip,
        take
      })
    ]);

    return {
      items,
      total,
      page: safePage,
      totalPages: Math.max(1, Math.ceil(total / take))
    };
  } catch {
    const filtered = filterDemoClients(search, status);

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / take));
    const currentPage = Math.min(safePage, totalPages);
    const start = (currentPage - 1) * take;

    return {
      items: filtered.slice(start, start + take),
      total,
      page: currentPage,
      totalPages
    };
  }
}

export async function getClientMetrics() {
  if (!(await hasClientTable())) {
    return getDemoClientMetrics();
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

    return { total, active, inactive, latest };
  } catch {
    return getDemoClientMetrics();
  }
}

export async function getClientById(id: string) {
  if (!(await hasClientTable())) {
    return demoClients.find((c) => c.id === id) ?? null;
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
    return demoClients.find((c) => c.id === id) ?? null;
  }
}

export async function getClientDashboardData() {
  const clients = await listClients();

  const recent = [...clients]
    .sort(
      (a, b) =>
        Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))
    )
    .slice(0, 4)
    .map((client) => ({
      id: client.id,
      fullName: client.fullName,
      district: client.district,
      createdAt: new Date(client.createdAt)
    }));

  return {
    total: clients.length,
    active: clients.filter((c) => c.isActive).length,
    inactive: clients.filter((c) => !c.isActive).length,
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

export async function updateClientStatus(id: string, isActive: boolean) {
  return prisma.client.update({
    where: { id },
    data: { isActive }
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
    const nextNumber = lastNumber
      ? Number(lastNumber) + 1
      : (await prisma.client.count()) + 1;

    return `CLI-${String(nextNumber).padStart(3, "0")}`;
  } catch {
    return `CLI-${String(demoClients.length + 1).padStart(3, "0")}`;
  }
}
