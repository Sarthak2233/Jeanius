import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { db, DrizzleUserProfileRepository, DrizzleAddressRepository } from '@jeanius/database';
import { AccountClientView } from './account-client';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?returnUrl=/account');
  }

  const userProfileRepo = new DrizzleUserProfileRepository(db);
  const addressRepo = new DrizzleAddressRepository(db);

  let profile = await userProfileRepo.findById(user.id);
  if (!profile || (user.email && profile.email.toLowerCase() !== user.email.toLowerCase())) {
    if (user.email) {
      profile = await userProfileRepo.findByEmail(user.email);
    }
  }
  const addresses = await addressRepo.findByUserId(profile?.id ?? user.id);

  if (!profile) {
    // If auth user exists but profile row has not yet synchronized
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Atelier Profile Initializing</h1>
        <p style={{ color: '#64748b' }}>
          Your profile record is being synchronized with the Kathmandu database. Please refresh in a
          moment.
        </p>
      </div>
    );
  }

  return (
    <AccountClientView
      profile={{
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        phone: profile.phone,
        role: profile.role,
        denimPreferences: profile.denimPreferences,
        jewelleryPreferences: profile.jewelleryPreferences,
      }}
      addresses={addresses.map((a) => ({
        id: a.id,
        fullName: a.fullName,
        addressLine1: a.addressLine1,
        addressLine2: a.addressLine2,
        city: a.city,
        stateOrProvince: a.stateOrProvince,
        postalCode: a.postalCode,
        country: a.country,
        phone: a.phone,
        isDefaultShipping: a.isDefaultShipping,
        isDefaultBilling: a.isDefaultBilling,
      }))}
    />
  );
}
