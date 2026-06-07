import Link from 'next/link';
import { ArrowRight, MessageCircle, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'About Us | PryCard',
  description: 'Learn about PryCard - privacy-first virtual crypto cards.',
};

export default function AboutPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Privacy-First <span className="text-gradient">Financial Freedom</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            PryCard was built for people who value privacy, speed, and control. We believe
            everyone deserves access to modern payment tools without sacrificing their personal
            data.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: Shield,
              title: 'Privacy First',
              description:
                'Zero-knowledge principles guide every product decision we make.',
            },
            {
              icon: Zap,
              title: 'Instant Access',
              description:
                'Fund with crypto, get your card in seconds. No lengthy approval processes.',
            },
            {
              icon: MessageCircle,
              title: 'Real Human Support',
              description:
                'Our team are real people—not bots. Fast, multi-language assistance when you need it.',
            },
          ].map((item) => (
            <div key={item.title} className="text-center p-8 rounded-2xl glass-card">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>

        <div id="contact" className="max-w-2xl mx-auto text-center glass-card rounded-2xl p-8 sm:p-12">
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <p className="text-muted-foreground mb-6">
            Reach out via live chat on our website or email support@prycard.com. We typically
            respond within a few hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gradient" asChild>
              <Link href="/register" className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/faq">View FAQ</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
