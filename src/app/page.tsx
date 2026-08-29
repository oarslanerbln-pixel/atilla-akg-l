import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import FilmGrain from "@/components/FilmGrain";
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import Stats from "@/components/Stats";
import Services from "@/components/Services";
import FeaturedWork from "@/components/FeaturedWork";
import CaseStudy from "@/components/CaseStudy";
import EditorialQuote from "@/components/EditorialQuote";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Preloader />
      <FilmGrain />
      <Navbar />
      <Hero />
      <Brands />
      <FeaturedWork />
      <Stats />
      <Services />
      <CaseStudy />
      <EditorialQuote />
      <Contact />
      <Footer />
    </main>
  );
}
