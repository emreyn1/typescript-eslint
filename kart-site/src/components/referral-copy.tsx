'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Copy, Share2 } from 'lucide-react';

interface ReferralCopyProps {
  referralCode: string;
  referralLink: string;
}

export function ReferralCopy({ referralCode, referralLink }: ReferralCopyProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center sm:justify-start">
        <Button variant="outline" size="sm" className="gap-2" onClick={copyCode}>
          <Copy className="h-4 w-4" />
          {copied ? 'Copied!' : 'Copy Code'}
        </Button>
      </div>
      <div className="p-4 rounded-xl bg-background/50 border border-border/40">
        <p className="text-sm text-muted-foreground mb-2">Your Referral Link</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <code className="flex-1 text-sm bg-muted/50 p-3 rounded-lg overflow-x-auto">
            {referralLink}
          </code>
          <Button variant="gradient" className="gap-2 shrink-0" onClick={copyLink}>
            <Share2 className="h-4 w-4" />
            Copy Link
          </Button>
        </div>
      </div>
    </div>
  );
}
