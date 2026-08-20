import HeroSection from "../components/HeroSection";
import CategorySection from "../components/CategorySection";
import FeaturedProducts from "../components/FeaturedProducts";
import SmartTechnologySection from "../components/SmartTechnologySection";
import HowItWorksSection from "../components/HowItWorksSection";
import HomeCTA from "../components/HomeCTA";

const HomePage = () => {
  return (
    <main className="min-h-screen overflow-x-hidden bg-soft-white text-midnight-navy selection:bg-champagne-gold selection:text-luxury-black">
      <HeroSection />

      <CategorySection />

      <SmartTechnologySection />

      <HowItWorksSection />

      <HomeCTA />
    </main>
  );
};

export default HomePage;