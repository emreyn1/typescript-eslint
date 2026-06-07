import { Clock, CreditCard, Globe, TrendingUp } from 'lucide-react';

const stats = [
  { 
    value: '$2.4M+', 
    label: 'Loaded This Month',
    icon: TrendingUp,
    detail: 'Volume processed'
  },
  { 
    value: '47 sec', 
    label: 'Avg. Card Delivery',
    icon: Clock,
    detail: 'From deposit to card'
  },
  { 
    value: '180+', 
    label: 'Countries Supported',
    icon: Globe,
    detail: 'Worldwide acceptance'
  },
  { 
    value: '3 years', 
    label: 'Card Validity',
    icon: CreditCard,
    detail: 'No monthly fees'
  },
];

export function Stats() {
  return (
    <section className="py-16 border-y border-border/40 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-3">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-gradient">{stat.value}</p>
              <p className="text-sm font-medium text-foreground mt-1">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
