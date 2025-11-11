import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Keyword, Article, Category } from '../src/types/article';
import { generateArticleSvg } from '../src/utils/svgGenerator';

/**
 * Script principal pentru generarea tuturor articolelor
 * cu rotație automată a API key-urilor
 */

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

// Citește keywords din data/keywords.json
function loadKeywords(): Keyword[] {
  const keywordsPath = path.join(process.cwd(), 'data', 'keywords.json');
  if (!fs.existsSync(keywordsPath)) {
    console.error('❌ Fișierul data/keywords.json nu există!');
    console.error('Rulează mai întâi: npm run process-keywords');
    process.exit(1);
  }

  const content = fs.readFileSync(keywordsPath, 'utf-8');
  return JSON.parse(content);
}

// Mapare categorii
const categories: Record<string, Category> = {
  electrocasnice: { id: '1', name: 'Electrocasnice', slug: 'electrocasnice' },
  tech: { id: '2', name: 'Tehnologie', slug: 'tehnologie' },
  gaming: { id: '3', name: 'Gaming', slug: 'gaming' },
  copii: { id: '4', name: 'Copii & Bebeluși', slug: 'copii-bebelusi' },
  beauty: { id: '5', name: 'Îngrijire Personală', slug: 'ingrijire-personala' },
  sanatate: { id: '6', name: 'Sănătate', slug: 'sanatate' },
  bricolaj: { id: '7', name: 'Bricolaj & Scule', slug: 'bricolaj-scule' },
  gradina: { id: '8', name: 'Grădină', slug: 'gradina' },
  auto: { id: '9', name: 'Auto', slug: 'auto' },
  casa: { id: '10', name: 'Casă & Mobilier', slug: 'casa-mobilier' },
  sport: { id: '11', name: 'Sport & Fitness', slug: 'sport-fitness' },
  diverse: { id: '12', name: 'Diverse', slug: 'diverse' },
  generale: { id: '13', name: 'Generale', slug: 'generale' }
};

// Încarcă maparea simplă keyword -> URL eMAG
function loadKeywordMap(): Record<string, string> {
  try {
    const mapPath = path.join(process.cwd(), 'data', 'keyword-to-emag-simple.json');
    const content = fs.readFileSync(mapPath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    console.log('⚠️  Nu s-a putut încărca maparea eMAG');
    return {};
  }
}

// Găsește URL-ul eMAG potrivit pentru un keyword
function findEmagUrl(keyword: string, categorySlug: string): string | null {
  const keywordMap = loadKeywordMap();
  const lowerKeyword = keyword.toLowerCase();

  // Caută keyword-uri în mapare
  for (const [kw, url] of Object.entries(keywordMap)) {
    if (lowerKeyword.includes(kw.toLowerCase())) {
      return url;
    }
  }

  // Fallback: returnează categoria generală bazată pe categorySlug
  const categoryUrls: Record<string, string> = {
    'electrocasnice': 'https://www.emag.ro/electrocasnice-mici/c',
    'tech': 'https://www.emag.ro/laptopuri/c',
    'gaming': 'https://www.emag.ro/gaming/c',
    'copii': 'https://www.emag.ro/jucarii-copii/c',
    'beauty': 'https://www.emag.ro/ingrijire-personala/c',
    'sanatate': 'https://www.emag.ro/ingrijire-personala/c',
    'bricolaj': 'https://www.emag.ro/unelte-electrice/c',
    'gradina': 'https://www.emag.ro/casa-si-gradina/c',
    'auto': 'https://www.emag.ro/auto-moto/c',
    'casa': 'https://www.emag.ro/mobila/c',
    'sport': 'https://www.emag.ro/sport-outdoor/c',
  };

  return categoryUrls[categorySlug] || null;
}

// Generare articol cu rotație API
async function generateArticleWithRetry(
  keyword: Keyword,
  apiKeys: string[],
  currentKeyIndex: number
): Promise<{ article: Partial<Article>; nextKeyIndex: number }> {
  const apiKey = apiKeys[currentKeyIndex];
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',  // Model gratuit 2025, ideal pentru volume mari
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,  // gemini-2.5-flash suportă până la 65K
    }
  });

  const category = categories[keyword.category] || categories.generale;
  const emagUrl = findEmagUrl(keyword.keyword, keyword.category);

  console.log(`   🔗 eMAG URL găsit: ${emagUrl || 'NONE'}`);

  const emagLinkText = emagUrl
    ? `\n\n**LINK AFILIERE eMAG**: ${emagUrl}\n- Integrează acest link NATURAL în secțiunea de produse\n- Folosește call-to-action natural: "Vezi ofertele pe eMAG", "Compară prețurile pe eMAG", "Descoperă variante pe eMAG"\n- Pune linkul la finalul fiecărui produs recomandat\n`
    : '';

  const prompt = `Scrie un articol complet în limba română despre "${keyword.keyword}".

REGULI STRICTE:
- Titlul TREBUIE să fie EXACT: "${keyword.keyword}"
- PRIMUL PARAGRAF trebuie să conțină "${keyword.keyword}" în primele 2 fraze
- Fiecare paragraf: maxim 3-4 fraze pentru lizibilitate
- INTERZIS: cuvinte gen "ghid", "ghidul", "aventură", "să explorăm", "în peisajul", "în era"
- NU pune titlu la concluzie - scrie direct textul
${emagLinkText}

SCRIERE NATURALĂ:
- Scrie ca și cum ai explica unui prieten
- Propoziții scurte și clare
- Fii direct și practic
- Evită clișeele AI complet
- Fii sincer despre dezavantaje

STRUCTURĂ (1000-1800 CUVINTE):

1. INTRODUCERE (150-200 cuvinte):
- Prima frază: include "${keyword.keyword}" natural
- Descrie problema direct
- Fii empatic cu utilizatorul
- Paragrafe scurte de 2-3 fraze

2. CE TREBUIE SĂ ȘTII ÎNAINTE DE CUMPĂRARE (200-250 cuvinte):
## Ce trebuie să știi înainte de cumpărare
- 4-6 criterii esențiale în format bullet points
- Fiecare criteriu explica în 1-2 propoziții
- Menționează "${keyword.keyword}" de 2-3 ori natural

3. TOP PRODUSE RECOMANDATE (400-500 cuvinte):
## Top produse recomandate în 2025

Pentru FIECARE produs (3-5 produse):
### [Nume Brand + Model Specific]
**Preț aproximativ**: [range de preț în RON]

- **Pentru cine este ideal**: [descriere specifică]
- **Puncte forte**: bullet list cu 3-4 avantaje concrete
- **Puncte slabe**: 1-2 dezavantaje reale
- **Verdict**: O propoziție scurtă și clară

4. TABEL COMPARATIV:
## Comparație rapidă

| Produs | Preț | Punctaj | Ideal pentru |
|--------|------|---------|-------------|
| [completează cu datele reale] | [RON] | [/10] | [tip utilizator] |

5. GHID DE UTILIZARE / ÎNTREȚINERE (150-200 cuvinte):
## Cum să folosești și să întreții ${keyword.keyword}
- Sfaturi practice în bullet points
- Greșeli comune de evitat
- Trucuri pentru durabilitate

6. ÎNTREBĂRI FRECVENTE (200-250 cuvinte):
## Întrebări frecvente (FAQ)

### [Întrebare practică cu keyword natural]?
Răspuns direct în 2-3 propoziții.

[Repetă pentru 4-5 întrebări relevante]

7. CONCLUZIE (100-150 cuvinte):
## Concluzia noastră
- Recomandare clară pentru diferite tipuri de utilizatori
- Menționează "${keyword.keyword}" o dată
- Call-to-action natural

OPTIMIZARE SEO:
- Folosește "${keyword.keyword}" de 8-12 ori în tot articolul, ÎNTOTDEAUNA natural
- Variații ale keyword-ului: 5-7 ori
- Paragrafe de maxim 3-4 propoziții
- Subtitluri clare cu ## și ###
- Bold pentru termeni importanți cu **text**

TON ȘI STIL:
- Vorbește la persoana a 2-a (tu/voi) când te adresezi cititorului
- Folosește exemple concrete: "Am testat...", "În practică...", "Dacă..."
- Fii sincer despre prețuri și calitate
- Evită superlativele excesive
- Recunoaște când un produs nu e pentru toată lumea

BRAND-URI ȘI MODELE:
- Folosește DOAR branduri și modele REALE, populare în România (Samsung, LG, Bosch, Philips, Tefal, Rowenta, etc.)
- Menționează modele specifice cu nume complete (ex: "Bosch Serie 4" nu doar "Bosch")
- Prețuri realiste pentru piața din România în 2025

FORMAT JSON pentru răspuns:
{
  "title": "${keyword.keyword}",
  "description": "[meta descriere SEO 150-160 caractere care include keyword-ul și beneficiul principal]",
  "content": "[articol complet în markdown cu toate secțiunile de mai sus]",
  "suggestedTags": ["[tag1]", "[tag2]", "[tag3]", "[tag4]"],
  "readingTime": 8,
  "affiliateProducts": [
    {
      "productName": "[Brand + Model Complet]",
      "description": "[Descriere scurtă 10-15 cuvinte]",
      "recommendedFor": "[Tip specific de utilizator]"
    }
  ]
}

Răspunde DOAR cu JSON-ul, fără text înaintea sau după el.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Răspunsul nu conține un JSON valid');
    }

    const articleData = JSON.parse(jsonMatch[0]);

    // Generare slug
    const slug = keyword.keyword
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Generare SVG ilustrativ
    const svgContent = generateArticleSvg(keyword.keyword, keyword.category);

    const article: Partial<Article> = {
      title: articleData.title || keyword.keyword,
      slug,
      description: articleData.description,
      content: articleData.content,
      category,
      tags: articleData.suggestedTags || keyword.tags,
      readingTime: articleData.readingTime || 8,
      publishedAt: new Date(),
      affiliateLinks: articleData.affiliateProducts?.map((product: any, index: number) => ({
        id: `affiliate-${index}`,
        productName: product.productName,
        description: product.description,
        url: emagUrl || '#'
      })),
      imageUrl: `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`
    };

    // Rotează la următorul API key
    const nextKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    return { article, nextKeyIndex };
  } catch (error: any) {
    console.error(`   ⚠️  Eroare cu API key #${currentKeyIndex + 1}: ${error.message}`);

    // Încearcă cu următorul API key
    const nextKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    if (nextKeyIndex === currentKeyIndex) {
      throw new Error('Toate API key-urile au eșuat');
    }

    console.log(`   🔄 Reîncercare cu API key #${nextKeyIndex + 1}...`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return generateArticleWithRetry(keyword, apiKeys, nextKeyIndex);
  }
}

// Salvare articol
function saveArticle(article: Partial<Article>, outputDir: string) {
  const fileName = `${article.slug}.json`;
  const filePath = path.join(outputDir, fileName);

  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(article, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`   ❌ Eroare la salvare: ${error}`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const startFrom = args[0] ? parseInt(args[0]) : 0;
  const endAt = args[1] ? parseInt(args[1]) : undefined;

  console.log('🚀 Generare articole cu API rotație\n');
  console.log('═══════════════════════════════════════\n');

  const apiKeys = loadApiKeys();
  const keywords = loadKeywords();
  const outputDir = path.join(process.cwd(), 'generated-articles');

  const keywordsToProcess = keywords.slice(startFrom, endAt);
  console.log(`📝 Procesare ${keywordsToProcess.length} cuvinte cheie`);
  console.log(`   (de la ${startFrom + 1} la ${endAt || keywords.length})\n`);

  let currentKeyIndex = 0;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < keywordsToProcess.length; i++) {
    const keyword = keywordsToProcess[i];
    const globalIndex = startFrom + i + 1;

    console.log(`\n[${globalIndex}/${keywords.length}] "${keyword.keyword}"`);
    console.log(`   Categorie: ${keyword.category}`);
    console.log(`   API Key: #${currentKeyIndex + 1}`);

    try {
      const { article, nextKeyIndex } = await generateArticleWithRetry(
        keyword,
        apiKeys,
        currentKeyIndex
      );

      const saved = saveArticle(article, outputDir);
      if (saved) {
        successCount++;
        console.log(`   ✅ Generat și salvat cu succes!`);
      } else {
        errorCount++;
      }

      currentKeyIndex = nextKeyIndex;

      // Pauză între articole (respectă rate limits: 10 RPM per key)
      if (i < keywordsToProcess.length - 1) {
        const pauseTime = 7000; // 7 secunde - safe pentru 10 RPM cu 8 keys
        console.log(`   ⏳ Pauză ${pauseTime / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, pauseTime));
      }
    } catch (error: any) {
      errorCount++;
      console.error(`   ❌ Eșuat complet: ${error.message}`);

      // Pauză mai lungă după eroare
      console.log(`   ⏳ Pauză 15s după eroare...`);
      await new Promise((resolve) => setTimeout(resolve, 15000));
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('✨ FINALIZAT!\n');
  console.log(`📊 Statistici:`);
  console.log(`   ✅ Succes: ${successCount}`);
  console.log(`   ❌ Erori: ${errorCount}`);
  console.log(`   📁 Locație: ${outputDir}`);
  console.log('\n💡 Următorii pași:');
  console.log('   1. Verifică articolele în generated-articles/');
  console.log('   2. Adaugă URL-uri afiliate');
  console.log('   3. Importă în blog');
}

main();
