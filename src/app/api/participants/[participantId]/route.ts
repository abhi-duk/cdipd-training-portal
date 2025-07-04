import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: { participantId: string } }
) {
  // In App Router, sometimes context.params is a Promise (await if needed)
  const params = 'then' in context.params ? await context.params : context.params;
  const participantId = Number(params.participantId);

  if (!participantId) {
    return NextResponse.json({ error: "Missing or invalid participantId" }, { status: 400 });
  }

  const participant = await prisma.participant.findUnique({
    where: { id: participantId }
  });
  return NextResponse.json({ participant });
}
