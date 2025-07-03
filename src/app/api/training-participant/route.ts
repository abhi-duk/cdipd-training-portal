import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { participantId, trainingId } = await request.json();
  if (!participantId || !trainingId)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Prevent duplicate
  const exists = await prisma.trainingParticipant.findUnique({
    where: { trainingId_participantId: { trainingId, participantId } }
  });
  if (exists)
    return NextResponse.json({ error: "Already assigned" }, { status: 409 });

  await prisma.trainingParticipant.create({ data: { participantId, trainingId } });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { participantId, trainingId } = await request.json();
  if (!participantId || !trainingId)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  await prisma.trainingParticipant.deleteMany({
    where: { trainingId, participantId },
  });
  return NextResponse.json({ success: true });
}
