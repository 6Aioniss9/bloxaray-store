-- CreateTable
CREATE TABLE "Fruit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "priceUSD" REAL NOT NULL,
    "stock" INTEGER NOT NULL,
    "rarity" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fruitName" TEXT NOT NULL,
    "fruitId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "priceUSD" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "customerTag" TEXT,
    "customerId" TEXT,
    "customerName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_fruitId_fkey" FOREIGN KEY ("fruitId") REFERENCES "Fruit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
