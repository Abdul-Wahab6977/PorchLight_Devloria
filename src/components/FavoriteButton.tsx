"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function FavoriteButton({
  propertyId,
  initialFavorited,
}: {
  propertyId: string;
  initialFavorited: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!user) {
      router.push("/login");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
      const data = await res.json();
      setFavorited(data.favorited);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`btn shrink-0 ${favorited ? "btn-danger" : "btn-ghost"}`}
    >
      <Heart size={15} className={favorited ? "fill-clay-500" : ""} />
      {favorited ? "Saved" : "Save home"}
    </button>
  );
}
