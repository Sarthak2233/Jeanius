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
// 12 Distinct Pixel Renderers (1 unique visual per product)
// ---------------------------------------------------------------------------

// 1. Lot 001 — Straight Selvedge Raw Denim (Classic Deep Indigo, Red Ticker)
function renderLot001(): PixelRenderer {
  return (x, y, width, height) => {
    const twill = (x + y * 2) % 6 < 3 ? 10 : -10;
    const gradient = (y / height) * 16;
    let r = 18 + twill + gradient * 0.3;
    let g = 28 + twill + gradient * 0.5;
    let b = 52 + twill + gradient * 1.1;

    // Red Selvedge ID ticker on right edge
    const selvedgeX = width - Math.floor(width * 0.08);
    if (x >= selvedgeX - 16 && x <= selvedgeX + 16) {
      if (Math.abs(x - selvedgeX) <= 2) {
        r = 220;
        g = 38;
        b = 38; // Red ticker
      } else {
        r = 245;
        g = 240;
        b = 225; // Ecru tape
      }
    }
    return [r, g, b];
  };
}

// 2. Lot 002 — Slim Tapered Deep Indigo (Midnight Indigo, Pink Selvedge ID)
function renderLot002(): PixelRenderer {
  return (x, y, width, height) => {
    const twill = (x * 2 + y) % 5 < 2 ? 8 : -8;
    const gradient = (y / height) * 12;
    let r = 10 + twill + gradient * 0.2;
    let g = 16 + twill + gradient * 0.4;
    let b = 36 + twill + gradient * 0.8;

    // Vintage pink ticker on right edge
    const selvedgeX = width - Math.floor(width * 0.08);
    if (x >= selvedgeX - 16 && x <= selvedgeX + 16) {
      if (Math.abs(x - selvedgeX) <= 2) {
        r = 236;
        g = 72;
        b = 153; // Vintage pink ticker
      } else {
        r = 240;
        g = 238;
        b = 230;
      }
    }
    return [r, g, b];
  };
}

// 3. Lot 003 — Natural Indigo Deadstock Straight (Greenish-Cast Natural Indigo)
function renderLot003(): PixelRenderer {
  return (x, y, width, height) => {
    const twill = (x + y) % 4 < 2 ? 14 : -14;
    const gradient = (y / height) * 20;
    let r = 24 + twill + gradient * 0.4;
    let g = 48 + twill + gradient * 0.8;
    let b = 58 + twill + gradient * 0.9;

    // Green ticker selvedge
    const selvedgeX = width - Math.floor(width * 0.08);
    if (x >= selvedgeX - 16 && x <= selvedgeX + 16) {
      if (Math.abs(x - selvedgeX) <= 2) {
        r = 34;
        g = 197;
        b = 94; // Green ticker
      } else {
        r = 245;
        g = 242;
        b = 220;
      }
    }
    return [r, g, b];
  };
}

// 4. Lot 000 — Archive First Edition Selvedge (Faded Vintage Wash, Gold Chainstitch)
function renderLot000(): PixelRenderer {
  return (x, y, width, height) => {
    const twill = (x + y * 2) % 6 < 3 ? 12 : -12;
    // Faded honeycombs across mid-section
    const fade = Math.sin(y / 40) * Math.cos(x / 50) * 25;
    let r = 50 + twill + fade;
    let g = 75 + twill + fade;
    let b = 115 + twill + fade * 1.2;

    // Gold chainstitch hem at bottom
    if (y > height - 30 && y < height - 24 && x % 12 < 8) {
      r = 234;
      g = 179;
      b = 8;
    }
    return [r, g, b];
  };
}

// 5. Lot T01 — Type II Selvedge Denim Jacket (Front Knife Pleats & Donut Buttons)
function renderLotT01(): PixelRenderer {
  return (x, y, width, height) => {
    // Midnight dark canvas
    const cx = width / 2;
    let r = 20;
    let g = 30;
    let b = 55;

    // Jacket torso box
    if (x > 80 && x < width - 80 && y > 100 && y < height - 80) {
      r = 28;
      g = 42;
      b = 76;
      // Front knife pleat lines
      if (Math.abs(x - (cx - 70)) < 3 || Math.abs(x - (cx + 70)) < 3) {
        r = 15;
        g = 20;
        b = 35; // shadow crease
      }
      // Center placket line
      if (Math.abs(x - cx) < 2) {
        r = 234;
        g = 179;
        b = 8; // golden stitch
      }
      // Metal donut buttons down the center placket
      for (const btnY of [180, 280, 380, 480, 580]) {
        const dBtn = Math.sqrt((x - cx) ** 2 + (y - btnY) ** 2);
        if (dBtn < 14) {
          r = 217;
          g = 119;
          b = 6; // brass button
          if (dBtn < 5) {
            r = 15;
            g = 20;
            b = 35;
          } // donut hole
        }
      }
    }
    return [r, g, b];
  };
}

// 6. Lot T02 — Western Selvedge Chambray Overshirt (Indigo Chambray, Pearl Snaps)
function renderLotT02(): PixelRenderer {
  return (x, y, width, height) => {
    // Crosshatch chambray weave
    const weave = (x % 3 === 0 ? 15 : 0) + (y % 3 === 0 ? 15 : 0) - 10;
    const cx = width / 2;
    let r = 38 + weave;
    let g = 60 + weave;
    let b = 95 + weave;

    // Western pointed yoke line
    const yokeY = 160 + Math.abs(x - cx) * 0.25;
    if (Math.abs(y - yokeY) < 2 && x > 90 && x < width - 90) {
      r = 230;
      g = 220;
      b = 200; // cream double-needle stitch
    }

    // Mother of pearl snaps down front
    if (Math.abs(x - cx) < 10) {
      for (const btnY of [220, 320, 420, 520, 620]) {
        const dSnap = Math.sqrt((x - cx) ** 2 + (y - btnY) ** 2);
        if (dSnap < 11) {
          r = 240;
          g = 242;
          b = 245; // pearlescent white
        }
      }
    }
    return [r, g, b];
  };
}

// 7. Lot J01 — .925 Sterling Silver Signet Ring (Hand-Chiseled Crest)
function renderLotJ01(): PixelRenderer {
  return (x, y, width, height) => {
    const cx = width / 2;
    const cy = height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = width * 0.28;

    if (dist < radius) {
      const angle = Math.atan2(dy, dx);
      const highlight = Math.cos(angle * 2 - 0.8);
      const intensity = 195 + highlight * 50;
      // Crest emblem in center
      if (Math.abs(dx) < 30 && Math.abs(dy) < 30 && (Math.abs(dx) < 6 || Math.abs(dy) < 6)) {
        return [70, 75, 85]; // Dark chiseled cross crest
      }
      return [intensity, intensity, intensity + 8];
    }
    if (dist < radius + 6) return [120, 130, 145];
    return [10, 14, 20];
  };
}

// 8. Lot J02 — Hand-Forged Solid Brass Cuff (Raw Patina Open Cuff)
function renderLotJ02(): PixelRenderer {
  return (x, y, width, height) => {
    const cx = width / 2;
    const cy = height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = width * 0.32;

    // Horseshoe / open cuff shape (gap at top)
    const isGap = dy < -width * 0.15 && Math.abs(dx) < width * 0.18;
    if (!isGap && dist < radius && dist > radius - 38) {
      // Hammered texture
      const texture = (Math.sin(x / 8) * Math.cos(y / 8) + 1) * 20;
      const highlight = (x / width) * 35;
      return [210 + highlight - texture * 0.3, 155 + highlight - texture * 0.4, 40 + texture * 0.2];
    }
    return [12, 16, 22];
  };
}

// 9. Lot J03 — Heavy Curb Denim Wallet Chain (Interlocking Silver Curb Links)
function renderLotJ03(): PixelRenderer {
  return (x, y, width, height) => {
    const cx = width / 2;
    const cy = height / 2;
    // Chain links diagonal across frame
    const distToDiagonal = Math.abs(x - cx - (y - cy)) / Math.SQRT2;
    const alongDiagonal = (x - cx + (y - cy)) / Math.SQRT2;

    if (distToDiagonal < 42 && Math.abs(alongDiagonal) < width * 0.42) {
      const linkIndex = Math.floor(alongDiagonal / 36);
      const inLink = alongDiagonal - linkIndex * 36 - 18;
      const linkDist = Math.sqrt(distToDiagonal ** 2 + inLink ** 2);
      if (linkDist < 24 && linkDist > 8) {
        const shine = Math.cos(alongDiagonal / 15) * 40;
        return [190 + shine, 195 + shine, 205 + shine];
      }
    }
    return [11, 14, 21];
  };
}

// 10. Lot J04 — Carved Obsidian Sterling Ring (Jet Black Obsidian Gem)
function renderLotJ04(): PixelRenderer {
  return (x, y, width, height) => {
    const cx = width / 2;
    const cy = height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Inner jet-black faceted obsidian stone
    if (dist < width * 0.18) {
      const facet = Math.sin(dx / 12) * Math.cos(dy / 12) * 20;
      return [20 + facet, 20 + facet, 24 + facet]; // Obsidian reflection
    }
    // Sterling silver bezel bezel mount
    if (dist < width * 0.28) {
      const rim = Math.cos(Math.atan2(dy, dx) * 4) * 30;
      return [180 + rim, 185 + rim, 195 + rim];
    }
    return [10, 13, 18];
  };
}

// 11. Lot A01 — Tochigi Bridle Leather Belt (Cognac Saddle Leather & Brass Buckle)
function renderLotA01(): PixelRenderer {
  return (x, y, width, height) => {
    const beltTop = height * 0.36;
    const beltBottom = height * 0.64;
    const cx = width / 2;

    // Brass buckle on left
    const inBuckle = x < 150 && y > beltTop - 12 && y < beltBottom + 12;
    if (inBuckle) {
      const buckleEdge = x < 40 || x > 130 || y < beltTop - 2 || y > beltBottom + 2;
      if (buckleEdge) {
        return [217, 160, 45]; // Solid brass
      }
    }

    if (y >= beltTop && y <= beltBottom && x >= 130) {
      const noise = ((x * 19 + y * 37) % 19) - 9;
      let r = 145 + noise;
      let g = 82 + noise * 0.6;
      let b = 28 + noise * 0.4;
      // Waxed linen edge stitching
      if (Math.abs(y - (beltTop + 8)) <= 2 || Math.abs(y - (beltBottom - 8)) <= 2) {
        if (x % 14 < 9) {
          r = 245;
          g = 240;
          b = 220;
        }
      }
      return [r, g, b];
    }
    return [14, 17, 23];
  };
}

// 12. Lot A02 — Solid Silver Bandana Slide (Cylindrical Engraved Silver Slide)
function renderLotA02(): PixelRenderer {
  return (x, y, width, height) => {
    const cx = width / 2;
    const cy = height / 2;
    const dx = x - cx;
    const dy = y - cy;

    // Vertical cylinder slide
    if (Math.abs(dx) < 70 && Math.abs(dy) < 140) {
      const cylinderLight = Math.cos((dx / 70) * (Math.PI / 2)) * 60;
      const filigree = Math.sin(dy / 8) * Math.cos(dx / 8) > 0.3 ? -40 : 0;
      const base = 180 + cylinderLight + filigree;
      return [base, base + 2, base + 8];
    }
    return [12, 15, 20];
  };
}

interface ProductMediaConfig {
  slug: string;
  category: 'BOTTOMS' | 'TOPS' | 'JEWELLERY' | 'ACCESSORIES';
  width: number;
  height: number;
  renderer: PixelRenderer;
}

const PRODUCTS_MEDIA: ProductMediaConfig[] = [
  // BOTTOMS (4:5 aspect ratio, 600x750)
  {
    slug: 'lot-001-straight-selvedge',
    category: 'BOTTOMS',
    width: 600,
    height: 750,
    renderer: renderLot001(),
  },
  {
    slug: 'lot-002-slim-tapered-deep-indigo',
    category: 'BOTTOMS',
    width: 600,
    height: 750,
    renderer: renderLot002(),
  },
  {
    slug: 'lot-003-natural-indigo-deadstock-straight',
    category: 'BOTTOMS',
    width: 600,
    height: 750,
    renderer: renderLot003(),
  },
  {
    slug: 'lot-000-archive-first-edition-selvedge',
    category: 'BOTTOMS',
    width: 600,
    height: 750,
    renderer: renderLot000(),
  },

  // TOPS (4:5 aspect ratio, 600x750)
  {
    slug: 'lot-t01-type2-selvedge-jacket',
    category: 'TOPS',
    width: 600,
    height: 750,
    renderer: renderLotT01(),
  },
  {
    slug: 'lot-t02-western-selvedge-overshirt',
    category: 'TOPS',
    width: 600,
    height: 750,
    renderer: renderLotT02(),
  },

  // JEWELLERY (1:1 aspect ratio, 600x600)
  {
    slug: 'lot-j01-sterling-signet-ring',
    category: 'JEWELLERY',
    width: 600,
    height: 600,
    renderer: renderLotJ01(),
  },
  {
    slug: 'lot-j02-forged-brass-cuff',
    category: 'JEWELLERY',
    width: 600,
    height: 600,
    renderer: renderLotJ02(),
  },
  {
    slug: 'lot-j03-curb-denim-wallet-chain',
    category: 'JEWELLERY',
    width: 600,
    height: 600,
    renderer: renderLotJ03(),
  },
  {
    slug: 'lot-j04-obsidian-carved-signet',
    category: 'JEWELLERY',
    width: 600,
    height: 600,
    renderer: renderLotJ04(),
  },

  // ACCESSORIES (1:1 aspect ratio, 600x600)
  {
    slug: 'lot-a01-bridle-leather-selvedge-belt',
    category: 'ACCESSORIES',
    width: 600,
    height: 600,
    renderer: renderLotA01(),
  },
  {
    slug: 'lot-a02-solid-silver-bandana-slide',
    category: 'ACCESSORIES',
    width: 600,
    height: 600,
    renderer: renderLotA02(),
  },
];

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

  console.log(`\n======================================================`);
  console.log(`JEANIUS ATELIER — CLEAN SINGLE-MEDIA SEED PIPELINE`);
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

  // 2. Clean out old / repeated / detail images from object storage
  console.log(
    'Cleaning existing files in bucket so strictly ONE single primary image remains per product...',
  );
  const { data: existingFolders } = await supabase.storage.from('product-media').list('products');
  for (const folder of existingFolders || []) {
    const { data: folderFiles } = await supabase.storage
      .from('product-media')
      .list(`products/${folder.name}`);
    const filesToDelete: string[] = [];
    for (const f of folderFiles || []) {
      if (f.name !== 'primary.png') {
        filesToDelete.push(`products/${folder.name}/${f.name}`);
      }
    }
    if (filesToDelete.length > 0) {
      console.log(`  Removing redundant files in products/${folder.name}:`, filesToDelete);
      await supabase.storage.from('product-media').remove(filesToDelete);
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
