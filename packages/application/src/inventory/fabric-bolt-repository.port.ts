import type { FabricBolt } from '@jeanius/domain';

export interface IFabricBoltRepository {
  findById(id: string): Promise<FabricBolt | null>;
  findByCode(code: string): Promise<FabricBolt | null>;
  listActive(): Promise<readonly FabricBolt[]>;
  save(bolt: FabricBolt): Promise<void>;
}
