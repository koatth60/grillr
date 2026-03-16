type Session = {
  questions: { score: number | null; answer: string | null }[];
  createdAt: Date | string;
};

export default function DashboardStats({ sessions }: { sessions: Session[] }) {
  const totalSessions = sessions.length;

  const allScores = sessions
    .flatMap((s) => s.questions.map((q) => q.score))
    .filter((s): s is number => s !== null);

  const avgScore =
    allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : null;

  const bestScore =
    allScores.length > 0 ? Math.max(...allScores) : null;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentSessions = sessions.filter(
    (s) => new Date(s.createdAt) >= oneWeekAgo
  ).length;

  const stats = [
    { label: "Total Sessions", value: totalSessions, suffix: "", color: "text-white" },
    {
      label: "Avg Score",
      value: avgScore ?? "—",
      suffix: avgScore ? "/10" : "",
      color: avgScore === null ? "text-slate-400" : avgScore >= 7 ? "text-green-400" : avgScore >= 5 ? "text-yellow-400" : "text-red-400",
    },
    {
      label: "Best Score",
      value: bestScore ?? "—",
      suffix: bestScore ? "/10" : "",
      color: bestScore === null ? "text-slate-400" : "text-purple-400",
    },
    { label: "This Week", value: recentSessions, suffix: "", color: "text-white" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-slate-800 border border-slate-700 rounded-2xl p-5 text-center"
        >
          <p className={`text-4xl font-bold ${stat.color}`}>
            {stat.value}
            <span className="text-lg text-slate-500">{stat.suffix}</span>
          </p>
          <p className="text-slate-500 text-xs mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
