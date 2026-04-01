-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "workerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "operationType" TEXT NOT NULL DEFAULT 'VENTA',
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
    "id", "clientId", "workerId", "status", "operationType", "paymentMethod", "paymentStatus",
    "scheduledAt", "deliveredAt", "dueDate", "settledAt", "discountAmount", "subtotalAmount",
    "totalAmount", "amountPaid", "amountDue", "notes", "createdAt", "updatedAt"
)
SELECT
    "id", "clientId", "workerId", "status", 'VENTA', "paymentMethod", "paymentStatus",
    "scheduledAt", "deliveredAt", "dueDate", "settledAt", "discountAmount", "subtotalAmount",
    "totalAmount", "amountPaid", "amountDue", "notes", "createdAt", "updatedAt"
FROM "Sale";
DROP TABLE "Sale";
ALTER TABLE "new_Sale" RENAME TO "Sale";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
