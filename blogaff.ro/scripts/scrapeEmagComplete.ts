import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script complet pentru extragerea TUTUROR categoriilor și subcategoriilor eMAG
 */

interface EmagCategory {
  name: string;
  url: string;
  subcategories: {
    name: string;
    url: string;
  }[];
}

// Categorii principale cunoscute pe eMAG
const MAIN_CATEGORIES = [
  { name: 'Telefoane & Tablete', url: 'https://www.emag.ro/telefoane-tablete/c' },
  { name: 'Laptopuri & IT', url: 'https://www.emag.ro/laptopuri-it/c' },
  { name: 'TV & Audio-Video', url: 'https://www.emag.ro/tv-audio-video/c' },
  { name: 'Gaming', url: 'https://www.emag.ro/gaming/c' },
  { name: 'Electrocasnice Mari', url: 'https://www.emag.ro/electrocasnice-mari/c' },
  { name: 'Electrocasnice Mici', url: 'https://www.emag.ro/electrocasnice-mici/c' },
  { name: 'Climatizare & Încălzire', url: 'https://www.emag.ro/climatizare-incalzire/c' },
  { name: 'Îngrijire Personală', url: 'https://www.emag.ro/ingrijire-personala/c' },
  { name: 'Casa, Gradina & Bricolaj', url: 'https://www.emag.ro/casa-si-gradina/c' },
  { name: 'Mobilă', url: 'https://www.emag.ro/mobila/c' },
  { name: 'Auto-Moto', url: 'https://www.emag.ro/auto-moto/c' },
  { name: 'Jucării & Copii', url: 'https://www.emag.ro/jucarii-copii/c' },
  { name: 'Sport & Outdoor', url: 'https://www.emag.ro/sport-outdoor/c' },
  { name: 'Modă & Frumusețe', url: 'https://www.emag.ro/moda/c' },
];

async function scrapeSubcategories(categoryUrl: string, categoryName: string): Promise<{ name: string; url: string }[]> {
  console.log(`\n📂 Extrag subcategorii din: ${categoryName}`);
  console.log(`   URL: ${categoryUrl}`);

  try {
    const response = await axios.get(categoryUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const subcategories: { name: string; url: string }[] = [];
    const seen = new Set<string>();

    // Mai multe selectori pentru subcategorii
    const selectors = [
      '.sidebar-category a',
      '.category-sidebar a',
      '.filter-category a',
      'a[href*="/c"]',
      '.subcategory-link',
      '.category-list a'
    ];

    for (const selector of selectors) {
      $(selector).each((i, elem) => {
        const href = $(elem).attr('href') || '';
        const text = $(elem).text().trim();

        // Filtrare: trebuie să conțină /c și să nu fie categoria principală
        if (href && href.includes('/c') && text && text.length > 2) {
          const fullUrl = href.startsWith('http') ? href : `https://www.emag.ro${href}`;

          // Exclude categoria principală și campanii
          if (!fullUrl.includes('black-friday') &&
              !fullUrl.includes('cmp/') &&
              fullUrl !== categoryUrl &&
              !seen.has(fullUrl)) {

            seen.add(fullUrl);
            subcategories.push({
              name: text,
              url: fullUrl
            });
          }
        }
      });

      if (subcategories.length > 0) break;
    }

    // Caută și în JSON-uri din pagină
    if (subcategories.length === 0) {
      $('script').each((i, elem) => {
        const content = $(elem).html() || '';

        // Caută pattern-uri JSON cu categorii
        const jsonMatches = content.match(/\{[^{}]*"categories?"[^{}]*\}/g);
        if (jsonMatches) {
          jsonMatches.forEach(match => {
            try {
              const data = JSON.parse(match);
              if (data.categories && Array.isArray(data.categories)) {
                data.categories.forEach((cat: any) => {
                  if (cat.name && cat.url) {
                    subcategories.push({
                      name: cat.name,
                      url: cat.url
                    });
                  }
                });
              }
            } catch (e) {
              // Ignore
            }
          });
        }
      });
    }

    console.log(`   ✅ ${subcategories.length} subcategorii găsite`);

    // Afișează primele 3 pentru verificare
    if (subcategories.length > 0) {
      subcategories.slice(0, 3).forEach(sub => {
        console.log(`      - ${sub.name}`);
      });
      if (subcategories.length > 3) {
        console.log(`      ... și încă ${subcategories.length - 3}`);
      }
    }

    return subcategories;

  } catch (error: any) {
    console.error(`   ❌ Eroare: ${error.message}`);
    return [];
  }
}

async function main() {
  console.log('🚀 EXTRAGERE COMPLETĂ CATEGORII eMAG\n');
  console.log('═'.repeat(80));
  console.log(`\n📋 ${MAIN_CATEGORIES.length} categorii principale de procesat\n`);

  const results: EmagCategory[] = [];

  for (let i = 0; i < MAIN_CATEGORIES.length; i++) {
    const category = MAIN_CATEGORIES[i];

    console.log(`\n[${i + 1}/${MAIN_CATEGORIES.length}] ${category.name}`);

    const subcategories = await scrapeSubcategories(category.url, category.name);

    results.push({
      name: category.name,
      url: category.url,
      subcategories
    });

    // Pauză între request-uri
    if (i < MAIN_CATEGORIES.length - 1) {
      console.log('   ⏳ Pauză 3s...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Salvează rezultatele
  const outputPath = path.join(process.cwd(), 'data', 'emag-complete-categories.json');

  // Asigură-te că directorul există
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');

  console.log('\n' + '═'.repeat(80));
  console.log('\n✨ FINALIZAT!\n');
  console.log(`💾 Salvat în: ${outputPath}\n`);
  console.log('📊 Statistici:');
  console.log(`   - Categorii principale: ${results.length}`);

  const totalSubs = results.reduce((sum, cat) => sum + cat.subcategories.length, 0);
  console.log(`   - Total subcategorii: ${totalSubs}`);
  console.log(`   - Medie subcategorii/categorie: ${(totalSubs / results.length).toFixed(1)}\n`);

  // Afișează un rezumat
  console.log('📈 Top 5 categorii cu cele mai multe subcategorii:\n');
  const sorted = [...results].sort((a, b) => b.subcategories.length - a.subcategories.length);
  sorted.slice(0, 5).forEach((cat, idx) => {
    console.log(`   ${idx + 1}. ${cat.name}: ${cat.subcategories.length} subcategorii`);
  });

  console.log('\n');
}

main().catch(console.error);
