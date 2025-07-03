import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const [trainings, participants, assignments] = await Promise.all([
    prisma.training.findMany({ where: { isActive: true } }),
    prisma.participant.count(),
    prisma.trainingParticipant.findMany({
      include: { feedback: true }
    })
  ]);
  // Top trainings: by number of assignments
  const counts = await prisma.trainingParticipant.groupBy({
    by: ['trainingId'],
    _count: { trainingId: true }
  });
  // Get feedback counts
  const feedbacks = assignments.filter(a => a.feedback).length;
  // Top 5 trainings
  const topTrainings = trainings
    .map(t => ({
      id: t.id,
      topic: t.topic,
      date: t.date,
      trainer: t.trainer,
      count: counts.find(c => c.trainingId === t.id)?._count.trainingId || 0,
      feedbacks: assignments.filter(a => a.trainingId === t.id && a.feedback).length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return NextResponse.json({
    trainings: await prisma.training.count(),
    activeTrainings: trainings.length,
    participants,
    assignments: assignments.length,
    feedbackSubmitted: feedbacks,
    pendingFeedback: assignments.length - feedbacks,
    topTrainings,
  });
}
