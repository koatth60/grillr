import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateReport } from "@/lib/claude";
import { sendReportEmail } from "@/lib/resend";

// POST /api/sessions/:id/report — generate AI report for a completed session
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      user: true,
    },
  });

  if (!interviewSession || interviewSession.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const answered = interviewSession.questions.filter(
    (q) => q.answer && q.score !== null
  );

  if (answered.length === 0)
    return NextResponse.json({ error: "No answered questions" }, { status: 400 });

  // Generate AI report
  const report = await generateReport(
    interviewSession.jobTitle,
    answered.map((q) => ({
      question: q.text,
      answer: q.answer!,
      score: q.score!,
    }))
  );

  // Save report to session
  const updated = await prisma.interviewSession.update({
    where: { id },
    data: { report },
  });

  // Send report email (fire and forget — don't block response)
  const avgScore = Math.round(
    answered.reduce((acc, q) => acc + (q.score ?? 0), 0) / answered.length
  );
  const reportUrl = `${process.env.NEXTAUTH_URL}/interview/${id}/report`;
  sendReportEmail(
    interviewSession.user.email,
    interviewSession.user.name ?? "",
    interviewSession.jobTitle,
    avgScore,
    reportUrl
  ).catch(() => {}); // silently ignore email errors

  return NextResponse.json(updated);
}
