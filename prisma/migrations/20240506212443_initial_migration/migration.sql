-- CreateTable
CREATE TABLE "Answer" (
    "id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "domandaId" INTEGER NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "number" INTEGER NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_domandaId_fkey" FOREIGN KEY ("domandaId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
