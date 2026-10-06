import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const SEED_USERS = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    email: 'admin@jeanius.co',
    password: 'adminpassword123',
    role: 'ADMIN',
    fullName: 'Jeanius & Jewl Atelier Admin',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    email: 'mastercutter@jeanius.co',
    password: 'tailorpassword123',
    role: 'TAILOR',
    fullName: 'Pasang Master Cutter (Denim)',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    email: 'metalsmith@jeanius.co',
    password: 'jewellerpassword123',
    role: 'JEWELLER',
    fullName: 'Bikash Master Jeweller (Metalsmith)',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    email: 'logistics@jeanius.co',
    password: 'fulfillmentpassword123',
    role: 'FULFILLMENT',
    fullName: 'Kiran Fulfillment Lead',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    email: 'care@jeanius.co',
    password: 'supportpassword123',
    role: 'SUPPORT',
    fullName: 'Sita Customer Care Lead',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000006',
    email: 'shopper@example.com',
    password: 'customerpassword123',
    role: 'CUSTOMER',
    fullName: 'Alex Raw Denim Collector',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000007',
    email: 'vip@example.com',
    password: 'memberpassword123',
    role: 'MEMBER',
    fullName: 'Elena VIP Atelier Patron',
  },
];

async function seedAuthUsers() {
  console.log('Seeding Supabase Auth users...');
  const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 100 });
  const existingUsers = listData?.users ?? [];

  for (const user of SEED_USERS) {
    const existing = existingUsers.find((u) => u.email === user.email);
    if (existing && existing.id !== user.id) {
      console.log(
        `Re-aligning mismatched auth user ID for ${user.email} (deleting old ID ${existing.id})...`,
      );
      await supabase.auth.admin.deleteUser(existing.id);
    }

    const { error } = await supabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        role: user.role,
        full_name: user.fullName,
      },
    });

    if (error && error.message.includes('already been registered')) {
      await supabase.auth.admin.updateUserById(user.id, {
        password: user.password,
        email_confirm: true,
        user_metadata: {
          role: user.role,
          full_name: user.fullName,
        },
      });
      console.log(`✓ Auth user updated: ${user.email} (${user.role}) [ID: ${user.id}]`);
    } else if (error) {
      console.warn(`Could not provision ${user.email}:`, error.message);
    } else {
      console.log(`✓ Auth user provisioned: ${user.email} (${user.role}) [ID: ${user.id}]`);
    }
  }
}

seedAuthUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to seed auth users:', err);
    process.exit(1);
  });
