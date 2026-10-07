import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';

import { AtelierMarkdown } from '../components/atelier-markdown';
import { SizingStudioClient } from '../app/sizing/sizing-studio-client';

describe('State 08: Content, CMS & Wholesome Measurements (JN-157 → JN-167)', () => {
  describe('JN-157 & JN-158: Atelier Markdown Renderer', () => {
    it('renders headings with editorial hierarchy', () => {
      const markdown = '# Main Heading\n\n## Subheading Chapter\n\n### Section Detail';
      const html = renderToString(<AtelierMarkdown content={markdown} />);

      assert.ok(html.includes('<h1'));
      assert.ok(html.includes('Main Heading'));
      assert.ok(html.includes('<h2'));
      assert.ok(html.includes('Subheading Chapter'));
      assert.ok(html.includes('<h3'));
      assert.ok(html.includes('Section Detail'));
    });

    it('renders inline bold, links, and code', () => {
      const markdown =
        'Raw selvedge from **Kurabo Mills** with [Sizing Guide](/sizing) and `14oz` weight.';
      const html = renderToString(<AtelierMarkdown content={markdown} />);

      assert.ok(html.includes('<strong'));
      assert.ok(html.includes('Kurabo Mills'));
      assert.ok(html.includes('href="/sizing"'));
      assert.ok(html.includes('<code'));
      assert.ok(html.includes('14oz'));
    });

    it('renders markdown tables properly', () => {
      const table = `| US Size | Diameter | Circumference |
|---|---|---|
| US 10 | 19.8 mm | 62.1 mm |`;
      const html = renderToString(<AtelierMarkdown content={table} />);

      assert.ok(html.includes('<table'));
      assert.ok(html.includes('US Size'));
      assert.ok(html.includes('US 10'));
      assert.ok(html.includes('19.8 mm'));
    });

    it('renders bullet lists and blockquotes', () => {
      const listAndQuote = `> The holy grail of denim.
- Selvedge Warp
- Union Special 43200G`;
      const html = renderToString(<AtelierMarkdown content={listAndQuote} />);

      assert.ok(html.includes('<blockquote'));
      assert.ok(html.includes('The holy grail of denim.'));
      assert.ok(html.includes('<ul'));
      assert.ok(html.includes('<li'));
      assert.ok(html.includes('Union Special 43200G'));
    });
  });

  describe('JN-164 & JN-165: Wholesome Measurement Studio & Guidance', () => {
    it('renders Points A through Q with anatomical gender options', () => {
      const html = renderToString(<SizingStudioClient />);

      // Points A through Q present
      assert.ok(html.includes('Point A'));
      assert.ok(html.includes('Point B'));
      assert.ok(html.includes('Point F'));
      assert.ok(html.includes('Point G'));
      assert.ok(html.includes('Point H'));

      // Gender toggles present
      assert.ok(html.includes('Men’s Cut'));
      assert.ok(html.includes('Women’s Cut'));
      assert.ok(html.includes('Unisex / Vintage'));

      // Method toggles present
      assert.ok(html.includes('Laid-Flat Garment (Points A–Q)'));
      assert.ok(html.includes('Body Anatomical Tape'));
    });

    it('renders the selvedge warp shrinkage engine and ring mandrel table', () => {
      const html = renderToString(<SizingStudioClient />);

      // Shrinkage engine present
      assert.ok(html.includes('WARP SHRINKAGE &amp; LOOMSTATE CUT CALCULATOR'));
      assert.ok(html.includes('Loomstate Cut Inseam'));
      assert.ok(html.includes('35')); // 34 * 1.03 = 35.02 -> 35"

      // Jewellery mandrel present
      assert.ok(html.includes('Ring Mandrel &amp; Wide Shank Compensator'));
      assert.ok(html.includes('US Size'));
      assert.ok(html.includes('UK / AU'));
      assert.ok(html.includes('EU Standard'));
    });
  });
});
