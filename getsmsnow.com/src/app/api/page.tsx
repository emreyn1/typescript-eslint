import Hero from "@/components/sections/Hero";
import { Clock } from "lucide-react";

export const metadata = {
  title: "API Documentation - GetSMSNow",
  description: "Integrate GetSMSNow SMS and temporary number services via API. Documentation coming soon.",
};

export default function ApiDocsPage() {
  return (
    <>
      <Hero
        title="API Documentation"
        subtitle="Integrate our SMS and temporary number services into your applications"
        variant="inner"
        showSearchForm={false}
      />

      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-GetSMSNow-light-blue/50 dark:bg-GetSMSNow-blue/20 mb-8">
              <Clock className="h-10 w-10 text-GetSMSNow-red" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">Coming Soon</h2>
            <p className="text-muted-foreground mb-6">
              We are preparing full API documentation for developers. You will be able to request temporary numbers, receive SMS callbacks, and manage orders programmatically.
            </p>
            <p className="text-sm text-muted-foreground">
              In the meantime, you can use the website to receive SMS online. For API access or partnership inquiries, reach us via Telegram.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
