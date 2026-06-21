"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center justify-center rounded-full bg-secondary-container/90 p-2.5 shadow-[0_4px_16px_rgba(118,146,131,0.12)] backdrop-blur transition-colors hover:bg-secondary-container"
      aria-label="Volver"
    >
      <ArrowLeft className="h-5 w-5 text-on-surface" />
    </button>
  );
}
