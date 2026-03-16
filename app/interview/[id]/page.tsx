import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import QuestionPanel from "@/components/QuestionPanel";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!interviewSession || interviewSession.userId !== session.user.id) {
    notFound();
  }

  const answered = interviewSession.questions.filter((q) => q.answer).length;
  const total = interviewSession.questions.length;
  const allAnswered = answered === total && total > 0;

  const avgScore =
    answered > 0
      ? Math.round(
          interviewSession.questions
            .filter((q) => q.score)
            .reduce((acc, q) => acc + (q.score ?? 0), 0) / answered
        )
      : null;

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-purple-400 hover:underline text-sm">
          ← Dashboard
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-400">
            {answered}/{total} answered
            {avgScore !== null && (
              <span className={`ml-3 font-bold ${avgScore >= 7 ? "text-green-400" : avgScore >= 5 ? "text-yellow-400" : "text-red-400"}`}>
                Avg: {avgScore}/10
              </span>
            )}
          </span>
          {allAnswered && (
            <Link
              href={`/interview/${id}/report`}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              View Report →
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{interviewSession.jobTitle}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date(interviewSession.createdAt).toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric", year: "numeric",
            })}
          </p>
        </div>

        {interviewSession.questions.map((question, i) => (
          <QuestionPanel key={question.id} question={question} index={i} />
        ))}

        {allAnswered && (
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6 text-center space-y-3">
            <p className="font-semibold text-purple-300">All questions answered!</p>
            <p className="text-slate-400 text-sm">Generate your full AI performance report.</p>
            <Link
              href={`/interview/${id}/report`}
              className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              ✨ Generate Report →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
