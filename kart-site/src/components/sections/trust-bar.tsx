import { Globe, Lock, Shield, Zap } from 'lucide-react';
import { VisaLogo, MastercardLogo } from '@/components/icons/card-brands';

const badges = [
  { icon: Zap, label: '60s Delivery' },
  { icon: Shield, label: '3D Secure' },
  { icon: Lock, label: 'AES-256' },
  { icon: Globe, label: '180+ Countries' },
];

export function TrustBar() {
  return (
    <section className="border-y border-border/40 bg-muted/20 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg glass">
              <VisaLogo className="h-6 w-auto text-white" />
              <MastercardLogo className="h-6 w-auto" />
            </div>
            <p className="text-sm text-muted-foreground">
              Accepted at <span className="text-foreground font-medium">50M+ merchants</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {badges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <badge.icon className="h-4 w-4 text-primary" />
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
