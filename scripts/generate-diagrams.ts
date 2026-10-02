import { readdirSync, statSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join, basename, extname } from 'node:path';
import { execSync } from 'node:child_process';

const SRC_DIR = resolve(process.cwd(), 'docs/assets/diagrams/src');
const OUT_DIR = resolve(process.cwd(), 'docs/assets/diagrams');
const CONFIG_PATH = resolve(process.cwd(), 'docs/assets/diagrams/mermaid-config.json');
const CSS_PATH = resolve(process.cwd(), 'docs/assets/diagrams/diagram-styles.css');

/**
 * Post-processes generated Mermaid SVG to ensure self-contained card styling,
 * dark-mode contrast, and clean borders.
 */
function postProcessSvg(rawSvg: string): string {
  let svg = rawSvg;

  // 1. Upgrade root <svg> container with card styling: rounded corners, border, elevation
  svg = svg.replace(
    /<svg\b([^>]*?)(\bstyle="[^"]*?")([^>]*)>/,
    (_match, prefix, styleAttr, suffix) => {
      let style = styleAttr.slice(7, -1);
      // Ensure background is #0b0f19
      if (!style.includes('background-color')) {
        style += '; background-color: #0b0f19;';
      }
      style +=
        '; border-radius: 14px; border: 1px solid #1e293b; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);';
      return `<svg${prefix}style="${style}"${suffix}>`;
    },
  );

  // 2. Replace hardcoded light-blue rectangles (e.g. rect rgb(240, 245, 255)) with atelier dark slate
  svg = svg.replace(
    /fill="rgb\(240,\s*245,\s*255\)"/g,
    'fill="rgba(30, 41, 59, 0.75)" stroke="#3b82f6"',
  );

  // 3. Ensure all text inside notes has high-contrast text
  svg = svg.replace(/fill="#EDF2AE"/g, 'fill="#1e1b4b" stroke="#818cf8"');

  // 4. Ensure drop shadows are subtle and dark instead of white/light
  svg = svg.replace(/flood-color="#FFFFFF"/g, 'flood-color="#000000" flood-opacity="0.3"');

  // 5. Replace any remaining default grey actor rect fills (#eaeaea) with dark slate (#1e293b)
  svg = svg.replace(/<rect\b([^>]*?)fill="#eaeaea"([^>]*?)>/g, '<rect$1fill="#1e293b"$2>');

  return svg;
}

function generateDiagrams(): void {
  console.log('=== Jeanius & Jewl Central Diagram Generator ===\n');

  if (!existsSync(SRC_DIR)) {
    console.error(`Source directory not found: ${SRC_DIR}`);
    process.exit(1);
  }

  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  const files = readdirSync(SRC_DIR).filter((f) => extname(f) === '.mmd');

  if (files.length === 0) {
    console.warn(`No .mmd files found in ${SRC_DIR}`);
    return;
  }

  console.log(`Found ${files.length} diagram definitions in ${SRC_DIR}:\n`);

  const results: { file: string; svg: string; size: string; status: 'SUCCESS' | 'FAILED' }[] = [];

  for (const file of files) {
    const name = basename(file, '.mmd');
    const inputPath = join(SRC_DIR, file);
    const outputPath = join(OUT_DIR, `${name}.svg`);

    process.stdout.write(`Compiling ${file} -> ${name}.svg ... `);

    try {
      execSync(
        `npx -y @mermaid-js/mermaid-cli -i "${inputPath}" -o "${outputPath}" -c "${CONFIG_PATH}" -C "${CSS_PATH}" -b "#0b0f19" --quiet`,
        { stdio: 'pipe' },
      );

      if (existsSync(outputPath)) {
        // Read, post-process, and rewrite
        const rawSvg = readFileSync(outputPath, 'utf8');
        const processedSvg = postProcessSvg(rawSvg);
        writeFileSync(outputPath, processedSvg, 'utf8');

        const stats = statSync(outputPath);
        const sizeKb = (stats.size / 1024).toFixed(1) + ' KB';
        console.log(`✓ (${sizeKb})`);
        results.push({ file, svg: `${name}.svg`, size: sizeKb, status: 'SUCCESS' });
      } else {
        console.log('✗ (File not created)');
        results.push({ file, svg: `${name}.svg`, size: '0 KB', status: 'FAILED' });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.log(`✗ Error: ${errorMsg}`);
      results.push({ file, svg: `${name}.svg`, size: '0 KB', status: 'FAILED' });
    }
  }

  console.log('\n--- Summary Table ---');
  console.table(results);

  const failedCount = results.filter((r) => r.status === 'FAILED').length;
  if (failedCount > 0) {
    console.error(`\nFailed to compile ${failedCount} diagram(s).`);
    process.exit(1);
  } else {
    console.log(`\nAll ${results.length} diagrams compiled successfully into ${OUT_DIR}!`);
  }
}

generateDiagrams();
