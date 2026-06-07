'use client';

import { Button } from '@/components/ui/button';
import { Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralCopyButtonProps {
  link: string;
  code: string;
}

export function ReferralCopyButton({ link, code }: ReferralCopyButtonProps) {
  const copyLink = () => {
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied to clipboard');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Referral code copied to clipboard');
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join PryCard',
          text: `Sign up with my referral code ${code} and get $5 bonus!`,
          url: link,
        });
      } catch {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" className="flex-1 gap-2" onClick={copyCode}>
        <Copy className="h-4 w-4" />
        Copy Code
      </Button>
      <Button variant="gradient" className="flex-1 gap-2" onClick={share}>
        <Share2 className="h-4 w-4" />
        Share Link
      </Button>
    </div>
  );
}
