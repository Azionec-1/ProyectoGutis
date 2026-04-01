-- CreateTable
CREATE TABLE "InventorySupply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unitLabel" TEXT NOT NULL DEFAULT 'unidades',
    "stock" DECIMAL NOT NULL DEFAULT 0,
    "packageSize" DECIMAL,
    "productionConsumptionRate" DECIMAL NOT NULL DEFAULT 0,
    "lowStockAlert" DECIMAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InventorySupplyMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplyId" TEXT NOT NULL,
    "movementType" TEXT NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "stockAfter" DECIMAL NOT NULL,
    "note" TEXT,
    "happenedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventorySupplyMovement_supplyId_fkey" FOREIGN KEY ("supplyId") REFERENCES "InventorySupply" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "InventorySupply_name_key" ON "InventorySupply"("name");

-- CreateIndex
CREATE INDEX "InventorySupplyMovement_supplyId_happenedAt_idx" ON "InventorySupplyMovement"("supplyId", "happenedAt");

-- CreateIndex
CREATE INDEX "InventorySupplyMovement_movementType_happenedAt_idx" ON "InventorySupplyMovement"("movementType", "happenedAt");
