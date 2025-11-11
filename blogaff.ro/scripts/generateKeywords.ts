import * as fs from 'fs';
import * as path from 'path';

interface CategoryWithSubtags {
  id: string;
  name: string;
  url: string;
  subtags: string[];
  isPlural: boolean;
  hasArticle: boolean;
  articleSlug?: string;
}

interface Keyword {
  id: string;
  keyword: string;
  categoryId: string;
  categoryName: string;
  categoryUrl: string;        // Link direct către categorie: https://www.emag.ro/categorie/c
  searchUrl: string;           // Link search: https://www.emag.ro/search/keyword
  subtag: string;
}

/**
 * Generează keywords pentru toate categoriile
 */
function generateKeywords(): Keyword[] {
  console.log('🔄 Generez keywords din categorii cu subtag-uri...\n');

  // Citește categoriile cu subtag-uri
  const inputPath = path.join(process.cwd(), 'data', 'emag-categories-with-subtags.json');

  if (!fs.existsSync(inputPath)) {
    console.error('❌ Fișierul emag-categories-with-subtags.json nu există!');
    console.log('💡 Rulează mai întâi: npm run generate-subtags\n');
    process.exit(1);
  }

  const categories: CategoryWithSubtags[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  console.log(`📊 Găsite ${categories.length} categorii cu subtag-uri\n`);

  const keywords: Keyword[] = [];
  let keywordIndex = 0;

  for (const category of categories) {
    const prefix = category.isPlural ? 'cele mai bune' : 'cel mai bun';
    const categoryLower = category.name.toLowerCase();

    // Generează 5 keywords: 1 principal + 4 cu subtag-uri

    // 1. Keyword principal cu "2025"
    const keyword2025 = `${prefix} ${categoryLower} 2025`;
    keywords.push({
      id: `kw-${keywordIndex++}`,
      keyword: keyword2025,
      categoryId: category.id,
      categoryName: category.name,
      categoryUrl: category.url,  // https://www.emag.ro/categorie/c
      searchUrl: `https://www.emag.ro/search/${encodeURIComponent(keyword2025)}`,  // https://www.emag.ro/search/...
      subtag: '2025'
    });

    // 2-5. Keywords cu subtag-uri (primele 4 subtag-uri)
    const subtagsToUse = category.subtags.slice(0, 4);

    for (const subtag of subtagsToUse) {
      const fullKeyword = `${prefix} ${categoryLower} ${subtag}`;
      keywords.push({
        id: `kw-${keywordIndex++}`,
        keyword: fullKeyword,
        categoryId: category.id,
        categoryName: category.name,
        categoryUrl: category.url,
        searchUrl: `https://www.emag.ro/search/${encodeURIComponent(fullKeyword)}`,
        subtag: subtag
      });
    }
  }

  return keywords;
}

/**
 * Grupează keywords pe categorii pentru vizualizare
 */
function groupKeywordsByCategory(keywords: Keyword[]): Record<string, Keyword[]> {
  const grouped: Record<string, Keyword[]> = {};

  for (const kw of keywords) {
    if (!grouped[kw.categoryId]) {
      grouped[kw.categoryId] = [];
    }
    grouped[kw.categoryId].push(kw);
  }

  return grouped;
}

async function main() {
  console.log('🚀 START - Generare keywords pentru articole eMAG\n');
  console.log('═'.repeat(80));

  const keywords = generateKeywords();
  const grouped = groupKeywordsByCategory(keywords);

  console.log(`✅ Generat ${keywords.length} keywords total`);
  console.log(`📁 Pentru ${Object.keys(grouped).length} categorii\n`);

  // Afișează exemple
  console.log('📋 Exemple de keywords generate:\n');
  const exampleCategories = Object.keys(grouped).slice(0, 3);

  for (const catId of exampleCategories) {
    const catKeywords = grouped[catId];
    console.log(`\n📦 ${catKeywords[0].categoryName}:`);
    catKeywords.forEach((kw, idx) => {
      console.log(`   ${idx + 1}. "${kw.keyword}"`);
    });
  }

  // Salvează keywords individual
  const keywordsPath = path.join(process.cwd(), 'data', 'emag-keywords.json');
  fs.writeFileSync(keywordsPath, JSON.stringify(keywords, null, 2), 'utf-8');

  // Salvează keywords grupate pe categorii
  const groupedPath = path.join(process.cwd(), 'data', 'emag-keywords-grouped.json');
  fs.writeFileSync(groupedPath, JSON.stringify(grouped, null, 2), 'utf-8');

  // Generează CSV pentru referință
  const csvPath = path.join(process.cwd(), 'data', 'emag-keywords.csv');
  const csvLines = [
    'ID,Cuvânt cheie,Categorie,Subtag,URL eMAG,URL Search'
  ];

  keywords.forEach(kw => {
    csvLines.push(
      `"${kw.id}","${kw.keyword}","${kw.categoryName}","${kw.subtag}","${kw.categoryUrl}","${kw.searchUrl}"`
    );
  });

  fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf-8');

  // Statistici
  console.log('\n═'.repeat(80));
  console.log(`\n📊 STATISTICI:`);
  console.log(`   Total keywords: ${keywords.length}`);
  console.log(`   Categorii: ${Object.keys(grouped).length}`);
  console.log(`   Keywords/categorie: 5`);
  console.log(`   Articole de generat: ${keywords.length}`);

  // Verificare limită Cloudflare
  const totalFiles = keywords.length + 500; // +500 pentru assets
  const cloudflareLimit = 20000;
  const usage = ((totalFiles / cloudflareLimit) * 100).toFixed(1);

  console.log(`\n☁️  CLOUDFLARE PAGES:`);
  console.log(`   Fișiere estimate: ${totalFiles}`);
  console.log(`   Limită: ${cloudflareLimit}`);
  console.log(`   Utilizare: ${usage}%`);

  if (totalFiles < cloudflareLimit) {
    console.log(`   Status: ✅ SUB LIMITĂ`);
  } else {
    console.log(`   Status: ⚠️  PESTE LIMITĂ!`);
  }

  console.log(`\n💾 Fișiere salvate:`);
  console.log(`   ${keywordsPath}`);
  console.log(`   ${groupedPath}`);
  console.log(`   ${csvPath}`);

  console.log(`\n💡 Next: npm run generate-keyword-articles\n`);
  console.log('✨ DONE!\n');
}

main().catch(console.error);
