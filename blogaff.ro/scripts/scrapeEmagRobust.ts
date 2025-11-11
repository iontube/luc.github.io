import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script robust pentru extragerea subcategoriilor de pe fiecare pagină eMAG
 */

const MAIN_CATEGORIES = [
  { name: 'Telefoane & Tablete', url: 'https://www.emag.ro/telefoane-tablete/c' },
  { name: 'Laptopuri & IT', url: 'https://www.emag.ro/laptopuri-it/c' },
  { name: 'TV & Audio-Video', url: 'https://www.emag.ro/tv-audio-video/c' },
  { name: 'Gaming', url: 'https://www.emag.ro/gaming/c' },
  { name: 'Electrocasnice Mari', url: 'https://www.emag.ro/electrocasnice-mari/c' },
  { name: 'Electrocasnice Mici', url: 'https://www.emag.ro/electrocasnice-mici/c' },
  { name: 'Climatizare & Încălzire', url: 'https://www.emag.ro/climatizare-incalzire/c' },
  { name: 'Îngrijire Personală', url: 'https://www.emag.ro/ingrijire-personala/c' },
  { name: 'Casă & Grădină', url: 'https://www.emag.ro/casa-si-gradina/c' },
  { name: 'Mobilă', url: 'https://www.emag.ro/mobila/c' },
  { name: 'Auto-Moto', url: 'https://www.emag.ro/auto-moto/c' },
  { name: 'Jucării & Copii', url: 'https://www.emag.ro/jucarii-copii/c' },
  { name: 'Sport & Outdoor', url: 'https://www.emag.ro/sport-outdoor/c' },
];

async function scrapeSubcategories(url: string, categoryName: string): Promise<{ name: string; url: string }[]> {
  console.log(`\n📂 ${categoryName}`);
  console.log(`   Scraping: ${url}`);

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ro-RO,ro;q=0.9',
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const subcategories: { name: string; url: string }[] = [];
    const seen = new Set<string>();

    // Salvează HTML pentru debugging
    const debugPath = path.join(process.cwd(), `debug-${categoryName.replace(/[^a-z0-9]/gi, '-')}.html`);
    fs.writeFileSync(debugPath, response.data);
    console.log(`   💾 HTML salvat pentru debugging: ${debugPath}`);

    // Caută toate link-urile care ar putea fi subcategorii
    $('a').each((i, elem) => {
      const href = $(elem).attr('href') || '';
      const text = $(elem).text().trim();

      // Filtrare: URL-uri care conțin /c și nu sunt categoria principală
      if (href.includes('/c') && text.length > 2 && text.length < 100) {
        const fullUrl = href.startsWith('http') ? href : `https://www.emag.ro${href}`;

        // Exclude linkuri de navigare, filtre, etc.
        if (!href.includes('black-friday') &&
            !href.includes('cmp/') &&
            !href.includes('?') &&
            !href.includes('#') &&
            fullUrl !== url &&
            !seen.has(fullUrl)) {

          seen.add(fullUrl);
          subcategories.push({
            name: text,
            url: fullUrl
          });
        }
      }
    });

    console.log(`   ✅ Găsite ${subcategories.length} subcategorii`);

    // Afișează primele 10
    if (subcategories.length > 0) {
      console.log(`   Primele 10:`);
      subcategories.slice(0, 10).forEach((sub, idx) => {
        console.log(`      ${idx + 1}. ${sub.name}`);
      });
      if (subcategories.length > 10) {
        console.log(`      ... și încă ${subcategories.length - 10}`);
      }
    }

    return subcategories;

  } catch (error: any) {
    console.error(`   ❌ Eroare: ${error.message}`);
    return [];
  }
}

async function main() {
  console.log('🚀 SCRAPING COMPLET CATEGORII eMAG\n');
  console.log('═'.repeat(80));

  const results: any[] = [];

  for (let i = 0; i < MAIN_CATEGORIES.length; i++) {
    const category = MAIN_CATEGORIES[i];

    const subcategories = await scrapeSubcategories(category.url, category.name);

    results.push({
      name: category.name,
      url: category.url,
      subcategories
    });

    // Pauză între request-uri
    if (i < MAIN_CATEGORIES.length - 1) {
      console.log('\n   ⏳ Pauză 4s...');
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
  }

  // Salvează rezultatele
  const outputPath = path.join(process.cwd(), 'data', 'emag-scraped-full.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');

  console.log('\n' + '═'.repeat(80));
  console.log(`\n✅ Salvat în: ${outputPath}\n`);

  // Statistici
  const totalSubs = results.reduce((sum, cat) => sum + cat.subcategories.length, 0);
  console.log(`📊 Total categorii: ${results.length}`);
  console.log(`📊 Total subcategorii: ${totalSubs}`);
  console.log(`📊 Medie: ${(totalSubs / results.length).toFixed(1)} subcategorii/categorie\n`);

  // Top categorii
  console.log('📈 Top 5 categorii cu cele mai multe subcategorii:\n');
  const sorted = [...results].sort((a, b) => b.subcategories.length - a.subcategories.length);
  sorted.slice(0, 5).forEach((cat, idx) => {
    console.log(`   ${idx + 1}. ${cat.name}: ${cat.subcategories.length} subcategorii`);
  });

  console.log('\n💡 Verifică fișierele debug-*.html pentru a vedea HTML-ul paginilor');
  console.log('💡 Apoi poți crea manual maparea keywords pentru subcategoriile relevante\n');
}

main().catch(console.error);
