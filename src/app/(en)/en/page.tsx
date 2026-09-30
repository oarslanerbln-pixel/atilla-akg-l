import HomePage from "@/components/HomePage";
import { homeMetadata } from "@/lib/metadata";

/** The portfolio in English, at /en. */
export const metadata = homeMetadata("EN");

export default function HomeEnglish() {
  return <HomePage lang="EN" />;
}
