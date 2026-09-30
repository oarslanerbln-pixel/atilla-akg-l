import type { Metadata } from "next";
import RootDocument from "../RootDocument";
import { rootMetadata } from "@/lib/metadata";

/** Root layout for the English pages; see RootDocument. */
export const metadata: Metadata = rootMetadata("EN");

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="EN">{children}</RootDocument>;
}
