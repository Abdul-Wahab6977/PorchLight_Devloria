"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function InquiryForm({ propertyId }: { propertyId: string }) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("I'd like to schedule a tour and learn more about this property.");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, name, email, phone, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send your message");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-md border border-moss-100 bg-moss-50 p-4 text-sm text-moss-600">
        <span className="beacon is-live mr-2" />
        Message sent — the agent has been notified and will reach out to you directly.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="field-label">Name</label>
        <input required className="field-input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="field-label">Email</label>
        <input required type="email" className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="field-label">Phone (optional)</label>
        <input className="field-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <label className="field-label">Message</label>
        <textarea
          required
          rows={4}
          className="field-input resize-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-clay-500">{error}</p>}
      <button type="submit" disabled={status === "sending"} className="btn btn-amber w-full">
        {status === "sending" ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
