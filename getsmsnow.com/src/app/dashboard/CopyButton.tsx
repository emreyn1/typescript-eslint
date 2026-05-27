"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      onClick={handleCopy}
      className="px-4 py-2 bg-GetSMSNow-blue hover:bg-GetSMSNow-blue/90 text-white rounded text-sm font-medium"
    >
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}
