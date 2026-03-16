"use client";

import Link from "next/link";

export default function UpgradePrompt({ used, limit }: { used: number; limit: number }) {
  return (
    <div className="bg-gradient-to-r from-purple-900/40 to-slate-800 border border-purple-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <p className="font-semibold text-white">
          {used >= limit ? "You've used all your free sessions" : `${used}/${limit} free sessions used`}
        </p>
        <p className="text-slate-400 text-sm mt-0.5">
          Upgrade to Pro for unlimited sessions, priority processing, and more.
        </p>
      </div>
      <Link
        href="/pricing"
        className="flex-shrink-0 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap"
      >
        Upgrade to Pro →
      </Link>
    </div>
  );
}
