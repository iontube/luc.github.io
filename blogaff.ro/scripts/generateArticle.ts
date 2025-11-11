import * as fs from 'fs';
import * as path from 'path';
import { initializeGemini, generateArticle } from '../src/utils/gemini';
import type { Keyword, Category, Article } from '../src/types/article';

// Încarcă variabilele de mediu
import * as dotenv from 'dotenv';
dotenv.config();

// Verifică dacă există API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ EROARE: GEMINI_API_KEY nu este setat în fișierul .env');
  console.error('Creează un fișier .env și adaugă: GEMINI_API_KEY=your_api_key');
  console.error('Obține o cheie gratuită de la: https://makersuite.google.com/app/apikey');
  process.exit(1);
}

// Inițializează Gemini
initializeGemini(apiKey);

// Funcție pentru a citi cuvintele cheie dintr-un fișier
function readKeywords(filePath: string): Keyword[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Eroare la citirea fișierului ${filePath}:`, error);
    process.exit(1);
  }
}

// Funcție pentru a salva articolul generat
function saveArticle(article: Article, outputDir: string) {
  const fileName = `${article.slug}.json`;
  const filePath = path.join(outputDir, fileName);

  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(article, null, 2), 'utf-8');
    console.log(`✅ Articol salvat: ${filePath}`);
  } catch (error) {
    console.error(`❌ Eroare la salvarea articolului:`, error);
  }
}

// Funcție principală
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
📝 Generator de Articole cu Gemini AI

UTILIZARE:
  npm run generate-article <keywords-file> <output-directory>

EXEMPLU:
  npm run generate-article ./data/keywords.json ./generated-articles

FORMAT FIȘIER KEYWORDS:
[
  {
    "keyword": "cele mai bune smartphone-uri 2025",
    "category": "smartphone",
    "tags": ["smartphone", "review", "2025"]
  }
]
    `);
    process.exit(1);
  }

  const [keywordsFile, outputDir] = args;

  console.log('🚀 Începe generarea articolelor...\n');

  // Citește cuvintele cheie
  const keywords = readKeywords(keywordsFile);
  console.log(`📋 ${keywords.length} cuvinte cheie găsite\n`);

  // Categoriile disponibile (ar trebui să le imporți din src/data/sampleData.ts)
  const categories: Record<string, Category> = {
    smartphone: {
      id: '1',
      name: 'Smartphone',
      slug: 'smartphone'
    },
    laptopuri: {
      id: '2',
      name: 'Laptopuri',
      slug: 'laptopuri'
    },
    accesorii: {
      id: '3',
      name: 'Accesorii',
      slug: 'accesorii'
    },
    audio: {
      id: '4',
      name: 'Audio',
      slug: 'audio'
    }
  };

  // Generează articole pentru fiecare keyword
  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    console.log(`[${i + 1}/${keywords.length}] Generare articol: "${keyword.keyword}"`);

    try {
      const category = categories[keyword.category];
      if (!category) {
        console.error(`⚠️  Categorie necunoscută: ${keyword.category}, skip...`);
        continue;
      }

      const articleData = await generateArticle(keyword, category);

      const article: Article = {
        id: `generated-${Date.now()}-${i}`,
        title: articleData.title || '',
        slug: articleData.slug || '',
        description: articleData.description || '',
        content: articleData.content || '',
        category: articleData.category || category,
        tags: articleData.tags || keyword.tags,
        readingTime: articleData.readingTime,
        publishedAt: new Date(),
        affiliateLinks: articleData.affiliateLinks
      };

      saveArticle(article, outputDir);

      // Pauză între requesturi pentru a nu depăși rate limit-ul
      if (i < keywords.length - 1) {
        console.log('⏳ Pauză 5 secunde...\n');
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (error: any) {
      console.error(`❌ Eroare la generarea articolului "${keyword.keyword}":`, error.message);
    }
  }

  console.log('\n✨ Generare completă!');
}

main();
