import { readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, join, basename, extname } from 'node:path';
import { execSync } from 'node:child_process';

const SRC_DIR = resolve(process.cwd(), 'docs/assets/diagrams/src');
const OUT_DIR = resolve(process.cwd(), 'docs/assets/diagrams');

function generateDiagrams(): void {
  console.log('=== Jeanius Central Diagram Generator ===\n');

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
        `npx -y @mermaid-js/mermaid-cli -i "${inputPath}" -o "${outputPath}" -b transparent -t neutral --quiet`,
        { stdio: 'pipe' }
      );

      if (existsSync(outputPath)) {
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
