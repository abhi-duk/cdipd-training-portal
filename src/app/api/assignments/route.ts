import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const assignments = await prisma.trainingParticipant.findMany({
    include: {
      participant: true,
      training: true,
      feedback: { select: { id: true } }
    }
  });
  return NextResponse.json({ assignments });
}
