"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function HomeSearchBar() {
  const [value, setValue] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.push(`/listings?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-md items-center gap-2 rounded-md border border-paper-line bg-paper-soft p-1.5 shadow-card"
    >
      <Search size={18} className="ml-2 text-ink-400" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="City, ZIP, or address"
        className="w-full bg-transparent px-1 py-2 text-sm text-ink-800 outline-none placeholder:text-ink-300"
      />
      <button type="submit" className="btn btn-amber shrink-0">
        Search
      </button>
    </form>
  );
}
