/*
  Warnings:

  - The required column `trackingToken` was added to the `orders` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "items" TEXT NOT NULL DEFAULT '[]',
    "total" REAL NOT NULL,
    "totalUSD" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_payment',
    "paymentMethod" TEXT,
    "paymentId" TEXT,
    "mpPaymentId" TEXT,
    "paidAt" DATETIME,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerRoblox" TEXT NOT NULL,
    "customerDiscord" TEXT NOT NULL,
    "customerNotes" TEXT,
    "receiptUrl" TEXT,
    "trackingToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("createdAt", "customerDiscord", "customerEmail", "customerName", "customerNotes", "customerRoblox", "id", "items", "mpPaymentId", "paidAt", "paymentId", "paymentMethod", "receiptUrl", "status", "total", "totalUSD", "updatedAt", "userId") SELECT "createdAt", "customerDiscord", "customerEmail", "customerName", "customerNotes", "customerRoblox", "id", "items", "mpPaymentId", "paidAt", "paymentId", "paymentMethod", "receiptUrl", "status", "total", "totalUSD", "updatedAt", "userId" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_trackingToken_key" ON "orders"("trackingToken");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_customerEmail_idx" ON "orders"("customerEmail");
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");
CREATE INDEX "orders_paymentMethod_idx" ON "orders"("paymentMethod");
CREATE INDEX "orders_mpPaymentId_idx" ON "orders"("mpPaymentId");
CREATE INDEX "orders_trackingToken_idx" ON "orders"("trackingToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
