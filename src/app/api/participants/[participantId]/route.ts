import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const participant = await prisma.participant.findUnique({
    where: { id: Number(params.id) }
  });
  return NextResponse.json({ participant });
}
