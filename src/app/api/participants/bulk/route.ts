import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { participants } = data;
  if (!Array.isArray(participants)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  // Defensive: remove empty rows
  const cleanParticipants = participants.filter(
    (p) => p.email && p.name
  );
  if (cleanParticipants.length === 0) {
    return NextResponse.json({ error: "No valid participants" }, { status: 400 });
  }
  try {
    await prisma.participant.createMany({
      data: cleanParticipants,
      skipDuplicates: true,
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
