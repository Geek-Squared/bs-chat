-- CreateTable
CREATE TABLE "OngoingChat" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "chatFlowId" TEXT NOT NULL,
    "currentQuestionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OngoingChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserResponse" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OngoingChat_phoneNumber_key" ON "OngoingChat"("phoneNumber");

-- AddForeignKey
ALTER TABLE "OngoingChat" ADD CONSTRAINT "OngoingChat_chatFlowId_fkey" FOREIGN KEY ("chatFlowId") REFERENCES "ChatFlow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResponse" ADD CONSTRAINT "UserResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
