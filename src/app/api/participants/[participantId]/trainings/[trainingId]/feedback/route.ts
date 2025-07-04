import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// NOTE: params must be awaited
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const feedbacks = await prisma.trainingParticipant.findMany({
    where: { trainingId: Number(id) },
    include: {
      participant: true,
      feedback: true,
    },
  });
  return NextResponse.json({ feedbacks });
}
