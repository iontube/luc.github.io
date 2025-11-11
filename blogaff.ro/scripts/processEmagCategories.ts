import * as fs from 'fs';
import * as path from 'path';

/**
 * Script pentru procesarea categoriilor eMAG din CSV
 * Convertește URL-urile în categorii structurate pentru generare articole
 */

interface EmagCategory {
  id: string;           // slug-ul categoriei (ex: accesorii-drone)
  name: string;         // numele formatat (ex: Accesorii Drone)
  url: string;          // URL-ul original eMAG
  hasArticle: boolean;  // dacă are articol generat
  articleSlug?: string; // slug-ul articolului dacă există
}

/**
 * Convertește slug-ul în nume citibil
 * Ex: "accesorii-drone" → "Accesorii Drone"
 */
function slugToName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extrage ID-ul categoriei din URL
 * Ex: "https://www.emag.ro/accesorii-drone/c" → "accesorii-drone"
 */
function extractCategoryId(url: string): string {
  const match = url.match(/\/([^\/]+)\/c\/?$/);
  return match ? match[1] : '';
}

async function processCategories() {
  console.log('🔄 Procesez categoriile eMAG din CSV...\n');

  // Citește CSV-ul
  const csvPath = path.join(process.cwd(), 'emag_category_links.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  // Parse CSV (skipăm header-ul)
  const lines = csvContent.split('\n').slice(1).filter(line => line.trim());

  console.log(`📊 Găsite ${lines.length} categorii în CSV\n`);

  const categories: EmagCategory[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const url = line.trim();
    if (!url || !url.includes('/c')) continue;

    const id = extractCategoryId(url);
    if (!id || seen.has(id)) continue;

    seen.add(id);

    const category: EmagCategory = {
      id,
      name: slugToName(id),
      url,
      hasArticle: false
    };

    categories.push(category);
  }

  console.log(`✅ Procesate ${categories.length} categorii unice\n`);

  // Salvează rezultatul
  const outputPath = path.join(process.cwd(), 'data', 'emag-categories.json');

  // Creează directorul dacă nu există
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(categories, null, 2), 'utf-8');

  console.log(`💾 Salvat în: ${outputPath}`);
  console.log(`\n📋 Exemple de categorii procesate:`);

  // Afișează primele 10 categorii
  categories.slice(0, 10).forEach(cat => {
    console.log(`  • ${cat.name} → ${cat.url}`);
  });

  console.log(`\n✨ Total categorii: ${categories.length}`);
  console.log(`\n💡 Next: Rulează npm run generate-category-articles pentru a genera articole\n`);
}

processCategories().catch(console.error);
