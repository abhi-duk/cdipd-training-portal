import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Get all participant IDs already assigned to this training
  const assignedIds = await prisma.trainingParticipant.findMany({
    where: { trainingId: Number(params.id) },
    select: { participantId: true }
  });
  const assignedSet = new Set(assignedIds.map(a => a.participantId));
  // List all active participants not assigned yet
  const participants = await prisma.participant.findMany({
    where: {
      isActive: true,
      id: { notIn: Array.from(assignedSet) }
    },
    orderBy: { name: "asc" }
  });
  return NextResponse.json({ participants });
}
