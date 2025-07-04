import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Await params if needed (App Router fix)
  const params = 'then' in context.params ? await context.params : context.params;
  const trainingId = Number(params.id);

  if (!trainingId) {
    return NextResponse.json({ error: "Missing or invalid training id" }, { status: 400 });
  }

  const training = await prisma.training.findUnique({
    where: { id: trainingId }
  });
  return NextResponse.json({ training });
}
