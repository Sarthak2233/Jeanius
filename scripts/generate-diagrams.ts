import { readdirSync, statSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join, basename, extname } from 'node:path';
import { execSync } from 'node:child_process';

const SRC_DIR = resolve(process.cwd(), 'docs/assets/diagrams/src');
const OUT_DIR = resolve(process.cwd(), 'docs/assets/diagrams');
const CONFIG_PATH = resolve(process.cwd(), 'docs/assets/diagrams/mermaid-config.json');
const CSS_PATH = resolve(process.cwd(), 'docs/assets/diagrams/diagram-styles.css');

/**
 * Validates that the SVG has well-formed XML and no duplicate attributes on any tag.
 */
function validateSvgXml(svgContent: string, fileName: string): void {
  // Check for duplicate attributes in any tag
  const tagRegex = /<([a-zA-Z0-9:-]+)\s+([^>]+)>/g;
  let match;
  while ((match = tagRegex.exec(svgContent)) !== null) {
    const tagName = match[1];
    const attrString = match[2];
    const attrNames = new Set<string>();
    const attrRegex = /([a-zA-Z0-9:-]+)=["']/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrString)) !== null) {
      const name = attrMatch[1];
      if (attrNames.has(name)) {
        throw new Error(
          `XML validation failed in ${fileName}: Duplicate attribute "${name}" in tag <${tagName}>`,
        );
      }
      attrNames.add(name);
    }
  }

  // Cross-check with Python xml.etree.ElementTree if available
  try {
    execSync(
      'python3 -c "import sys, xml.etree.ElementTree as ET; ET.fromstring(sys.stdin.read())"',
      {
        input: svgContent,
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(`Strict XML parse failed in ${fileName}: ${errorMsg}`);
  }
}

/**
 * Post-processes generated Mermaid SVG to ensure self-contained card styling,
 * dark-mode contrast, and clean borders without violating XML well-formedness.
 */
function postProcessSvg(rawSvg: string): string {
  let svg = rawSvg;

  // 1. Upgrade root <svg> container with card styling: rounded corners, border, elevation
  svg = svg.replace(
    /<svg\b([^>]*?)(\bstyle="[^"]*?")([^>]*)>/,
    (_match, prefix, styleAttr, suffix) => {
      let style = styleAttr.slice(7, -1).trim();
      if (!style.endsWith(';')) style += ';';
      if (!style.includes('background-color')) {
        style += ' background-color: #0b0f19;';
      }
      style +=
        ' border-radius: 14px; border: 1px solid #1e293b; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);';
      style = style.replace(/;+/g, ';').trim();
      return `<svg${prefix}style="${style}"${suffix}>`;
    },
  );

  // 1b. Inject explicit background rect covering viewBox so that dark atelier canvas is guaranteed in all viewers
  const vbMatch = svg.match(/\bviewBox="([^"]+)"/);
  if (vbMatch && !svg.includes('id="diagram-canvas-bg"')) {
    const parts = vbMatch[1].trim().split(/\s+/);
    if (parts.length === 4) {
      const [minX, minY, width, height] = parts;
      const bgRect = `<rect id="diagram-canvas-bg" x="${minX}" y="${minY}" width="${width}" height="${height}" fill="#0b0f19" rx="14" ry="14" stroke="#1e293b" stroke-width="1.5" />`;
      svg = svg.replace(/(<svg\b[^>]*>)/, `$1\n  ${bgRect}`);
    }
  }

  // 2. Replace hardcoded light-blue rectangles with atelier dark slate (no duplicate stroke)
  svg = svg.replace(/fill="rgb\(240,\s*245,\s*255\)"/g, 'fill="rgba(30, 41, 59, 0.75)"');

  // 3. Ensure note boxes have dark violet background and clean indigo border
  svg = svg.replace(/fill="#EDF2AE"\s+stroke="#666"/g, 'fill="#1e1b4b" stroke="#818cf8"');
  svg = svg.replace(/fill="#EDF2AE"/g, 'fill="#1e1b4b"');

  // 4. Ensure drop shadows are subtle and dark (avoid duplicate flood-opacity)
  svg = svg.replace(/flood-color="#FFFFFF"/g, 'flood-color="#000000"');
  svg = svg.replace(/flood-opacity="0\.06"/g, 'flood-opacity="0.25"');

  // 5. Replace any remaining default grey actor rect fills (#eaeaea) with dark slate (#1e293b)
  svg = svg.replace(/fill="#eaeaea"\s+stroke="#666"/g, 'fill="#1e293b" stroke="#334155"');
  svg = svg.replace(/fill="#eaeaea"/g, 'fill="#1e293b"');

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
        validateSvgXml(processedSvg, `${name}.svg`);
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
