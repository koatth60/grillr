import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuestions } from "@/lib/claude";
import { PLANS } from "@/lib/stripe";

// GET /api/sessions — list user's sessions
export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessions = await prisma.interviewSession.findMany({
    where: { userId: session.user.id },
    include: { questions: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sessions);
}

// POST /api/sessions — create session + generate questions with Claude
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Enforce free tier session limit
  if (user.plan === "FREE") {
    const count = await prisma.interviewSession.count({
      where: { userId: user.id },
    });
    if (count >= PLANS.FREE.sessions) {
      return NextResponse.json(
        { error: "FREE_LIMIT_REACHED", limit: PLANS.FREE.sessions },
        { status: 403 }
      );
    }
  }

  const { jobTitle, jobDescription } = await req.json();
  if (!jobTitle || !jobDescription)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const questionTexts = await generateQuestions(jobTitle, jobDescription);

  const interviewSession = await prisma.interviewSession.create({
    data: {
      jobTitle,
      jobDescription,
      userId: session.user.id,
      questions: {
        create: questionTexts.map((text, i) => ({ text, order: i + 1 })),
      },
    },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(interviewSession, { status: 201 });
}
