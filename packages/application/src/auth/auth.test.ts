import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  UserProfile,
  ForbiddenError,
  UnauthorizedError,
  createEntityId,
  type Actor,
  type DomainEvent,
  type UserProfileProps,
} from '@jeanius/domain';
import {
  SignUpUseCase,
  LoginUseCase,
  LogoutUseCase,
  CheckMembershipAccessUseCase,
  RecordPrivilegedActionUseCase,
  CustomerProfileUseCase,
  ResolveCustomizationDefaultsUseCase,
  assertActorHasRole,
  assertPrePointOfNoReturn,
} from './index';
import type { IAuthGateway, AuthUserSession } from './auth-gateway.port';
import type { IUserProfileRepository } from './user-profile-repository.port';
import type {
  IAddressRepository,
  AddressRecord,
  CreateAddressParams,
} from './address-repository.port';
import type { IAuditLogRepository, AuditLogRecord } from '../audit/audit-log-repository.port';
import type { IOutboxRepository, OutboxMessage } from '../audit/outbox-repository.port';

// Mock in-memory implementations for fast, deterministic unit testing
class MockAuthGateway implements IAuthGateway {
  public signedOut = false;
  async signUp(_input: { email: string; password: string; fullName: string }) {
    return { userId: 'usr_mock_123', emailConfirmationRequired: false };
  }
  async signInWithPassword(input: { email: string; password: string }): Promise<AuthUserSession> {
    return {
      userId: 'usr_mock_123',
      email: input.email,
      role: 'CUSTOMER',
      accessToken: 'jwt_mock_token',
    };
  }
  async signOut() {
    this.signedOut = true;
  }
  async requestPasswordReset(_email: string) {}
  async updatePassword(_pwd: string) {}
  async getUserFromToken(_token: string) {
    return { userId: 'usr_mock_123', email: 'test@example.com' };
  }
}

class MockUserProfileRepository implements IUserProfileRepository {
  private profiles = new Map<string, UserProfile>();

  async findById(id: string) {
    return this.profiles.get(id) ?? null;
  }
  async findByEmail(email: string) {
    for (const p of this.profiles.values()) {
      if (p.email === email) return p;
    }
    return null;
  }
  async create(props: UserProfileProps) {
    const profile = new UserProfile(props);
    this.profiles.set(props.id, profile);
    return profile;
  }
  async update(id: string, updates: Partial<UserProfileProps>) {
    const existing = this.profiles.get(id);
    if (!existing) throw new Error('Not found');
    const updated = new UserProfile({
      ...existing.toJSON(),
      ...updates,
      updatedAt: new Date(),
    });
    this.profiles.set(id, updated);
    return updated;
  }
}

class MockAddressRepository implements IAddressRepository {
  private addresses: AddressRecord[] = [];

  async findByUserId(userId: string) {
    return this.addresses.filter((a) => a.userId === userId);
  }
  async findById(id: string) {
    return this.addresses.find((a) => a.id === id) ?? null;
  }
  async create(params: CreateAddressParams) {
    const rec: AddressRecord = {
      id: `addr_${Date.now()}`,
      userId: params.userId,
      fullName: params.fullName,
      addressLine1: params.addressLine1,
      city: params.city,
      postalCode: params.postalCode,
      country: params.country,
      phone: params.phone,
      isDefaultShipping: params.isDefaultShipping ?? false,
      isDefaultBilling: params.isDefaultBilling ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.addresses.push(rec);
    return rec;
  }
  async delete(id: string, userId: string) {
    this.addresses = this.addresses.filter((a) => !(a.id === id && a.userId === userId));
  }
  async setDefaultShipping(id: string, userId: string) {
    this.addresses = this.addresses.map((a) =>
      a.userId === userId ? { ...a, isDefaultShipping: a.id === id } : a,
    );
  }
  async setDefaultBilling(id: string, userId: string) {
    this.addresses = this.addresses.map((a) =>
      a.userId === userId ? { ...a, isDefaultBilling: a.id === id } : a,
    );
  }
}

class MockAuditLogRepository implements IAuditLogRepository {
  public records: AuditLogRecord[] = [];
  async record(log: AuditLogRecord) {
    this.records.push(log);
  }
  async findRecent(limit = 20): Promise<AuditLogRecord[]> {
    return this.records.slice(-limit).reverse();
  }
}

class MockOutboxRepository implements IOutboxRepository {
  public events: readonly (DomainEvent | OutboxMessage)[] = [];
  async append(events: readonly (DomainEvent | OutboxMessage)[]) {
    this.events = [...this.events, ...events];
  }
  async fetchPendingBatch(_batchSize: number): Promise<readonly OutboxMessage[]> {
    return [];
  }
  async markCompleted(_eventIds: readonly string[]) {}
  async markFailed(_eventId: string, _error: string) {}
}

describe('State 05: Auth & Security — Application Layer', () => {
  it('SignUpUseCase provisions customer identity, profile, and outbox event', async () => {
    const authGateway = new MockAuthGateway();
    const profileRepo = new MockUserProfileRepository();
    const outboxRepo = new MockOutboxRepository();

    const useCase = new SignUpUseCase(authGateway, profileRepo, outboxRepo);
    const result = await useCase.execute({
      email: 'collector@jeanius.co',
      password: 'SecurePassword123!',
      fullName: 'Raw Denim & Silver Aficionado',
    });

    assert.equal(result.userId, 'usr_mock_123');
    assert.equal(result.email, 'collector@jeanius.co');

    const profile = await profileRepo.findById(result.userId);
    assert.ok(profile);
    assert.equal(profile.role, 'CUSTOMER');
    assert.equal(profile.fullName, 'Raw Denim & Silver Aficionado');

    assert.equal(outboxRepo.events.length, 1);
    assert.equal(outboxRepo.events[0]?.eventType, 'USER_REGISTERED');
  });

  it('LoginUseCase authenticates and attaches canonical role from profile', async () => {
    const authGateway = new MockAuthGateway();
    const profileRepo = new MockUserProfileRepository();

    // Seed master jeweller profile
    await profileRepo.create({
      id: createEntityId<'UserProfile'>('usr_mock_123'),
      email: 'metalsmith@jeanius.co',
      fullName: 'Bikash Master Jeweller',
      role: 'JEWELLER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const useCase = new LoginUseCase(authGateway, profileRepo);
    const result = await useCase.execute({
      email: 'metalsmith@jeanius.co',
      password: 'Password123!',
    });

    assert.equal(result.role, 'JEWELLER');
    assert.equal(result.fullName, 'Bikash Master Jeweller');
    assert.equal(result.session.role, 'JEWELLER');
  });

  it('LogoutUseCase signs out session via auth gateway', async () => {
    const authGateway = new MockAuthGateway();
    const useCase = new LogoutUseCase(authGateway);
    await useCase.execute();
    assert.equal(authGateway.signedOut, true);
  });

  it('assertActorHasRole strictly enforces role boundaries', () => {
    const tailorActor: Actor = { id: 't1', role: 'TAILOR', email: 'tailor@jeanius.co' };
    const jewellerActor: Actor = { id: 'j1', role: 'JEWELLER', email: 'jeweller@jeanius.co' };
    const guestActor: Actor = { id: 'g1', role: 'GUEST' };

    // Tailor allowed on denim workshop
    assert.doesNotThrow(() => assertActorHasRole(tailorActor, ['TAILOR', 'ADMIN']));

    // Tailor forbidden on jeweller bench
    assert.throws(() => assertActorHasRole(tailorActor, ['JEWELLER', 'ADMIN']), ForbiddenError);

    // Jeweller allowed on jewellery bench
    assert.doesNotThrow(() => assertActorHasRole(jewellerActor, ['JEWELLER', 'ADMIN']));

    // Jeweller forbidden on denim cut tickets
    assert.throws(() => assertActorHasRole(jewellerActor, ['TAILOR', 'ADMIN']), ForbiddenError);

    // Guest rejected
    assert.throws(() => assertActorHasRole(guestActor, ['CUSTOMER']), UnauthorizedError);
  });

  it('assertPrePointOfNoReturn enforces craft-aware cancellation barriers', () => {
    // Denim Point of No Return is 'CUTTING'
    assert.doesNotThrow(() => assertPrePointOfNoReturn('BOTTOMS', 'QUEUED'));
    assert.throws(() => assertPrePointOfNoReturn('BOTTOMS', 'CUTTING'), ForbiddenError);
    assert.throws(() => assertPrePointOfNoReturn('BOTTOMS', 'SEWING'), ForbiddenError);

    // Jewellery Point of No Return is 'CASTING'
    assert.doesNotThrow(() => assertPrePointOfNoReturn('JEWELLERY', 'QUEUED'));
    assert.throws(() => assertPrePointOfNoReturn('JEWELLERY', 'CASTING'), ForbiddenError);
    assert.throws(() => assertPrePointOfNoReturn('JEWELLERY', 'SETTING'), ForbiddenError);
    assert.throws(() => assertPrePointOfNoReturn('JEWELLERY', 'POLISHING'), ForbiddenError);
  });

  it('CheckMembershipAccessUseCase gates VIP drops to MEMBER and ADMIN only', async () => {
    const useCase = new CheckMembershipAccessUseCase();

    const guestResult = await useCase.execute(null);
    assert.equal(guestResult.isAllowed, false);

    const customerResult = await useCase.execute({ id: 'c1', role: 'CUSTOMER' });
    assert.equal(customerResult.isAllowed, false);

    const memberResult = await useCase.execute({ id: 'm1', role: 'MEMBER' });
    assert.equal(memberResult.isAllowed, true);
    assert.equal(memberResult.isVipMember, true);

    const adminResult = await useCase.execute({ id: 'a1', role: 'ADMIN' });
    assert.equal(adminResult.isAllowed, true);
  });

  it('CustomerProfileUseCase stores dual-craft sizing preferences (denim & jewellery)', async () => {
    const profileRepo = new MockUserProfileRepository();
    const addressRepo = new MockAddressRepository();

    await profileRepo.create({
      id: createEntityId<'UserProfile'>('cust_01'),
      email: 'buyer@jeanius.co',
      fullName: 'Atelier Collector',
      role: 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const useCase = new CustomerProfileUseCase(profileRepo, addressRepo);

    const updated = await useCase.updateProfile('cust_01', {
      denimPreferences: {
        waistInches: 32,
        inseamInches: 34,
        silhouette: 'SLIM_TAPERED',
        hemAllowanceInches: 1.5,
      },
      jewelleryPreferences: {
        ringSizeUs: 'US 10',
        ringMandrelMm: 19.8,
        preferredAlloy: 'STERLING_SILVER_925',
        preferredFinish: 'OXIDIZED_PATINA',
      },
    });

    assert.equal(updated.denimPreferences?.waistInches, 32);
    assert.equal(updated.denimPreferences?.silhouette, 'SLIM_TAPERED');
    assert.equal(updated.jewelleryPreferences?.ringSizeUs, 'US 10');
    assert.equal(updated.jewelleryPreferences?.preferredAlloy, 'STERLING_SILVER_925');
  });

  it('RecordPrivilegedActionUseCase logs administrative mutations into audit trail', async () => {
    const auditRepo = new MockAuditLogRepository();
    const useCase = new RecordPrivilegedActionUseCase(auditRepo);

    const adminActor: Actor = { id: 'adm_01', role: 'ADMIN', email: 'director@jeanius.co' };
    await useCase.execute({
      actor: adminActor,
      action: 'PRECIOUS_METAL_ADJUSTMENT',
      entityType: 'metal_stocks',
      entityId: 'e0000000-0000-0000-0000-000000000001',
      payload: { alloy: 'STERLING_SILVER_925', gramsAdded: 2500 },
      ipAddress: '192.168.1.42',
    });

    assert.equal(auditRepo.records.length, 1);
    assert.equal(auditRepo.records[0]?.actorRole, 'ADMIN');
    assert.equal(auditRepo.records[0]?.action, 'PRECIOUS_METAL_ADJUSTMENT');
  });

  it('ResolveCustomizationDefaultsUseCase resolves studio defaults for authenticated & guest users', async () => {
    const profileRepo = new MockUserProfileRepository();
    await profileRepo.create({
      id: createEntityId<'UserProfile'>('usr_customizer_01'),
      email: 'customizer@jeanius.co',
      fullName: 'Atelier Patron',
      role: 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date(),
      denimPreferences: {
        bottoms: {
          waistInches: 31,
          inseamInches: 33,
          silhouette: 'SLIM_TAPERED',
        },
      },
      jewelleryPreferences: {
        metals: {
          preferredAlloy: 'STERLING_SILVER_925',
          preferredFinish: 'OXIDIZED_PATINA',
        },
      },
    });

    const useCase = new ResolveCustomizationDefaultsUseCase(profileRepo);

    // 1. Authenticated user auto-fill for jeans
    const userDefaults = await useCase.execute('usr_customizer_01', {
      category: 'BOTTOMS',
      subcategory: 'JEANS',
    });
    assert.equal(userDefaults.appliedFromVault, true);
    assert.equal(userDefaults.isComplete, true);
    assert.equal(userDefaults.measurements['waistInches'], 31);
    assert.equal(userDefaults.measurements['inseamInches'], 33);
    assert.equal(userDefaults.measurements['silhouette'], 'SLIM_TAPERED');

    // 2. Guest user fallback
    const guestDefaults = await useCase.execute(null, {
      category: 'BOTTOMS',
      subcategory: 'JEANS',
    });
    assert.equal(guestDefaults.appliedFromVault, false);
    assert.equal(guestDefaults.isComplete, false);
    assert.deepEqual(guestDefaults.missingFields, ['waistInches', 'inseamInches', 'silhouette']);
  });
});
