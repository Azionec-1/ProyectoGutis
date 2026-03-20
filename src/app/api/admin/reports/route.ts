import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type PeriodType = "monthly" | "yearly";

function getPeriodRange(periodType: PeriodType, year: number, month?: number) {
  if (periodType === "monthly") {
    const safeMonth = month && month >= 1 && month <= 12 ? month : new Date().getMonth() + 1;
    const start = new Date(year, safeMonth - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, safeMonth, 0, 23, 59, 59, 999);

    return {
      start,
      end,
      label: `${start.toLocaleString("es-PE", { month: "long" })} ${year}`,
      month: safeMonth
    };
  }

  return {
    start: new Date(year, 0, 1, 0, 0, 0, 0),
    end: new Date(year, 11, 31, 23, 59, 59, 999),
    label: `Año ${year}`
  };
}

function buildMonthlyLabels(year: number, month: number) {
  const lastDay = new Date(year, month, 0).getDate();
  return Array.from({ length: lastDay }, (_, index) => String(index + 1).padStart(2, "0"));
}

function buildYearlyLabels() {
  return ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const periodType = searchParams.get("periodType") === "yearly" ? "yearly" : "monthly";
    const currentYear = new Date().getFullYear();
    const parsedYear = Number(searchParams.get("year"));
    const year = Number.isInteger(parsedYear) && parsedYear > 2000 ? parsedYear : currentYear;
    const parsedMonth = Number(searchParams.get("month"));
    const month = Number.isInteger(parsedMonth) ? parsedMonth : undefined;

    const { start, end, label, month: safeMonth } = getPeriodRange(periodType, year, month);

    const [sales, products, workers] = await Promise.all([
      prisma.sale.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          worker: {
            select: {
              fullName: true
            }
          }
        }
      }),
      prisma.product.findMany({
        orderBy: {
          name: "asc"
        },
        include: {
          productionLogs: {
            where: {
              producedOn: {
                gte: start,
                lte: end
              }
            },
            select: {
              quantity: true,
              producedOn: true
            }
          },
          saleItems: {
            where: {
              sale: {
                createdAt: {
                  gte: start,
                  lte: end
                }
              }
            },
            select: {
              quantity: true,
              totalPrice: true,
              sale: {
                select: {
                  status: true
                }
              }
            }
          }
        }
      }),
      prisma.worker.findMany({
        orderBy: {
          fullName: "asc"
        },
        select: {
          fullName: true
        }
      })
    ]);

    const totalIncome = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const totalQuantitySold = sales.reduce(
      (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );
    const totalOrders = sales.length;
    const deliveredSales = sales.filter((sale) => sale.status === "ENVIADO").length;
    const cancelledSales = sales.filter((sale) => sale.status === "CANCELADO").length;

    const productPerformance = products.map((product) => {
      const produced = product.productionLogs.reduce((sum, log) => sum + log.quantity, 0);
      const sold = product.saleItems.reduce((sum, item) => sum + item.quantity, 0);
      const income = product.saleItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);

      return {
        productId: product.id,
        name: product.name,
        stock: product.stock,
        produced,
        sold,
        income
      };
    });

    const totalProduced = productPerformance.reduce((sum, product) => sum + product.produced, 0);

    const workerMap = new Map<string, { workerName: string; totalIncome: number; sales: number }>();

    workers.forEach((worker) => {
      workerMap.set(worker.fullName, {
        workerName: worker.fullName,
        totalIncome: 0,
        sales: 0
      });
    });

    sales.forEach((sale) => {
      const workerName = sale.worker?.fullName ?? "Sin asignar";
      const current = workerMap.get(workerName) ?? {
        workerName,
        totalIncome: 0,
        sales: 0
      };

      current.totalIncome += Number(sale.totalAmount);
      current.sales += 1;
      workerMap.set(workerName, current);
    });

    const salesByWorker = Array.from(workerMap.values()).filter(
      (worker) => worker.sales > 0 || worker.workerName !== "Sin asignar"
    );

    const timelineLabels =
      periodType === "monthly" && safeMonth
        ? buildMonthlyLabels(year, safeMonth)
        : buildYearlyLabels();

    const salesTrendMap = new Map<string, { label: string; totalIncome: number; orders: number }>();
    const productionTrendMap = new Map<string, { label: string; quantity: number }>();

    timelineLabels.forEach((item) => {
      salesTrendMap.set(item, { label: item, totalIncome: 0, orders: 0 });
      productionTrendMap.set(item, { label: item, quantity: 0 });
    });

    sales.forEach((sale) => {
      const key =
        periodType === "monthly"
          ? String(sale.createdAt.getDate()).padStart(2, "0")
          : buildYearlyLabels()[sale.createdAt.getMonth()];

      const current = salesTrendMap.get(key);
      if (current) {
        current.totalIncome += Number(sale.totalAmount);
        current.orders += 1;
      }
    });

    products.forEach((product) => {
      product.productionLogs.forEach((log) => {
        const key =
          periodType === "monthly"
            ? String(log.producedOn.getDate()).padStart(2, "0")
            : buildYearlyLabels()[log.producedOn.getMonth()];

        const current = productionTrendMap.get(key);
        if (current) {
          current.quantity += log.quantity;
        }
      });
    });

    return NextResponse.json({
      summary: {
        totalIncome,
        totalQuantitySold,
        totalOrders,
        deliveredSales,
        cancelledSales,
        totalProduced,
        activeProducts: products.length
      },
      period: {
        type: periodType,
        label,
        month: safeMonth,
        year
      },
      salesTrend: Array.from(salesTrendMap.values()),
      productionTrend: Array.from(productionTrendMap.values()),
      productPerformance,
      salesByWorker
    });
  } catch (error) {
    console.error("Error al generar reportes:", error);
    return NextResponse.json({ message: "No se pudo generar el reporte." }, { status: 500 });
  }
}
