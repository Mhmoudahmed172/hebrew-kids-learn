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
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-medium"
      >
        تخطّي إلى المحتوى الرئيسي
      </a>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-background">
        <Hero />
        <AboutUs />
        <Features />
        <HowItWorks />
        <Levels />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default Index;
