import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script pentru extragerea categoriilor și subcategoriilor de pe eMAG
 */

interface EmagCategory {
  name: string;
  url: string;
  subcategories: {
    name: string;
    url: string;
  }[];
}

async function scrapeEmagCategories(): Promise<EmagCategory[]> {
  console.log('🔍 Încep extragerea categoriilor permanente de pe eMAG...\n');

  try {
    // Fetch homepage eMAG
    const response = await axios.get('https://www.emag.ro/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const categories: EmagCategory[] = [];

    console.log('📋 Categorii găsite:\n');

    // Căutăm în meniul principal - mai multe variante
    const menuItems = $('nav a, .navbar a, .megamenu a, a[href*="/c/"]');

    const seen = new Set<string>();

    menuItems.each((i, elem) => {
      const href = $(elem).attr('href') || '';
      const text = $(elem).text().trim();

      // Filtrează doar categoriile permanente /c/
      if (href.includes('/c') && !href.includes('black-friday') && !href.includes('cmp') && text.length > 2) {
        const fullUrl = href.startsWith('http') ? href : `https://www.emag.ro${href}`;

        // Evită duplicate
        if (!seen.has(fullUrl) && text) {
          seen.add(fullUrl);

          // Verifică dacă e categorie principală (URL scurt gen /electrocasnice/c sau /laptopuri/c)
          const match = href.match(/^\/([^\/]+)\/c\/?$/);
          if (match) {
            console.log(`  📁 ${text}`);
            categories.push({
              name: text,
              url: fullUrl,
              subcategories: []
            });
          }
        }
      }
    });

    if (categories.length === 0) {
      console.log('⚠️  Nu am putut găsi categorii permanente cu selectorii predefiniti.');
      console.log('💡 Încerc să extrag din structura JSON...\n');

      // Fallback: caută în toate script-urile JSON
      const scripts = $('script[type="application/json"]');
      scripts.each((i, elem) => {
        const content = $(elem).html();
        if (content && content.includes('menu') && content.includes('categories')) {
          try {
            const data = JSON.parse(content);
            console.log('✅ Găsit date JSON cu meniu');

            // Explorează structura
            if (data.menu && Array.isArray(data.menu)) {
              data.menu.forEach((item: any) => {
                if (item.name && item.url && !item.url.includes('black-friday')) {
                  console.log(`  📁 ${item.name}`);
                  categories.push({
                    name: item.name,
                    url: item.url,
                    subcategories: item.children || []
                  });
                }
              });
            }
          } catch (e) {
            // Ignoră JSON invalid
          }
        }
      });
    }

    // Dacă tot nu avem categorii, salvăm HTML-ul
    if (categories.length === 0) {
      console.log('📝 Salvez HTML-ul paginii pentru analiză manuală...');
      fs.writeFileSync(
        path.join(process.cwd(), 'emag-debug.html'),
        response.data,
        'utf-8'
      );
      console.log('💾 Salvat în: emag-debug.html');
    }

    return categories;

  } catch (error) {
    console.error('❌ Eroare la scraping:', error);
    return [];
  }
}

// Extrage subcategorii dintr-o pagină de categorie
async function scrapeSubcategories(categoryUrl: string): Promise<{ name: string; url: string }[]> {
  try {
    const response = await axios.get(categoryUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const subcategories: { name: string; url: string }[] = [];

    // Căutăm subcategoriile
    const subSelectors = [
      '.sidebar-category-list a',
      '.category-sidebar a',
      '.filter-category a'
    ];

    for (const selector of subSelectors) {
      const links = $(selector);

      if (links.length > 0) {
        links.each((i, elem) => {
          const name = $(elem).text().trim();
          const url = $(elem).attr('href') || '';

          if (name && url) {
            subcategories.push({
              name,
              url: url.startsWith('http') ? url : `https://www.emag.ro${url}`
            });
          }
        });

        if (subcategories.length > 0) break;
      }
    }

    return subcategories;

  } catch (error) {
    console.error(`❌ Eroare la extragerea subcategoriilor pentru ${categoryUrl}:`, error);
    return [];
  }
}

async function main() {
  console.log('🚀 START - Extragere structură categorii eMAG\n');
  console.log('═'.repeat(80));

  const categories = await scrapeEmagCategories();

  if (categories.length === 0) {
    console.log('\n⚠️  Nu s-au putut extrage categorii automat.');
    console.log('💡 Verifică fișierul emag-debug.html și identifică selectorii CSS corecți.');
    return;
  }

  console.log(`\n✅ ${categories.length} categorii principale extrase\n`);

  // Opțional: Extrage și subcategorii (poate dura mai mult)
  const extractSubcategories = process.argv.includes('--with-subcategories');

  if (extractSubcategories) {
    console.log('📂 Extrag subcategoriile...\n');

    for (let i = 0; i < Math.min(categories.length, 5); i++) {
      const category = categories[i];
      console.log(`  Procesez: ${category.name}...`);

      category.subcategories = await scrapeSubcategories(category.url);
      console.log(`    → ${category.subcategories.length} subcategorii găsite`);

      // Delay pentru a nu suprasolicita serverul
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Salvează rezultatele
  const outputPath = path.join(process.cwd(), 'data', 'emag-categories-scraped.json');
  fs.writeFileSync(outputPath, JSON.stringify(categories, null, 2), 'utf-8');

  console.log('\n═'.repeat(80));
  console.log(`\n💾 Salvat în: ${outputPath}`);
  console.log(`\n📊 Total categorii: ${categories.length}`);

  if (extractSubcategories) {
    const totalSubs = categories.reduce((sum, cat) => sum + cat.subcategories.length, 0);
    console.log(`📊 Total subcategorii: ${totalSubs}`);
  }

  console.log('\n✨ DONE!\n');
}

main().catch(console.error);
