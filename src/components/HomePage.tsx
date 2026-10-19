import Preloader from "@/components/Preloader";
import CustomCursor from "@/components/CustomCursor";
import Navbar from "@/components/Navbar";
import HomeHero from "@/components/HomeHero";
import Brands from "@/components/Brands";
import About from "@/components/About";
import FilmBand from "@/components/FilmBand";
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
import { CASE_REEL, loadCaseFilm } from "@/lib/reels/manifest";
import ed from "@/components/editorial.module.css";

/**
 * The single-page portfolio, served at /, /en and /tr. The language comes
 * from the route's root layout; here it only picks the structured data.
 */
export default async function HomePage({ lang }: { lang: Language }) {
  // The Novotel reel, mirrored by the reels cron; both places that show it read it here.
  const caseFilm = await loadCaseFilm();
  return (
    <main className={`${ed.chapters} ${ed.gallery}`}>
      <JsonLd data={homeGraph(lang)} />
      <Preloader />
      <CustomCursor />
      <Navbar />
      <HomeHero />
      <Brands />
      <About />
      <FilmBand />
      <Stats />
      <Partners />
      <FeaturedWork novotel={caseFilm} permalink={CASE_REEL.permalink} />
      <LatestReels />
      <RoadmapTeaser />
      <Services />
      <CaseStudy film={caseFilm} permalink={CASE_REEL.permalink} />
      <EditorialQuote />
      <Faq />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
