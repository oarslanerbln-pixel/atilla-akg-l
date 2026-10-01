import Preloader from "@/components/Preloader";
import CustomCursor from "@/components/CustomCursor";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import Stats from "@/components/Stats";
import Partners from "@/components/Partners";
import FeaturedWork from "@/components/FeaturedWork";
import LatestReels from "@/components/LatestReels";
import RoadmapTeaser from "@/components/RoadmapTeaser";
import Services from "@/components/Services";
import CaseStudy from "@/components/CaseStudy";
import EditorialQuote from "@/components/EditorialQuote";
import Faq from "@/components/Faq";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import JsonLd from "@/components/JsonLd";
import type { Language } from "@/i18n/translations";
import { homeGraph } from "@/lib/structuredData";

/**
 * The single-page portfolio, served at /, /en and /tr. The language comes
 * from the route's root layout; here it only picks the structured data.
 */
export default function HomePage({ lang }: { lang: Language }) {
  return (
    <main>
      <JsonLd data={homeGraph(lang)} />
      <Preloader />
      <CustomCursor />
      <Navbar />
      <Hero />
      <Brands />
      <Stats />
      <Partners />
      <FeaturedWork />
      <LatestReels />
      <RoadmapTeaser />
      <Services />
      <CaseStudy />
      <EditorialQuote />
      <Faq />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
