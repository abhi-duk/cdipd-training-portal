import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const participants = await prisma.participant.findMany({
    orderBy: [{ isActive: "desc" }, { id: "desc" }]
  });
  return NextResponse.json({ participants });
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { name, email, designation, dept } = data;
  if (!name || !email) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const participant = await prisma.participant.create({
    data: { name, email, designation, dept },
  });
  return NextResponse.json({ participant });
}

// PATCH handler!
export async function PATCH(request: NextRequest) {
  const data = await request.json();
  const { id, name, email, designation, dept, isActive } = data;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  try {
    const participant = await prisma.participant.update({
      where: { id: Number(id) }, // <--- Ensure id is a number
      data: { name, email, designation, dept, isActive },
    });
    return NextResponse.json({ participant });
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
