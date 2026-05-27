import Hero from "@/components/sections/Hero";
import Faq from "@/components/sections/Faq";

export const metadata = {
  title: "FAQ - GetSMSNow",
  description: "Frequently asked questions about GetSMSNow temporary phone numbers, SMS activation, and verification services.",
};

export default function FaqPage() {
  return (
    <>
      <Hero
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about GetSMSNow and our services"
        variant="inner"
        showSearchForm={false}
      />
      <section className="py-16 md:py-20">
        <div className="container-custom max-w-3xl">
          <Faq showViewAllLink={false} />
        </div>
      </section>
    </>
  );
}
