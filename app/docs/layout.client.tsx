"use client";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";

export function Body({ children }: { children: ReactNode }) {
  const { slug } = useParams() as { slug?: string[] };

  if (!slug) return children;
  let color: string | undefined;

  return (
    <>
      {color ? (
        <style>
          {`:root {
            --color-fd-primary: ${color};
        }`}
        </style>
      ) : null}
      {children}
    </>
  );
}
