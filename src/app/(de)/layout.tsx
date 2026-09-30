import type { Metadata } from "next";
import RootDocument from "../RootDocument";
import { rootMetadata } from "@/lib/metadata";

/** Root layout for the German pages; see RootDocument. */
export const metadata: Metadata = rootMetadata("DE");

export default function GermanLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="DE">{children}</RootDocument>;
}
