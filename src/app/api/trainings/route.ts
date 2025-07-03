import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  // Support ?activeOnly=1 for assignment dropdown
  const url = new URL(request.url);
  const activeOnly = url.searchParams.get("activeOnly");

  const where = activeOnly ? { isActive: true } : undefined;

  const trainings = await prisma.training.findMany({
    where,
    orderBy: { id: "desc" },
    select: {
      id: true,
      topic: true,
      date: true,
      trainer: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ trainings });
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { topic, date, trainer } = data;

  if (!topic || !date || !trainer) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const training = await prisma.training.create({
    data: {
      topic,
      date: new Date(date),
      trainer,
      isActive: true,
    },
  });

  return NextResponse.json({ success: true, training });
}

export async function PATCH(request: NextRequest) {
  const data = await request.json();
  const { id, topic, date, trainer, isActive } = data;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const updateData: any = {};
  if (topic !== undefined) updateData.topic = topic;
  if (date !== undefined) updateData.date = new Date(date);
  if (trainer !== undefined) updateData.trainer = trainer;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updated = await prisma.training.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ success: true, training: updated });
}
