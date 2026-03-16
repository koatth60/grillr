import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import GenerateReportButton from "@/components/GenerateReportButton";

export default async function ReportPage({
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

  const answered = interviewSession.questions.filter((q) => q.answer && q.score !== null);
  const avgScore =
    answered.length > 0
      ? Math.round(
          answered.reduce((acc, q) => acc + (q.score ?? 0), 0) / answered.length
        )
      : 0;

  const scoreColor =
    avgScore >= 7 ? "text-green-400" : avgScore >= 5 ? "text-yellow-400" : "text-red-400";
  const scoreBg =
    avgScore >= 7 ? "bg-green-400/10 border-green-400/20" : avgScore >= 5 ? "bg-yellow-400/10 border-yellow-400/20" : "bg-red-400/10 border-red-400/20";

  // Parse markdown report into sections for better rendering
  const parseReport = (text: string) => {
    return text.split(/^##\s/m).filter(Boolean).map((section) => {
      const [title, ...lines] = section.split("\n");
      return { title: title.trim(), body: lines.join("\n").trim() };
    });
  };

  const sections = interviewSession.report ? parseReport(interviewSession.report) : [];

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href={`/interview/${id}`} className="text-purple-400 hover:underline text-sm">
          ← Back to session
        </Link>
        <Link href="/dashboard" className="text-slate-500 hover:text-white text-sm transition-colors">
          Dashboard
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div>
          <p className="text-slate-500 text-sm uppercase tracking-widest mb-1">Interview Report</p>
          <h1 className="text-3xl font-bold">{interviewSession.jobTitle}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date(interviewSession.createdAt).toLocaleDateString("en-US", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>

        {/* Score summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Questions", value: interviewSession.questions.length, suffix: "" },
            { label: "Answered", value: answered.length, suffix: "" },
            { label: "Avg Score", value: avgScore, suffix: "/10" },
          ].map((stat) => (
            <div key={stat.label} className={`border rounded-2xl p-5 text-center ${stat.label === "Avg Score" ? scoreBg : "bg-slate-800 border-slate-700"}`}>
              <p className={`text-4xl font-bold ${stat.label === "Avg Score" ? scoreColor : "text-white"}`}>
                {stat.value}<span className="text-xl text-slate-500">{stat.suffix}</span>
              </p>
              <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Per-question scores */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-300 mb-4">Question Breakdown</h2>
          <div className="space-y-3">
            {interviewSession.questions.map((q, i) => {
              const qColor = !q.score ? "bg-slate-600" : q.score >= 7 ? "bg-green-500" : q.score >= 5 ? "bg-yellow-500" : "bg-red-500";
              const width = q.score ? `${q.score * 10}%` : "0%";
              return (
                <div key={q.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400 truncate max-w-xs">Q{i + 1}: {q.text}</span>
                    <span className={`font-semibold ml-2 ${!q.score ? "text-slate-500" : q.score >= 7 ? "text-green-400" : q.score >= 5 ? "text-yellow-400" : "text-red-400"}`}>
                      {q.score ? `${q.score}/10` : "—"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className={`${qColor} h-1.5 rounded-full transition-all`} style={{ width }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Report */}
        {interviewSession.report ? (
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.title} className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="font-semibold text-purple-400 mb-3">{section.title}</h2>
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {section.body}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center space-y-4">
            <p className="text-slate-400">
              {answered.length === 0
                ? "Answer at least one question to generate your report."
                : "Generate your AI-powered performance report."}
            </p>
            {answered.length > 0 && (
              <GenerateReportButton sessionId={id} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
