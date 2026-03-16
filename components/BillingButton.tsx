"use client";

import { useState } from "react";

export default function BillingButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
    >
      {loading ? "Opening portal..." : "Manage Subscription →"}
    </button>
  );
}
