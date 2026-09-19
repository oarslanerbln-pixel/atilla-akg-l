import Preloader from "@/components/Preloader";
import CustomCursor from "@/components/CustomCursor";
import Navbar from "@/components/Navbar";
import FilmGrain from "@/components/FilmGrain";
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import Stats from "@/components/Stats";
import FeaturedWork from "@/components/FeaturedWork";
import Services from "@/components/Services";
import CaseStudy from "@/components/CaseStudy";
import EditorialQuote from "@/components/EditorialQuote";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Preloader />
      <CustomCursor />
      <FilmGrain />
      <Navbar />
      <Hero />
      <Brands />
      <Stats />
      <FeaturedWork />
      <Services />
      <CaseStudy />
      <EditorialQuote />
      <Contact />
      <Footer />
    </main>
  );
}
