import HomePage from "@/components/HomePage";
import { homeMetadata } from "@/lib/metadata";

/** The portfolio in Turkish, at /tr. */
export const metadata = homeMetadata("TR");

export default function HomeTurkish() {
  return <HomePage lang="TR" />;
}
