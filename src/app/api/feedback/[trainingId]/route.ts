import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET /api/feedback/[trainingId]?participantId=123
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ trainingId: string }> }
) {
  const { trainingId } = await context.params;
  const url = new URL(request.url);
  const participantId = url.searchParams.get("participantId");
  if (!participantId) {
    return NextResponse.json({ error: "Missing participantId" }, { status: 400 });
  }
  const tp = await prisma.trainingParticipant.findFirst({
    where: {
      participantId: Number(participantId),
      trainingId: Number(trainingId),
    },
    include: { feedback: true },
  });
  if (!tp || !tp.feedback) {
    return NextResponse.json({ feedback: null });
  }
  return NextResponse.json({ feedback: tp.feedback });
}

// POST /api/feedback/[trainingId]
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ trainingId: string }> }
) {
  const { trainingId } = await context.params;
  const data = await request.json();
  const { participantId, ...feedbackFields } = data;
  if (!participantId) {
    return NextResponse.json({ error: "Missing participantId" }, { status: 400 });
  }

  // --- Date/time restriction removed! ---

  // Find the TrainingParticipant link
  const tp = await prisma.trainingParticipant.findFirst({
    where: {
      participantId: Number(participantId),
      trainingId: Number(trainingId),
    },
  });
  if (!tp) {
    return NextResponse.json({ error: "Not assigned to this training" }, { status: 403 });
  }

  // If feedback exists, DO NOT UPDATE
  const feedbackExists = await prisma.feedback.findUnique({
    where: { tpId: tp.id },
  });
  if (feedbackExists) {
    return NextResponse.json({ error: "Feedback already submitted" }, { status: 409 });
  }

  // Create feedback
  const feedback = await prisma.feedback.create({
    data: {
      ...feedbackFields,
      tpId: tp.id,
    },
  });

  return NextResponse.json({ feedback });
}
