import zlib from 'node:zlib';
import { createClient } from '@supabase/supabase-js';

// CRC-32 implementation for PNG chunks
function crc32(buf: Buffer): number {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcPayload = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcPayload), 0);
  return Buffer.concat([lenBuf, crcPayload, crcBuf]);
}

interface PixelRenderer {
  (x: number, y: number, width: number, height: number): [number, number, number];
}

function generateAtelierPng(width: number, height: number, renderPixel: PixelRenderer): Buffer {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 2; // RGB color type
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  const rawScanlines = Buffer.alloc(height * (1 + width * 3));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawScanlines[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b] = renderPixel(x, y, width, height);
      rawScanlines[offset++] = Math.max(0, Math.min(255, Math.round(r)));
      rawScanlines[offset++] = Math.max(0, Math.min(255, Math.round(g)));
      rawScanlines[offset++] = Math.max(0, Math.min(255, Math.round(b)));
    }
  }

  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// ---------------------------------------------------------------------------
// 10 Distinct Kathmandu .925 Sterling Silver Pixel Renderers (1:1 Studio Comps)
// ---------------------------------------------------------------------------

// 1. Mandala Signet Ring (Circular signet top with concentric geometric mandala engraving)
function renderMandalaSignetRing(): PixelRenderer {
  return (x, y, width, height) => {
    const cx = width / 2;
    const cy = height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Studio atelier background: dark warm slate gradient
    const bg = 14 + (y / height) * 12;

    if (dist < 180) {
      // Signet face
      const bevel = (180 - dist) / 180;
      const lighting = Math.cos(angle - 0.75) * 45;
      const concentric = Math.sin(dist / 8) * 20;
      const petals = Math.sin(angle * 8) * 25 * (dist > 50 && dist < 140 ? 1 : 0);
      const core = 190 + lighting * bevel + concentric + petals;
      return [core, core + 2, core + 6];
    }
    if (dist >= 180 && dist <= 210) {
      // Beveled silver border ring
      const ringEdge = (dist - 180) / 30;
      const edgeLight = Math.cos(angle - 0.75) * 55;
      const edge = 160 + edgeLight - ringEdge * 40;
      return [edge, edge + 2, edge + 5];
    }
    return [bg, bg + 2, bg + 4];
  };
}

// 2. Vajra Cuff Bracelet (Hand-carved Newar vajra motif terminals on forged silver cuff)
function renderVajraCuff(): PixelRenderer {
  return (x, y, width, height) => {
    const cx = width / 2;
    const cy = height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const r = Math.sqrt(dx * dx + dy * dy * 1.5);
    const angle = Math.atan2(dy * 1.2, dx);

    const bg = 12 + (y / height) * 10;

    // Open oval cuff band (gap at bottom: dy > 80 && Math.abs(dx) < 60)
    const isGap = dy > 60 && Math.abs(dx) < 50;
    if (!isGap && r >= 140 && r <= 200) {
      const bandNorm = (r - 140) / 60;
      const highlight = Math.cos(angle - 0.5) * 60;
      const carves = Math.sin(angle * 16) * 18;
      const silver = 185 + highlight - Math.abs(bandNorm - 0.5) * 40 + carves;
      return [silver, silver + 3, silver + 7];
    }

    // Vajra finials near gap
    if (dy > 45 && dy < 95 && (Math.abs(dx - 55) < 18 || Math.abs(dx + 55) < 18)) {
      return [215, 218, 225];
    }

    return [bg, bg + 1, bg + 3];
  };
}

// 3. Kathmandu Cable Chain (Heavy link interlocking cable necklace)
function renderCableChain(): PixelRenderer {
  return (x, y, width, height) => {
    const bg = 13 + (y / height) * 10;
    // Diagonal chain swath
    const chainAxis = (x + y) * 0.7071;
    const chainCross = (x - y) * 0.7071;

    if (Math.abs(chainCross) < 80) {
      const linkPeriod = (chainAxis % 48) - 24;
      const linkRad = Math.sqrt(linkPeriod * linkPeriod + chainCross * chainCross);
      if (linkRad < 36 && linkRad > 18) {
        const linkLight = Math.sin(chainAxis / 12) * 50 + Math.cos(chainCross / 10) * 40;
        const silver = 175 + linkLight;
        return [silver, silver + 2, silver + 6];
      }
      if (linkRad <= 18) {
        // Deep oxidized hollow between links
        return [22, 24, 28];
      }
    }
    return [bg, bg + 1, bg + 3];
  };
}

// 4. Filigree Drop Earrings (Delicate openwork silver scroll teardrops)
function renderFiligreeEarrings(): PixelRenderer {
  return (x, y, width, height) => {
    const bg = 11 + (y / height) * 10;
    // Two teardrop pendants
    const cx = x < width / 2 ? width * 0.35 : width * 0.65;
    const cy = height * 0.52;
    const dx = x - cx;
    const dy = y - cy;
    const dropDist = Math.sqrt(dx * dx + (dy > 0 ? dy * dy : dy * dy * 2.2));

    if (dropDist < 120) {
      const filigreeMesh =
        (Math.sin(dx / 5) * Math.cos(dy / 5) > 0.2 ? 55 : -40) + Math.sin(dropDist / 8) * 30;
      const edge = dropDist > 105 ? 60 : 0;
      const silver = 170 + filigreeMesh + edge;
      return [silver, silver + 2, silver + 5];
    }
    // French wire hook at top
    if (Math.abs(dx) < 4 && y >= cy - 160 && y < cy - 120) {
      return [210, 214, 222];
    }
    return [bg, bg + 2, bg + 4];
  };
}

// 5. Dragon Claw Pendant (Sculpted talon clutching oxidized stone)
function renderDragonClaw(): PixelRenderer {
  return (x, y, width, height) => {
    const cx = width / 2;
    const cy = height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const bg = 14 + (y / height) * 11;

    // Center polished sphere (black obsidian with silver reflections)
    if (dist < 85) {
      const sphereLight = Math.cos(Math.atan2(dy, dx) - 0.8) * 35;
      const stone = 30 + (85 - dist) * 0.4 + sphereLight;
      return [stone, stone + 1, stone + 2];
    }

    // 4 Curved Talons grasping the sphere
    const angle = Math.atan2(dy, dx);
    const clawBranch = Math.cos(angle * 4);
    if (dist >= 80 && dist <= 175 && clawBranch > 0.6) {
      const talonEdge = Math.sin((dist - 80) / 10) * 30;
      const silver = 195 + clawBranch * 30 + talonEdge;
      return [silver, silver + 3, silver + 8];
    }

    // Top pendant bail loop
    if (Math.abs(dx) < 18 && dy < -160 && dy > -210) {
      return [200, 204, 212];
    }

    return [bg, bg + 1, bg + 3];
  };
}

// 6. Hammered Band Ring (Facets hand-hammered with organic brushed speculars)
function renderHammeredBand(): PixelRenderer {
  return (x, y, width, height) => {
    const cx = width / 2;
    const cy = height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const r = Math.sqrt(dx * dx + dy * dy * 1.8);

    const bg = 12 + (y / height) * 12;

    if (r >= 110 && r <= 170) {
      // Hammered facet simulation using cellular/voronoi noise approximation
      const facetNoise = Math.sin(x / 14) * Math.cos(y / 14) * 45;
      const angle = Math.atan2(dy * 1.4, dx);
      const ringLight = Math.cos(angle - 0.6) * 50;
      const silver = 180 + ringLight + facetNoise;
      return [silver, silver + 2, silver + 6];
    }
    if (r < 110) {
      // Deep inner shadow of ring aperture
      return [18, 20, 24];
    }
    return [bg, bg + 1, bg + 3];
  };
}

// 7. Garuda Crest Pendant (Winged mythical bird talisman with feather engraving)
function renderGarudaCrest(): PixelRenderer {
  return (x, y, width, height) => {
    const cx = width / 2;
    const cy = height * 0.48;
    const dx = Math.abs(x - cx); // Symmetric
    const dy = y - cy;

    const bg = 13 + (y / height) * 10;

    // Wing contours (shield/crest shape)
    const crestBound = 160 - (dy * dy) / 280;
    if (dx < crestBound && dy > -120 && dy < 150) {
      const feathers = Math.sin((dx + dy) / 8) * 35;
      const layerLight = (1 - dx / 160) * 50;
      const silver = 175 + feathers + layerLight;
      return [silver, silver + 2, silver + 6];
    }
    return [bg, bg + 2, bg + 4];
  };
}

// 8. Lotus Bloom Earrings (Petal layers radiating outward from center)
function renderLotusBloom(): PixelRenderer {
  return (x, y, width, height) => {
    const cx = x < width / 2 ? width * 0.35 : width * 0.65;
    const cy = height * 0.52;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const bg = 11 + (y / height) * 10;

    if (dist < 110) {
      const petals = Math.sin(angle * 8) * 35;
      const center = dist < 25 ? -30 : 0;
      const silver = 190 + petals + center - dist * 0.3;
      return [silver, silver + 2, silver + 5];
    }
    // Top French wire
    if (Math.abs(dx) < 3 && y >= cy - 150 && y < cy - 110) {
      return [205, 208, 215];
    }
    return [bg, bg + 1, bg + 3];
  };
}

// 9. Curb Link Bracelet (Flat-beveled heavy curb links in mirror polish)
function renderCurbBracelet(): PixelRenderer {
  return (x, y, width, height) => {
    const cx = width / 2;
    const cy = height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const r = Math.sqrt(dx * dx * 1.1 + dy * dy * 1.3);

    const bg = 12 + (y / height) * 10;

    if (r >= 130 && r <= 195) {
      const angle = Math.atan2(dy * 1.15, dx);
      // Alternating beveled flat facets
      const facet = Math.sin(angle * 24) > 0 ? 50 : -45;
      const baseLight = Math.cos(angle - 0.7) * 40;
      const silver = 180 + facet + baseLight;
      return [silver, silver + 3, silver + 8];
    }
    return [bg, bg + 2, bg + 4];
  };
}

// 10. Nepal Arch Keyring (Torana architectural arch amulet in heavy sterling silver)
function renderNepalArch(): PixelRenderer {
  return (x, y, width, height) => {
    const cx = width / 2;
    const cy = height * 0.46;
    const dx = Math.abs(x - cx);
    const dy = y - cy;

    const bg = 14 + (y / height) * 10;

    // Torana Arch profile: semi-circle top (dy <= 0), straight pillars below (dy > 0)
    let inArch = false;
    let archEdge = 0;
    if (dy <= 0) {
      const r = Math.sqrt(dx * dx + dy * dy);
      if (r >= 90 && r <= 150) {
        inArch = true;
        archEdge = Math.cos(Math.atan2(dy, dx) - 0.8) * 45;
      }
    } else if (dy > 0 && dy < 140) {
      if (dx >= 90 && dx <= 150) {
        inArch = true;
        archEdge = (1 - (dx - 90) / 60) * 40;
      }
    }

    if (inArch) {
      const carvedRelief = Math.sin((dx + dy) / 9) * 28;
      const silver = 185 + archEdge + carvedRelief;
      return [silver, silver + 2, silver + 7];
    }

    // Heavy split-ring loop at bottom
    if (dy >= 140 && dy <= 220) {
      const ringDy = dy - 180;
      const ringR = Math.sqrt(dx * dx + ringDy * ringDy);
      if (ringR >= 30 && ringR <= 48) {
        return [205, 208, 216];
      }
    }

    return [bg, bg + 1, bg + 3];
  };
}

interface ProductMediaConfig {
  slug: string;
  category: string;
  width: number;
  height: number;
  renderer: PixelRenderer;
}

const PRODUCTS_MEDIA: ProductMediaConfig[] = [
  // --- Canonical Database Slugs (Project 925 DB Seed) ---
  {
    slug: 'lot-r01-vajra-signet-ring',
    category: 'Rings',
    width: 600,
    height: 600,
    renderer: renderMandalaSignetRing(),
  },
  {
    slug: 'lot-r02-naga-bone-band',
    category: 'Rings',
    width: 600,
    height: 600,
    renderer: renderHammeredBand(),
  },
  {
    slug: 'lot-r03-patina-skull-band',
    category: 'Rings',
    width: 600,
    height: 600,
    renderer: renderDragonClaw(),
  },
  {
    slug: 'lot-c01-garuda-heavy-cuff',
    category: 'Cuffs & Bracelets',
    width: 600,
    height: 600,
    renderer: renderVajraCuff(),
  },
  {
    slug: 'lot-c02-hammered-torque-cuff',
    category: 'Cuffs & Bracelets',
    width: 600,
    height: 600,
    renderer: renderCurbBracelet(),
  },
  {
    slug: 'lot-n01-dorje-amulet-pendant',
    category: 'Pendants & Amulets',
    width: 600,
    height: 600,
    renderer: renderGarudaCrest(),
  },
  {
    slug: 'lot-n02-lotus-seal-medallion',
    category: 'Pendants & Amulets',
    width: 600,
    height: 600,
    renderer: renderNepalArch(),
  },
  {
    slug: 'lot-e01-architectural-silver-hoops',
    category: 'Earrings',
    width: 600,
    height: 600,
    renderer: renderFiligreeEarrings(),
  },
  {
    slug: 'lot-ch01-heavy-anchor-chain',
    category: 'Chains & Necklaces',
    width: 600,
    height: 600,
    renderer: renderCableChain(),
  },
  {
    slug: 'lot-a01-ritual-silver-chalice',
    category: 'Objects & Hardware',
    width: 600,
    height: 600,
    renderer: renderLotusBloom(),
  },
];

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

  console.log(`\n======================================================`);
  console.log(`PROJECT 925 — CLEAN SINGLE-MEDIA SEED PIPELINE`);
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Bucket: product-media`);
  console.log(`======================================================\n`);

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 1. Ensure bucket exists and is public
  const { data: buckets } = await supabase.storage.listBuckets();
  const hasMediaBucket = buckets?.some((b) => b.id === 'product-media');
  if (!hasMediaBucket) {
    console.log('Creating public bucket "product-media"...');
    await supabase.storage.createBucket('product-media', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    });
  }

  // 2. Clean out old / obsolete / redundant files from object storage
  const canonicalSlugs = new Set(PRODUCTS_MEDIA.map((p) => p.slug));
  console.log(
    'Cleaning object storage to retain strictly the required 10 canonical products with 1 primary image each...',
  );
  const { data: existingFolders } = await supabase.storage.from('product-media').list('products');
  for (const folder of existingFolders || []) {
    const { data: folderFiles } = await supabase.storage
      .from('product-media')
      .list(`products/${folder.name}`);

    if (!canonicalSlugs.has(folder.name)) {
      // Purge obsolete / previous folders entirely
      const obsoleteFiles = (folderFiles || []).map((f) => `products/${folder.name}/${f.name}`);
      if (obsoleteFiles.length > 0) {
        console.log(`  Purging obsolete folder products/${folder.name}:`, obsoleteFiles);
        await supabase.storage.from('product-media').remove(obsoleteFiles);
      }
    } else {
      // For canonical folders, ensure only primary.png is kept
      const redundantFiles: string[] = [];
      for (const f of folderFiles || []) {
        if (f.name !== 'primary.png') {
          redundantFiles.push(`products/${folder.name}/${f.name}`);
        }
      }
      if (redundantFiles.length > 0) {
        console.log(`  Removing redundant files in products/${folder.name}:`, redundantFiles);
        await supabase.storage.from('product-media').remove(redundantFiles);
      }
    }
  }

  // 3. Upload exactly ONE distinct primary image per product
  let totalUploaded = 0;
  for (const item of PRODUCTS_MEDIA) {
    console.log(`Rendering distinct single primary image for [${item.category}] ${item.slug}...`);
    const pngBuffer = generateAtelierPng(item.width, item.height, item.renderer);
    const filePath = `products/${item.slug}/primary.png`;

    const { error: uploadErr } = await supabase.storage
      .from('product-media')
      .upload(filePath, pngBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadErr) {
      console.error(`  ✗ Failed upload for ${item.slug}:`, uploadErr.message);
    } else {
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/product-media/${filePath}`;
      console.log(`  ✓ Uploaded single primary image (${pngBuffer.length} bytes): ${publicUrl}`);
      totalUploaded++;
    }
  }

  console.log(
    `\n✓ Successfully seeded ${totalUploaded} single, distinct primary product media assets into Supabase Object Storage.\n`,
  );
}

main().catch((err) => {
  console.error('Fatal media seed error:', err);
  process.exit(1);
});
