// src/app/api/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// 1. Define your expected payload schema
const feedbackSchema = z.object({
  tpId: z.number(),              // trainingParticipant ID
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

export async function POST(req: NextRequest) {
  // 2. Authenticate the user
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Parse & validate the JSON body
  const body = await req.json();
  const parse = feedbackSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parse.error.format() },
      { status: 400 }
    );
  }
  const data = parse.data;

  // 4. Verify ownership: that this tpId belongs to the logged-in user
  const assignment = await prisma.trainingParticipant.findUnique({
    where: { id: data.tpId },
    include: { participant: true, training: true },
  });
  if (
    !assignment ||
    assignment.participant.email !== session.user.email
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 5. Prevent duplicate feedback
  if (assignment.feedback) {
    return NextResponse.json({ error: "Feedback already submitted" }, { status: 409 });
  }

  // 6. Create the feedback record
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

export async function GET(req: NextRequest) {
  // Fetch query parameter ?tpId=#
  const tpIdParam = req.nextUrl.searchParams.get("tpId");
  const tpId = tpIdParam ? parseInt(tpIdParam, 10) : NaN;
  if (isNaN(tpId)) {
    return NextResponse.json({ error: "tpId query required" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify assignment ownership
  const assignment = await prisma.trainingParticipant.findUnique({
    where: { id: tpId },
    include: { participant: true, feedback: true, training: true },
  });
  if (
    !assignment ||
    assignment.participant.email !== session.user.email
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Return feedback (could be null if not yet submitted)
  return NextResponse.json({ feedback: assignment.feedback || null });
}
