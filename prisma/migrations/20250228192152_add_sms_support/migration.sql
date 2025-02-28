/*
  Warnings:

  - Added the required column `to` to the `ScheduledMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ScheduledMessage" DROP CONSTRAINT "ScheduledMessage_templateId_fkey";

-- AlterTable
ALTER TABLE "MessageLog" ADD COLUMN     "body" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contactId" TEXT,
ADD COLUMN     "from" TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN     "messageId" TEXT,
ADD COLUMN     "to" TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'WHATSAPP',
ALTER COLUMN "phoneNumber" DROP NOT NULL,
ALTER COLUMN "message" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ScheduledMessage" ADD COLUMN     "body" TEXT,
ADD COLUMN     "contactId" TEXT,
ADD COLUMN     "from" TEXT,
ADD COLUMN     "messageType" TEXT NOT NULL DEFAULT 'WHATSAPP',
ADD COLUMN     "to" TEXT NOT NULL,
ALTER COLUMN "phoneNumber" DROP NOT NULL,
ALTER COLUMN "templateId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MessageTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
