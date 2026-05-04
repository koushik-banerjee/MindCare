import { Layout } from "@/components/frontpage/Layout";
import { HeroSection } from "@/components/features/HeroSection";
import { FeaturesShowcase } from "@/components/features/FeaturesShowcase";
import { WhyMindcare } from "@/components/features/WhyMindcare";
import { CTASection } from "@/components/features/CTASection";

export default function Index() {
  return (
    <Layout>
      <HeroSection />
      <FeaturesShowcase />
      <WhyMindcare />
      <CTASection />
    </Layout>
  );
}
