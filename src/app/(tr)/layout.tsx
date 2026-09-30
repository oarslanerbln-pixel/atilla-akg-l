import type { Metadata } from "next";
import RootDocument from "../RootDocument";
import { rootMetadata } from "@/lib/metadata";

/** Root layout for the Turkish pages; see RootDocument. */
export const metadata: Metadata = rootMetadata("TR");

export default function TurkishLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="TR">{children}</RootDocument>;
}
