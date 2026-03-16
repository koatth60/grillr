import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import NewSessionForm from "@/components/NewSessionForm";
import DashboardStats from "@/components/DashboardStats";
import UpgradePrompt from "@/components/UpgradePrompt";
import { PLANS } from "@/lib/stripe";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { upgraded } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      sessions: {
        include: { questions: { orderBy: { order: "asc" } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/login");

  const sessionCount = user.sessions.length;
  const freeLimit = PLANS.FREE.sessions;
  const isPro = user.plan === "PRO";
  const atLimit = !isPro && sessionCount >= freeLimit;

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold text-lg text-purple-400">InterviewPrep AI</h1>
        <div className="flex items-center gap-4 text-sm">
          {isPro && (
            <span className="bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs px-2.5 py-1 rounded-full font-medium">
              PRO
            </span>
          )}
          <span className="text-slate-400 hidden sm:block">{user.email}</span>
          <Link href="/settings" className="text-slate-400 hover:text-white transition-colors">Settings</Link>
          <Link href="/api/auth/signout" className="text-slate-500 hover:text-white transition-colors">Sign out</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Upgraded banner */}
        {upgraded && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-5 py-3 text-sm font-medium">
            🎉 Welcome to Pro! You now have unlimited interview sessions.
          </div>
        )}

        {/* Stats */}
        {user.sessions.length > 0 && (
          <DashboardStats sessions={user.sessions} />
        )}

        {/* Upgrade prompt for free users */}
        {!isPro && (
          <UpgradePrompt used={sessionCount} limit={freeLimit} />
        )}

        {/* New session */}
        <section>
          <h2 className="text-xl font-semibold mb-4">New Interview Session</h2>
          {atLimit ? (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center space-y-3">
              <p className="text-slate-400">You&apos;ve reached your free plan limit.</p>
              <Link
                href="/pricing"
                className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                Upgrade to Pro for unlimited sessions
              </Link>
            </div>
          ) : (
            <NewSessionForm isPro={isPro} used={sessionCount} limit={freeLimit} />
          )}
        </section>

        {/* Past sessions */}
        {user.sessions.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Past Sessions</h2>
            <div className="space-y-3">
              {user.sessions.map((s) => {
                const answered = s.questions.filter((q) => q.answer).length;
                const scores = s.questions.filter((q) => q.score !== null).map((q) => q.score!);
                const avgScore = scores.length > 0
                  ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                  : null;
                const allAnswered = answered === s.questions.length && s.questions.length > 0;

                return (
                  <div key={s.id} className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 flex items-center justify-between group hover:border-slate-600 transition-colors">
                    <Link href={`/interview/${s.id}`} className="flex-1 min-w-0">
                      <p className="font-medium group-hover:text-purple-400 transition-colors truncate">{s.jobTitle}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {" · "}{answered}/{s.questions.length} answered
                      </p>
                    </Link>
                    <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                      {avgScore !== null && (
                        <span className={`text-xl font-bold ${avgScore >= 7 ? "text-green-400" : avgScore >= 5 ? "text-yellow-400" : "text-red-400"}`}>
                          {avgScore}<span className="text-sm text-slate-500">/10</span>
                        </span>
                      )}
                      {allAnswered && (
                        <Link
                          href={`/interview/${s.id}/report`}
                          className="text-xs bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:bg-purple-600/40 px-3 py-1 rounded-lg transition-colors"
                        >
                          {s.report ? "View Report" : "Report →"}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
