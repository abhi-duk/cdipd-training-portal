import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const assignments = await prisma.trainingParticipant.findMany({
    where: { trainingId: Number(params.id) },
    include: {
      participant: true,
      feedback: { select: { id: true } }
    }
  });
  return NextResponse.json({ assignments });
}
