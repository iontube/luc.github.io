import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

interface EmagCategory {
  id: string;
  name: string;
  url: string;
  hasArticle: boolean;
  articleSlug?: string;
}

interface CategoryWithSubtags extends EmagCategory {
  subtags: string[];
  isPlural: boolean;
}

/**
 * Detectează dacă o expresie este la plural sau singular în română
 * Analizează PRIMUL cuvânt (substantivul principal)
 */
function detectPlural(expression: string): boolean {
  const lowerExpr = expression.toLowerCase().trim();

  // Extrage primul cuvânt (substantivul principal)
  const words = lowerExpr.split(/[\s-]+/);
  const firstWord = words[0];

  // Dicționar SINGULAR (cuvinte care sunt 100% singular)
  const definiteSingular = [
    'laptop', 'telefon', 'smartphone', 'monitor', 'televizor', 'router',
    'mouse', 'aparat', 'frigider', 'cuptor', 'aspirator', 'robot',
    'sistem', 'pachet', 'set', 'dispozitiv', 'echipament', 'produs',
    'absorbant', 'detector', 'senzor', 'ventilator', 'radiator',
    'calculator', 'proiector', 'scanner', 'imprimanta', 'modem'
  ];

  // Dicționar PLURAL (cuvinte care sunt 100% plural)
  const definitePlural = [
    'accesorii', 'căști', 'boxe', 'console', 'componente', 'periferice',
    'laptopuri', 'telefoane', 'monitoare', 'televizoare', 'routere',
    'produse', 'articole', 'gadgeturi', 'cabluri', 'prize', 'becuri',
    'camere', 'senzori', 'detectori', 'ușă', 'smartphone-uri'
  ];

  // Verifică dicționarul SINGULAR (prioritate maximă)
  if (definiteSingular.includes(firstWord)) {
    return false;
  }

  // Verifică dicționarul PLURAL
  if (definitePlural.includes(firstWord)) {
    return true;
  }

  // Verifică toată expresia pentru cuvinte plural
  for (const plural of definitePlural) {
    if (lowerExpr.includes(plural)) {
      return true;
    }
  }

  // Analiza terminațiilor primului cuvânt

  // Terminații PLURAL
  if (firstWord.endsWith('uri') && firstWord.length > 5) return true;
  if (firstWord.endsWith('ii') && firstWord.length > 4) return true;
  if (firstWord.endsWith('iilor')) return true;
  if (firstWord.endsWith('urilor')) return true;
  if (firstWord.endsWith('elor')) return true;
  if (firstWord.endsWith('ilor')) return true;
  if (firstWord.match(/^.+[^s]e$/)) return true; // "camere", "pere" dar nu "mouse"

  // Terminații SINGULAR clare
  if (firstWord.endsWith('tor') && firstWord.length > 4) return false;
  if (firstWord.endsWith('or') && firstWord.length > 3) return false;
  if (firstWord.endsWith('ant') && firstWord.length > 4) return false;
  if (firstWord.endsWith('ator') && firstWord.length > 5) return false;

  // DEFAULT: dacă nu știm sigur, presupunem SINGULAR
  // (mai sigur pentru SEO decât să presupunem greșit plural)
  return false;
}

/**
 * Generează subtag-uri relevante pentru o categorie folosind AI
 */
async function generateSubtagsForCategory(
  category: EmagCategory,
  genAI: GoogleGenerativeAI
): Promise<string[]> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
    }
  });

  const prompt = `Pentru categoria de produse "${category.name}" de pe eMAG, generează exact 5 subtag-uri/calificative relevante și specifice pentru piața din România.

CONTEXT: Acestea vor fi folosite pentru articole tip "cel mai bun/cele mai bune ${category.name} [SUBTAG]"

REGULI:
- EXACT 5 subtag-uri
- Specifice pentru categoria "${category.name}"
- Relevante pentru piața România 2025
- Scurte (1-3 cuvinte maxim)
- Fără "2025" (se adaugă automat)
- Fără "cel mai bun" sau "cele mai bune"

EXEMPLE BUNE pentru diferite categorii:
- Laptopuri: "pentru gaming", "ultraportabil", "pentru programare", "ieftin", "business"
- Căști: "wireless", "cu noise cancelling", "pentru gaming", "sport", "buget"
- Mouse: "pentru gaming", "wireless", "ergonomic", "vertical", "ieftin"
- Drone: "cu cameră 4K", "pentru începători", "profesionale", "ieftine", "cu gimbal"

FORMAT JSON:
{
  "subtags": ["subtag1", "subtag2", "subtag3", "subtag4", "subtag5"]
}

Răspunde DOAR cu JSON-ul, fără text suplimentar.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Curăță markdown
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const data = JSON.parse(text);
    return data.subtags || [];
  } catch (error) {
    console.error(`❌ Eroare la generarea subtag-urilor pentru ${category.name}:`, error);

    // Fallback generic
    return ['ieftin', 'profesional', 'performant', 'compact', 'premium'];
  }
}

// Citește API keys din api.txt
function loadApiKeys(): string[] {
  const apiPath = path.join(process.cwd(), 'api.txt');
  if (!fs.existsSync(apiPath)) {
    console.error('❌ Fișierul api.txt nu există!');
    process.exit(1);
  }

  const content = fs.readFileSync(apiPath, 'utf-8');
  const keys = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  console.log(`🔑 Încărcate ${keys.length} API keys\n`);
  return keys;
}

async function main() {
  console.log('🚀 START - Generare subtag-uri relevante pentru categorii eMAG\n');
  console.log('═'.repeat(80));

  const apiKeys = loadApiKeys();
  if (apiKeys.length === 0) {
    console.error('❌ Nu există API keys în api.txt');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKeys[0]); // Folosește prima cheie

  // Citește categoriile
  const categoriesPath = path.join(process.cwd(), 'data', 'emag-categories.json');
  const categories: EmagCategory[] = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));

  // Opțiuni CLI
  const args = process.argv.slice(2);
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const startArg = args.find(arg => arg.startsWith('--start='));

  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 50;
  const start = startArg ? parseInt(startArg.split('=')[1]) : 0;

  const categoriesToProcess = categories.slice(start, start + limit);

  console.log(`📊 Total categorii: ${categories.length}`);
  console.log(`🎯 Procesez: ${categoriesToProcess.length} categorii (${start} → ${start + categoriesToProcess.length})\n`);

  const categoriesWithSubtags: CategoryWithSubtags[] = [];

  for (let i = 0; i < categoriesToProcess.length; i++) {
    const category = categoriesToProcess[i];

    console.log(`[${i + 1}/${categoriesToProcess.length}] ${category.name}...`);

    // Detectează plural
    const isPlural = detectPlural(category.name);
    console.log(`  Detectat: ${isPlural ? 'PLURAL' : 'SINGULAR'}`);

    // Generează subtag-uri
    const subtags = await generateSubtagsForCategory(category, genAI);
    console.log(`  Subtag-uri: ${subtags.join(', ')}`);

    categoriesWithSubtags.push({
      ...category,
      subtags,
      isPlural
    });

    // Pauză între requesturi
    if (i < categoriesToProcess.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Salvează rezultatul
  const outputPath = path.join(process.cwd(), 'data', 'emag-categories-with-subtags.json');

  // Încarcă datele existente dacă există
  let allCategoriesWithSubtags: CategoryWithSubtags[] = [];
  if (fs.existsSync(outputPath)) {
    allCategoriesWithSubtags = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
  }

  // Actualizează sau adaugă categoriile procesate
  categoriesWithSubtags.forEach(newCat => {
    const existingIndex = allCategoriesWithSubtags.findIndex(c => c.id === newCat.id);
    if (existingIndex >= 0) {
      allCategoriesWithSubtags[existingIndex] = newCat;
    } else {
      allCategoriesWithSubtags.push(newCat);
    }
  });

  fs.writeFileSync(outputPath, JSON.stringify(allCategoriesWithSubtags, null, 2), 'utf-8');

  console.log('\n═'.repeat(80));
  console.log(`✅ Procesate: ${categoriesToProcess.length} categorii`);
  console.log(`💾 Salvat în: ${outputPath}`);
  console.log(`📊 Total în fișier: ${allCategoriesWithSubtags.length} categorii`);

  if (start + limit < categories.length) {
    console.log(`\n💡 Pentru a continua:`);
    console.log(`   npm run generate-subtags -- --start=${start + limit} --limit=${limit}\n`);
  } else {
    console.log(`\n🎉 Toate categoriile au fost procesate!`);
    console.log(`\n💡 Next: npm run generate-keywords\n`);
  }

  console.log('✨ DONE!\n');
}

main().catch(console.error);
