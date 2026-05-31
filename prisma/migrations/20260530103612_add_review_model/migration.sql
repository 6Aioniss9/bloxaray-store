/*
  Warnings:

  - You are about to drop the column `customerId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerTag` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `fruitId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `fruitName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `priceUSD` on the `Order` table. All the data in the column will be lost.
  - Added the required column `customerDiscord` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerEmail` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerRoblox` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalUSD` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `customerName` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "items" TEXT NOT NULL DEFAULT '[]',
    "total" REAL NOT NULL,
    "totalUSD" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_payment',
    "paymentMethod" TEXT,
    "paymentId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerRoblox" TEXT NOT NULL,
    "customerDiscord" TEXT NOT NULL,
    "customerNotes" TEXT,
    "receiptUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Order" ("createdAt", "customerName", "id", "status", "updatedAt") SELECT "createdAt", "customerName", "id", "status", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
