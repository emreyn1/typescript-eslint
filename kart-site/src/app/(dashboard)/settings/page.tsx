import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SettingsForm } from './settings-form';
import { TwoFactorSetup } from './two-factor-setup';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      twoFactorEnabled: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and security</p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        <SettingsForm user={user} />
        <TwoFactorSetup enabled={user.twoFactorEnabled} />
      </div>
    </div>
  );
}
