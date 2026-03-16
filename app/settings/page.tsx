import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BillingButton from "@/components/BillingButton";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const isPro = user.plan === "PRO";

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-purple-400 hover:underline text-sm">
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        {/* Profile */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-slate-300">Account</h2>
          <div className="space-y-3">
            {[
              { label: "Name", value: user.name ?? "—" },
              { label: "Email", value: user.email },
              { label: "Plan", value: isPro ? "Pro" : "Free" },
              { label: "Member since", value: new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-500">{label}</span>
                <span className={`font-medium ${label === "Plan" && isPro ? "text-purple-400" : "text-slate-200"}`}>
                  {value}
                  {label === "Plan" && isPro && (
                    <span className="ml-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs px-2 py-0.5 rounded-full">
                      PRO
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Billing */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-slate-300">Billing</h2>
          {isPro ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                You&apos;re on the Pro plan. Manage your subscription, update payment method, or cancel anytime.
              </p>
              <BillingButton />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                You&apos;re on the Free plan (3 sessions included).
              </p>
              <Link
                href="/pricing"
                className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                Upgrade to Pro →
              </Link>
            </div>
          )}
        </div>

        {/* Sign out */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-300 mb-3">Session</h2>
          <Link
            href="/api/auth/signout"
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Sign out of all devices
          </Link>
        </div>
      </div>
    </main>
  );
}
