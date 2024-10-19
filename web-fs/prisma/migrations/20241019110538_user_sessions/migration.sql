-- CreateTable
CREATE TABLE "RootUserSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "sessionId" TEXT NOT NULL
);
