import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: { participantId: string } }
) {
  const params = await context.params;
  const participantId = Number(params.participantId);

  if (!Number.isInteger(participantId) || participantId <= 0) {
    return NextResponse.json({ error: "Missing or invalid participantId" }, { status: 400 });
  }

  try {
    // Parse query params
    const { searchParams } = new URL(request.url);
    const skip = Number(searchParams.get("skip")) || 0;
    const take = Math.min(Number(searchParams.get("take")) || 10, 200);
    const sort = searchParams.get("sort") || "date-desc";
    const search = (searchParams.get("search") || "").trim();

    // Check participant exists
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      select: {
        id: true,
        name: true,
        email: true,
        dept: true,
        designation: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    // Build where for training search
    const trainingWhere: any = {};
    if (search.length > 0) {
      trainingWhere.OR = [
        { topic: { contains: search, mode: "insensitive" } },
        { trainer: { contains: search, mode: "insensitive" } },
      ];
    }

    // Sorting
    let orderBy: any = { training: { date: "desc" } };
    switch (sort) {
      case "date-asc":
        orderBy = { training: { date: "asc" } };
        break;
      case "createdAt-asc":
        orderBy = { training: { createdAt: "asc" } };
        break;
      case "createdAt-desc":
        orderBy = { training: { createdAt: "desc" } };
        break;
    }

    // Count for pagination
    const total = await prisma.trainingParticipant.count({
      where: {
        participantId,
        training: trainingWhere,
      },
    });

    // Fetch trainings with only feedback status (exists or not)
    const assignments = await prisma.trainingParticipant.findMany({
      where: {
        participantId,
        training: trainingWhere,
      },
      include: {
        training: {
          select: {
            id: true,
            topic: true,
            date: true,
            trainer: true,
          }
        },
        feedback: {
          select: { id: true }
        }
      },
      orderBy,
      skip,
      take,
    });

    const trainings = assignments.map(a => ({
      assignmentId: a.id,
      assignedAt: a.assignedAt,
      training: {
        id: a.training.id,
        topic: a.training.topic,
        date: a.training.date,
        trainer: a.training.trainer,
      },
      feedbackGiven: !!a.feedback
    }));

    return NextResponse.json({
      participant,
      trainings,
      skip,
      take,
      total,
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error", detail: String(err) }, { status: 500 });
  }
}
