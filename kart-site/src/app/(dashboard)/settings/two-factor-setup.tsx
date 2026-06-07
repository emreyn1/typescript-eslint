'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Shield, ShieldCheck, ShieldOff } from 'lucide-react';

interface TwoFactorSetupProps {
  enabled: boolean;
}

export function TwoFactorSetup({ enabled }: TwoFactorSetupProps) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [loading, setLoading] = useState(false);

  const startSetup = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start 2FA setup');
      }

      setQrCode(data.qrCode);
      setSecret(data.secret);
      setShowSetup(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (verifyCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verifyCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid code');
      }

      setIsEnabled(true);
      setShowSetup(false);
      setQrCode(null);
      setSecret(null);
      setVerifyCode('');
      toast.success('Two-factor authentication enabled');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    if (disableCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: disableCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid code');
      }

      setIsEnabled(false);
      setDisableCode('');
      toast.success('Two-factor authentication disabled');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const cancelSetup = () => {
    setShowSetup(false);
    setQrCode(null);
    setSecret(null);
    setVerifyCode('');
  };

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          {isEnabled ? (
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
          ) : (
            <Shield className="h-6 w-6 text-muted-foreground" />
          )}
          <div>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              {isEnabled
                ? 'Your account is protected with 2FA'
                : 'Add an extra layer of security to your account'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEnabled && !showSetup ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-500">
              <ShieldCheck className="h-5 w-5" />
              <span>Two-factor authentication is enabled</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disableCode">Enter 2FA code to disable</Label>
              <Input
                id="disableCode"
                placeholder="000000"
                maxLength={6}
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <Button
              variant="outline"
              className="text-red-500 hover:text-red-500"
              onClick={disable2FA}
              disabled={loading || disableCode.length !== 6}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <ShieldOff className="mr-2 h-4 w-4" />
              Disable 2FA
            </Button>
          </div>
        ) : showSetup ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Scan this QR code with your authenticator app
              </p>
              {qrCode && (
                <img
                  src={qrCode}
                  alt="2FA QR Code"
                  className="mx-auto h-48 w-48 rounded-lg"
                />
              )}
            </div>

            {secret && (
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="mb-1 text-xs text-muted-foreground">
                  Or enter this code manually:
                </p>
                <code className="text-sm font-mono break-all">{secret}</code>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="verifyCode">Enter the 6-digit code from your app</Label>
              <Input
                id="verifyCode"
                placeholder="000000"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={cancelSetup} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="gradient"
                onClick={verifyAndEnable}
                disabled={loading || verifyCode.length !== 6}
                className="flex-1"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Enable
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-amber-500/10 p-4 text-sm text-amber-500">
              <p className="font-medium">Recommended for security</p>
              <p className="mt-1 text-amber-500/80">
                2FA adds an extra layer of protection to your account, especially for
                withdrawals.
              </p>
            </div>

            <Button variant="gradient" onClick={startSetup} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Shield className="mr-2 h-4 w-4" />
              Enable Two-Factor Authentication
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
