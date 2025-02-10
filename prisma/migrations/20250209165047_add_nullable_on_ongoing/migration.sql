-- DropForeignKey
ALTER TABLE "OngoingChat" DROP CONSTRAINT "OngoingChat_chatFlowId_fkey";

-- AlterTable
ALTER TABLE "OngoingChat" ALTER COLUMN "chatFlowId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OngoingChat" ADD CONSTRAINT "OngoingChat_chatFlowId_fkey" FOREIGN KEY ("chatFlowId") REFERENCES "ChatFlow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
