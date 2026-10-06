import React from 'react';
import { createClient } from '../lib/supabase/server';
import { db, DrizzleUserProfileRepository } from '@jeanius/database';
import { DesktopHeader } from './desktop-header';
import { MobileHeader } from './mobile-header';
import { MobileDrawer } from './mobile-drawer';

export interface StorefrontHeaderProps {
  readonly cartItemCount?: number;
}

export async function StorefrontHeader({ cartItemCount = 0 }: StorefrontHeaderProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role = (user?.user_metadata?.role as string) || 'CUSTOMER';
  let fullName =
    (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'Collector';

  if (user) {
    try {
      const userProfileRepo = new DrizzleUserProfileRepository(db);
      let profile = await userProfileRepo.findById(user.id);
      if (!profile || (user.email && profile.email.toLowerCase() !== user.email.toLowerCase())) {
        if (user.email) {
          profile = await userProfileRepo.findByEmail(user.email);
        }
      }
      if (profile) {
        role = profile.role;
        fullName = profile.fullName;
      }
    } catch {
      // Graceful fallback to token metadata
    }
  }

  const isAuthenticated = !!user;

  return (
    <header
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(253, 251, 247, 0.95)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e2e8f0',
        transition: 'background-color 200ms ease',
      }}
    >
      {/* Desktop Navigation Segment */}
      <div className="header-desktop-view">
        <DesktopHeader
          isAuthenticated={isAuthenticated}
          role={role}
          fullName={fullName}
          cartItemCount={cartItemCount}
        />
      </div>

      {/* Mobile Navigation Segment */}
      <div className="header-mobile-view">
        <MobileHeader cartItemCount={cartItemCount} />
      </div>

      {/* Mobile Slide-Over Drawer Island */}
      <MobileDrawer isAuthenticated={isAuthenticated} role={role} fullName={fullName} />
    </header>
  );
}
