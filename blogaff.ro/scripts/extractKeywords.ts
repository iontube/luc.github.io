import * as fs from 'fs';
import * as path from 'path';
import type { Keyword } from '../src/types/article';

/**
 * Script pentru extragerea și procesarea cuvintelor cheie din diverse surse
 * Suportă: CSV, TXT, JSON
 */

interface KeywordInput {
  keyword: string;
  category?: string;
  searchVolume?: number;
}

// Mapare categorii implicite bazate pe cuvinte cheie
const categoryMapping: Record<string, string[]> = {
  smartphone: ['telefon', 'smartphone', 'iphone', 'samsung', 'android'],
  laptopuri: ['laptop', 'notebook', 'macbook', 'ultrabook', 'chromebook'],
  audio: ['căști', 'casti', 'boxe', 'speaker', 'audio', 'headphone'],
  accesorii: ['accesorii', 'carcasă', 'husa', 'încărcător', 'cablu']
};

// Funcție pentru a detecta categoria din keyword
function detectCategory(keyword: string): string {
  const lowerKeyword = keyword.toLowerCase();

  for (const [category, terms] of Object.entries(categoryMapping)) {
    if (terms.some((term) => lowerKeyword.includes(term))) {
      return category;
    }
  }

  return 'general'; // Categorie implicită
}

// Funcție pentru a genera tag-uri relevante din keyword
function generateTags(keyword: string): string[] {
  const words = keyword.toLowerCase().split(/\s+/);
  const stopWords = ['cel', 'cea', 'cele', 'mai', 'bun', 'buna', 'bune', 'si', 'și', 'sau', 'pentru', 'din', 'la', 'cu', 'de', 'in', 'în'];

  // Filtrează stop words și păstrează cuvinte relevante
  const tags = words
    .filter((word) => !stopWords.includes(word) && word.length > 2)
    .filter((word, index, self) => self.indexOf(word) === index); // Elimină duplicate

  return tags.slice(0, 5); // Max 5 tag-uri
}

// Parsare fișier CSV
function parseCSV(content: string): KeywordInput[] {
  const lines = content.split('\n').filter((line) => line.trim());
  const keywords: KeywordInput[] = [];

  // Presupunem că prima linie este header: keyword,volume sau similar
  const hasHeader = lines[0].toLowerCase().includes('keyword');
  const startIndex = hasHeader ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));

    if (parts[0]) {
      keywords.push({
        keyword: parts[0],
        searchVolume: parts[1] ? parseInt(parts[1]) : undefined
      });
    }
  }

  return keywords;
}

// Parsare fișier TXT (un keyword per linie)
function parseTXT(content: string): KeywordInput[] {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((keyword) => ({ keyword }));
}

// Procesare keywords și conversia în format complet
function processKeywords(inputs: KeywordInput[]): Keyword[] {
  return inputs.map((input) => {
    const category = input.category || detectCategory(input.keyword);
    const tags = generateTags(input.keyword);

    return {
      keyword: input.keyword,
      category,
      tags,
      searchVolume: input.searchVolume
    };
  });
}

// Funcție principală
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
🔑 Extractor de Cuvinte Cheie

UTILIZARE:
  npm run extract-keywords <input-file> <output-file>

FORMATE SUPORTATE:
  - CSV: keyword,volume (cu sau fără header)
  - TXT: un keyword per linie
  - JSON: [{keyword, category?, searchVolume?}]

EXEMPLE:
  npm run extract-keywords ./data/keywords.csv ./data/keywords.json
  npm run extract-keywords ./data/keywords.txt ./data/keywords.json

OUTPUT:
  JSON array cu format complet pentru generarea articolelor:
  [
    {
      "keyword": "...",
      "category": "...",
      "tags": [...],
      "searchVolume": 1000
    }
  ]

SFATURI:
  - Poți obține cuvinte cheie de la:
    * Google Keyword Planner (export CSV)
    * Ahrefs / SEMrush (export CSV)
    * Google Trends (copie/paste în TXT)
    * Manual (creează un fișier TXT sau JSON)

  - Categoriile sunt detectate automat pe baza conținutului
  - Tag-urile sunt generate automat din keyword
  - Poți edita manual fișierul JSON rezultat pentru ajustări
    `);
    process.exit(0);
  }

  const [inputFile, outputFile] = args;

  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Fișierul ${inputFile} nu există!`);
    process.exit(1);
  }

  console.log(`📖 Citire fișier: ${inputFile}`);
  const content = fs.readFileSync(inputFile, 'utf-8');
  const ext = path.extname(inputFile).toLowerCase();

  let keywordInputs: KeywordInput[] = [];

  try {
    switch (ext) {
      case '.csv':
        console.log('📊 Detectat format CSV');
        keywordInputs = parseCSV(content);
        break;

      case '.txt':
        console.log('📝 Detectat format TXT');
        keywordInputs = parseTXT(content);
        break;

      case '.json':
        console.log('🔧 Detectat format JSON');
        keywordInputs = JSON.parse(content);
        break;

      default:
        console.error(`❌ Format nesuportat: ${ext}`);
        console.error('Formate acceptate: .csv, .txt, .json');
        process.exit(1);
    }

    console.log(`✅ ${keywordInputs.length} cuvinte cheie găsite\n`);

    // Procesează keywords
    console.log('🔄 Procesare și detectare categorii...');
    const processedKeywords = processKeywords(keywordInputs);

    // Afișează preview
    console.log('\n📋 Preview (primele 3):');
    processedKeywords.slice(0, 3).forEach((kw, i) => {
      console.log(`\n${i + 1}. "${kw.keyword}"`);
      console.log(`   Categorie: ${kw.category}`);
      console.log(`   Tags: ${kw.tags.join(', ')}`);
      if (kw.searchVolume) {
        console.log(`   Volume: ${kw.searchVolume}`);
      }
    });

    // Salvează output
    fs.writeFileSync(outputFile, JSON.stringify(processedKeywords, null, 2), 'utf-8');
    console.log(`\n✅ Salvat în: ${outputFile}`);
    console.log(`\n💡 Următorii pași:`);
    console.log(`   1. Revizuiește și ajustează ${outputFile} dacă e necesar`);
    console.log(`   2. Rulează: npm run generate-article ${outputFile} ./generated-articles`);
  } catch (error: any) {
    console.error(`❌ Eroare la procesare:`, error.message);
    process.exit(1);
  }
}

main();
