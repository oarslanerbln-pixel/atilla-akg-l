import HomePage from "@/components/HomePage";
import { homeMetadata } from "@/lib/metadata";

/** The portfolio in German, at the unprefixed address (also x-default). */
export const metadata = homeMetadata("DE");

export default function Home() {
  return <HomePage lang="DE" />;
}
