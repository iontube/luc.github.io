import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

/**
 * Script pentru gestionarea linkurilor de afiliere eMAG
 */

const AFFILIATE_MAP_PATH = path.join(process.cwd(), 'data', 'emag-affiliate-map.json');

interface AffiliateSubcategory {
  name: string;
  description: string;
  affiliateUrl: string;
  keywords: string[];
}

interface AffiliateCategoryMap {
  [category: string]: {
    [subcategory: string]: AffiliateSubcategory;
  };
}

// Încarcă maparea
function loadAffiliateMap(): AffiliateCategoryMap {
  const content = fs.readFileSync(AFFILIATE_MAP_PATH, 'utf-8');
  return JSON.parse(content);
}

// Salvează maparea
function saveAffiliateMap(map: AffiliateCategoryMap) {
  fs.writeFileSync(AFFILIATE_MAP_PATH, JSON.stringify(map, null, 2), 'utf-8');
  console.log('✅ Salvat cu succes!');
}

// Afișează toate subcategoriile
function listAllSubcategories() {
  const map = loadAffiliateMap();

  console.log('\n📋 TOATE SUBCATEGORIILE eMAG\n');
  console.log('═'.repeat(80));

  let total = 0;
  let completed = 0;

  Object.entries(map).forEach(([category, subcategories]) => {
    console.log(`\n📁 ${category.toUpperCase()}`);

    Object.entries(subcategories).forEach(([subKey, subData]) => {
      total++;
      const hasUrl = subData.affiliateUrl && subData.affiliateUrl.length > 0;
      if (hasUrl) completed++;

      const status = hasUrl ? '✅' : '❌';
      console.log(`  ${status} ${subData.name}`);
      console.log(`     Descriere: ${subData.description}`);
      console.log(`     Keywords: ${subData.keywords.join(', ')}`);
      if (hasUrl) {
        console.log(`     Link: ${subData.affiliateUrl}`);
      }
      console.log('');
    });
  });

  console.log('═'.repeat(80));
  console.log(`\nProgres: ${completed}/${total} linkuri completate (${Math.round(completed/total*100)}%)\n`);
}

// Găsește subcategoria potrivită pentru un keyword
function findMatchingSubcategory(keyword: string): { category: string; subcategory: string; data: AffiliateSubcategory } | null {
  const map = loadAffiliateMap();
  const lowerKeyword = keyword.toLowerCase();

  for (const [category, subcategories] of Object.entries(map)) {
    for (const [subKey, subData] of Object.entries(subcategories)) {
      // Verifică dacă keyword-ul conține vreunul din keywords
      for (const kw of subData.keywords) {
        if (lowerKeyword.includes(kw.toLowerCase())) {
          return { category, subcategory: subKey, data: subData };
        }
      }
    }
  }

  return null;
}

// Adaugă link de afiliere
async function addAffiliateLink() {
  const map = loadAffiliateMap();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
  };

  console.log('\n🔗 ADĂUGARE LINK AFILIERE\n');

  // Afișează categoriile
  const categories = Object.keys(map);
  console.log('Categorii disponibile:');
  categories.forEach((cat, idx) => {
    console.log(`${idx + 1}. ${cat}`);
  });

  const catIndex = parseInt(await question('\nAlege categoria (număr): ')) - 1;
  const selectedCategory = categories[catIndex];

  if (!selectedCategory) {
    console.log('❌ Categorie invalidă!');
    rl.close();
    return;
  }

  // Afișează subcategoriile
  const subcategories = Object.entries(map[selectedCategory]);
  console.log(`\nSubcategorii din ${selectedCategory}:`);
  subcategories.forEach(([key, data], idx) => {
    const status = data.affiliateUrl ? '✅' : '❌';
    console.log(`${idx + 1}. ${status} ${data.name} - ${data.description}`);
  });

  const subIndex = parseInt(await question('\nAlege subcategoria (număr): ')) - 1;
  const [selectedSubKey, selectedSubData] = subcategories[subIndex];

  if (!selectedSubData) {
    console.log('❌ Subcategorie invalidă!');
    rl.close();
    return;
  }

  console.log(`\n📝 ${selectedSubData.name}`);
  console.log(`Keywords: ${selectedSubData.keywords.join(', ')}`);
  if (selectedSubData.affiliateUrl) {
    console.log(`Link actual: ${selectedSubData.affiliateUrl}`);
  }

  const newUrl = await question('\n🔗 Introdu linkul de afiliere eMAG: ');

  if (newUrl.trim()) {
    map[selectedCategory][selectedSubKey].affiliateUrl = newUrl.trim();
    saveAffiliateMap(map);
    console.log('✅ Link adăugat cu succes!');
  } else {
    console.log('❌ Link gol, anulat.');
  }

  rl.close();
}

// Testare matching
async function testMatching() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
  };

  const keyword = await question('\n🔍 Introdu un keyword pentru testare: ');

  const match = findMatchingSubcategory(keyword);

  if (match) {
    console.log('\n✅ GĂSIT!');
    console.log(`Categorie: ${match.category}`);
    console.log(`Subcategorie: ${match.data.name}`);
    console.log(`Link afiliere: ${match.data.affiliateUrl || 'LIPSĂ'}`);
  } else {
    console.log('\n❌ Nu s-a găsit nicio subcategorie potrivită pentru acest keyword.');
  }

  rl.close();
}

// Main menu
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'list':
      listAllSubcategories();
      break;
    case 'add':
      await addAffiliateLink();
      break;
    case 'test':
      await testMatching();
      break;
    default:
      console.log('\n📋 COMENZI DISPONIBILE:\n');
      console.log('  npm run affiliate-links list  - Afișează toate subcategoriile');
      console.log('  npm run affiliate-links add   - Adaugă link de afiliere');
      console.log('  npm run affiliate-links test  - Testează matching pentru un keyword');
      console.log('');
  }
}

main().catch(console.error);
