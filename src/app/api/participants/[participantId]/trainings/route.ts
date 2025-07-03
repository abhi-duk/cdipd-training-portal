import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/participants/[participantId]/trainings
export async function GET(
  request: NextRequest,
  { params }: { params: { participantId: string } }
) {
  const participantId = Number(params.participantId);

  if (!participantId) {
    return NextResponse.json({ error: "Missing or invalid participantId" }, { status: 400 });
  }

  // Find all assignments for this participant
  const assignments = await prisma.trainingParticipant.findMany({
    where: { participantId },
    include: {
      training: true,
      feedback: { select: { id: true } },
    },
    orderBy: { trainingId: "desc" },
  });

  // Map assignments to required shape
  const result = assignments.map(a => ({
    id: a.id,
    training: {
      id: a.training.id,
      topic: a.training.topic,
      date: a.training.date,
      trainer: a.training.trainer,
      isActive: a.training.isActive,
    },
    feedback: a.feedback,
  }));

  return NextResponse.json({ trainings: result });
}
