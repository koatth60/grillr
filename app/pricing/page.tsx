import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const session = await auth();
  const { demo } = await searchParams;

  let userPlan = "FREE";
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    userPlan = user?.plan ?? "FREE";
  }

  const plans = [
    {
      id: "FREE",
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out the platform",
      features: [
        "3 interview sessions",
        "5 AI-generated questions per session",
        "AI answer feedback & scoring",
        "Session history",
      ],
      cta: userPlan === "FREE" ? "Current plan" : "Downgrade",
      highlight: false,
    },
    {
      id: "PRO",
      name: "Pro",
      price: "$9",
      period: "per month",
      description: "For serious job seekers",
      features: [
        "Unlimited interview sessions",
        "5 AI-generated questions per session",
        "AI answer feedback & scoring",
        "Full performance reports",
        "Email reports",
        "Priority processing",
      ],
      cta: userPlan === "PRO" ? "Current plan" : "Upgrade to Pro",
      highlight: true,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-purple-400">InterviewPrep AI</Link>
        {session?.user ? (
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">Dashboard →</Link>
        ) : (
          <Link href="/login" className="text-slate-400 hover:text-white text-sm transition-colors">Sign in</Link>
        )}
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16 text-center space-y-4">
        <h1 className="text-4xl font-bold">Simple, honest pricing</h1>
        <p className="text-slate-400 text-lg">Start free. Upgrade when you need more.</p>
      </div>

      {demo && (
        <div className="max-w-4xl mx-auto px-6 mb-8">
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl px-5 py-3 text-sm text-center">
            Demo mode — Stripe test keys not configured yet. In production, clicking Upgrade opens real Stripe checkout with test card 4242 4242 4242 4242.
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 pb-20 grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl p-8 border space-y-6 ${
              plan.highlight
                ? "bg-purple-900/20 border-purple-500/40"
                : "bg-slate-800 border-slate-700"
            }`}
          >
            {plan.highlight && (
              <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}
            <div>
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              <div className="mt-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-slate-400 ml-1">/{plan.period}</span>
              </div>
              <p className="text-slate-400 text-sm mt-2">{plan.description}</p>
            </div>

            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="text-green-400">✓</span> {f}
                </li>
              ))}
            </ul>

            {plan.id === "PRO" && userPlan !== "PRO" ? (
              session?.user ? (
                <CheckoutButton />
              ) : (
                <Link
                  href="/register"
                  className="block text-center bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Get started
                </Link>
              )
            ) : (
              <div
                className={`text-center py-3 rounded-xl font-semibold text-sm ${
                  plan.id === userPlan
                    ? "bg-slate-700 text-slate-400 cursor-default"
                    : "bg-slate-700 text-slate-400"
                }`}
              >
                {plan.cta}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
