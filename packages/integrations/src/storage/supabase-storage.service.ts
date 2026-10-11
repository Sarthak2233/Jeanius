import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface StorageUploadOptions {
  readonly contentType: string;
  readonly upsert?: boolean;
}

export class SupabaseStorageService {
  private readonly client: SupabaseClient;
  private readonly supabaseUrl: string;

  constructor(customClient?: SupabaseClient) {
    this.supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'http://localhost:54321';

    if (customClient) {
      this.client = customClient;
    } else {
      const key =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        'eyJhY2Nlc3NfdG9rZW4iOiJsb2NhbC1hbm9uLWtleSJ9';
      this.client = createClient(this.supabaseUrl, key);
    }
  }

  getPublicUrl(path: string, bucket: string = 'product-media'): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const { data } = this.client.storage.from(bucket).getPublicUrl(cleanPath);
    return data.publicUrl;
  }

  async uploadMedia(
    path: string,
    fileData: Buffer | Uint8Array,
    options: StorageUploadOptions,
    bucket: string = 'product-media',
  ): Promise<{ readonly url: string; readonly path: string }> {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    const { error } = await this.client.storage.from(bucket).upload(cleanPath, fileData, {
      contentType: options.contentType,
      upsert: options.upsert ?? true,
    });

    if (error) {
      throw new Error(
        `Failed to upload media to Supabase storage [${bucket}/${cleanPath}]: ${error.message}`,
      );
    }

    const publicUrl = this.getPublicUrl(cleanPath, bucket);
    return { url: publicUrl, path: cleanPath };
  }

  async listMedia(
    prefix: string = '',
    bucket: string = 'product-media',
  ): Promise<readonly { readonly name: string; readonly id: string | null }[]> {
    const { data, error } = await this.client.storage.from(bucket).list(prefix);
    if (error) {
      throw new Error(
        `Failed to list media from Supabase storage [${bucket}/${prefix}]: ${error.message}`,
      );
    }
    return data ?? [];
  }
}
