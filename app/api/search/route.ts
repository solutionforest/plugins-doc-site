//import { useDocsSearch } from 'fumadocs-core/search/client';
//import { create } from '@orama/orama';
import { NextRequest, NextResponse } from "next/server";
//import { createFromSource } from 'fumadocs-core/search/server';
//import { source } from '@/lib/source';
//import { createLocalSource } from "@/lib/sources/local";

export async function GET() {
  return NextResponse.json({ message: "Search not implemented" });
}

export async function generateStaticParams() {
  return [];
}
