// src/app/api/feedback/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod schema for incoming feedback data
const feedbackSchema = z.object({
  tpId: z.number(),
  trainerExplanation: z.string(),
  trainerKnowledge: z.string(),
  trainerEngagement: z.string(),
  trainerAnswering: z.string(),
  contentRelevance: z.string(),
  contentClarity: z.string(),
  contentOrganization: z.string(),
  infrastructureComfort: z.string(),
  seatingArrangement: z.string(),
  venueLocation: z.string(),
  overallSatisfaction: z.string(),
  recommendTraining: z.boolean(),
  additionalComments: z.string().optional(),
});

// POST /api/feedback
export async function POST(req: NextRequest) {
  // 1. Authenticate
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse & validate
  const body = await req.json();
  const result = feedbackSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", details: result.error.format() },
      { status: 400 }
    );
  }
  const data = result.data;

  // 3. Verify assignment and ownership, include existing feedback
  const assignment = await prisma.trainingParticipant.findUnique({
    where: { id: data.tpId },
    include: { participant: true, training: true, feedback: true },
  });
  if (
    !assignment ||
    assignment.participant.email !== session.user.email
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4. Prevent duplicate submission
  if (assignment.feedback) {
    return NextResponse.json(
      { error: "Feedback already submitted" },
      { status: 409 }
    );
  }

  // 5. Create feedback record
  const feedback = await prisma.feedback.create({
    data: {
      tpId: data.tpId,
      trainerExplanation: data.trainerExplanation,
      trainerKnowledge: data.trainerKnowledge,
      trainerEngagement: data.trainerEngagement,
      trainerAnswering: data.trainerAnswering,
      contentRelevance: data.contentRelevance,
      contentClarity: data.contentClarity,
      contentOrganization: data.contentOrganization,
      infrastructureComfort: data.infrastructureComfort,
      seatingArrangement: data.seatingArrangement,
      venueLocation: data.venueLocation,
      overallSatisfaction: data.overallSatisfaction,
      recommendTraining: data.recommendTraining,
      additionalComments: data.additionalComments,
    },
  });

  return NextResponse.json({ success: true, feedback }, { status: 201 });
}

// GET /api/feedback?tpId=123
export async function GET(req: NextRequest) {
  const tpIdParam = req.nextUrl.searchParams.get("tpId");
  const tpId = tpIdParam ? parseInt(tpIdParam, 10) : NaN;
  if (isNaN(tpId)) {
    return NextResponse.json({ error: "tpId query required" }, { status: 400 });
  }

  // Authenticate
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify assignment and ownership, include feedback
  const assignment = await prisma.trainingParticipant.findUnique({
    where: { id: tpId },
    include: { participant: true, training: true, feedback: true },
  });
  if (
    !assignment ||
    assignment.participant.email !== session.user.email
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Return the feedback (or null if none)
  return NextResponse.json({ feedback: assignment.feedback || null });
}
