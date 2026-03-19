import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json({ message: 'Missing required fields: startDate, endDate' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Make the end date inclusive (include the full day)
    end.setHours(23, 59, 59, 999);

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        worker: true,
      },
    });

    // Process data for reports
    const totalIncome = sales.reduce((acc, sale) => acc + Number(sale.totalAmount), 0);
    const totalQuantity = sales.reduce(
      (acc, sale) => acc + sale.items.reduce((pAcc, item) => pAcc + item.quantity, 0),
      0
    );
    const totalOrders = sales.length;
    const uniqueClients = new Set(sales.map((sale) => sale.clientId).filter(Boolean)).size;
    const averagePerOrder = totalOrders ? totalIncome / totalOrders : 0;
    const cancelledSales = sales.filter((sale) => sale.status === 'CANCELADO').length;
    const deliveredSales = sales.filter((sale) => sale.status === 'ENVIADO').length;

    const salesByProduct = sales
      .flatMap((sale) => sale.items)
      .reduce((acc, saleItem) => {
        const productName = saleItem.product.name;
        if (!acc[productName]) {
          acc[productName] = { total: 0, quantity: 0 };
        }
        acc[productName].total += Number(saleItem.totalPrice);
        acc[productName].quantity += saleItem.quantity;
        return acc;
      }, {} as Record<string, { total: number; quantity: number }>);

    const salesByDelivery = sales.reduce((acc, sale) => {
      const deliveryBy = sale.worker?.fullName || 'N/A';
      if (!acc[deliveryBy]) {
        acc[deliveryBy] = { total: 0, sales: 0 };
      }
      acc[deliveryBy].total += Number(sale.totalAmount);
      acc[deliveryBy].sales += 1;
      return acc;
    }, {} as Record<string, { total: number; sales: number }>);

    const daily = Object.values(
      sales.reduce((acc, sale) => {
        const dateKey = sale.createdAt.toISOString().slice(0, 10);
        const entry = acc[dateKey] ?? { date: dateKey, totalIncome: 0, orders: 0, clients: new Set<string>() };
        entry.totalIncome += Number(sale.totalAmount);
        entry.orders += 1;
        if (sale.clientId) entry.clients.add(sale.clientId);
        acc[dateKey] = entry;
        return acc;
      }, {} as Record<string, { date: string; totalIncome: number; orders: number; clients: Set<string> }>)
    ).map((d) => ({
      date: d.date,
      totalIncome: d.totalIncome,
      orders: d.orders,
      uniqueClients: d.clients.size,
      averageOrder: d.orders ? d.totalIncome / d.orders : 0,
    }));

    return NextResponse.json({
      summary: {
        totalIncome,
        totalQuantity,
        totalOrders,
        uniqueClients,
        averagePerOrder,
        cancelledSales,
        deliveredSales,
      },
      daily,
      salesByProduct,
      salesByDelivery,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ message: 'Error fetching reports' }, { status: 500 });
  }
}
