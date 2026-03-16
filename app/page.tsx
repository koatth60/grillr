import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4 text-white">
      <div className="max-w-3xl text-center space-y-6">
        <div className="inline-block bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-1 text-sm text-purple-300 mb-2">
          Powered by Claude AI
        </div>
        <h1 className="text-5xl font-bold leading-tight">
          Ace Your Next
          <span className="text-purple-400"> Tech Interview</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-xl mx-auto">
          Paste any job description, get AI-generated questions tailored to the
          role, answer them, and receive instant expert feedback.
        </p>
        <div className="flex gap-4 justify-center pt-4 flex-wrap">
          <Link
            href="/register"
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="border border-slate-600 hover:border-slate-400 text-slate-300 font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/pricing"
            className="text-slate-400 hover:text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Pricing
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-16 text-left">
          {[
            {
              icon: "📋",
              title: "Paste Job Description",
              desc: "Any role, any level. Claude reads the JD and understands what the company wants.",
            },
            {
              icon: "🤖",
              title: "AI-Generated Questions",
              desc: "5 tailored questions mixing technical, behavioral, and situational angles.",
            },
            {
              icon: "💡",
              title: "Instant Expert Feedback",
              desc: "Answer each question and get scored feedback to improve before the real interview.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-2"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
