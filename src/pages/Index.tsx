import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import AboutUs from "@/components/landing/AboutUs";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Levels from "@/components/landing/Levels";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import FinalCTA from "@/components/landing/FinalCTA";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import ScrollToTop from "@/components/landing/ScrollToTop";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <AboutUs />
      <Features />
      <HowItWorks />
      <Levels />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
};

export default Index;
