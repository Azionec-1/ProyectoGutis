-- CreateTable
CREATE TABLE "SalePayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "workerId" TEXT,
    "amount" DECIMAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paidAt" DATETIME NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalePayment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SalePayment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SalePayment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "workerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PAGADO',
    "scheduledAt" DATETIME NOT NULL,
    "deliveredAt" DATETIME,
    "dueDate" DATETIME,
    "settledAt" DATETIME,
    "discountAmount" DECIMAL NOT NULL DEFAULT 0,
    "subtotalAmount" DECIMAL NOT NULL,
    "totalAmount" DECIMAL NOT NULL,
    "amountPaid" DECIMAL NOT NULL DEFAULT 0,
    "amountDue" DECIMAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Sale_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Sale" (
    "id", "clientId", "workerId", "status", "paymentMethod", "scheduledAt", "deliveredAt",
    "discountAmount", "subtotalAmount", "totalAmount", "notes", "createdAt", "updatedAt",
    "paymentStatus", "amountPaid", "amountDue", "settledAt"
)
SELECT
    "id", "clientId", "workerId", "status", "paymentMethod", "scheduledAt", "deliveredAt",
    "discountAmount", "subtotalAmount", "totalAmount", "notes", "createdAt", "updatedAt",
    'PAGADO', "totalAmount", 0, "createdAt"
FROM "Sale";
DROP TABLE "Sale";
ALTER TABLE "new_Sale" RENAME TO "Sale";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "SalePayment_saleId_paidAt_idx" ON "SalePayment"("saleId", "paidAt");

-- CreateIndex
CREATE INDEX "SalePayment_clientId_paidAt_idx" ON "SalePayment"("clientId", "paidAt");
