import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { parse } from 'csv-parse/sync';
import axios from 'axios';
import sharp from 'sharp';

dotenv.config();

interface CSVRow {
  keyword: string;
  volume: string;
  competition: string;
  subCategory: string;
  eMagLink: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  imageUrl?: string;         // Imagine WebP de pe Freepik
  heroSvg: string;           // SVG fallback
  mainCategory: string;
  mainCategorySlug: string;
  subCategory: string;
  subCategorySlug: string;
  categoryUrl: string;      // Link categorie eMAG (dacă există)
  searchUrl: string;         // Link search eMAG din CSV
  tags: string[];
  readingTime: number;
  publishedAt: Date;
  featured: boolean;
  volume: number;
}

// Mapping sub-categorii → link-uri eMAG categorii (unde există)
const CATEGORY_EMAG_MAPPING: Record<string, string> = {
  'Telefoane': 'https://www.emag.ro/telefoane-mobile/c',
  'Smartwatch-uri': 'https://www.emag.ro/smartwatch-uri/c',
  'Laptopuri': 'https://www.emag.ro/laptopuri/c',
  'Monitoare': 'https://www.emag.ro/monitoare/c',
  'Periferice': 'https://www.emag.ro/periferice-pc/c',
  'Audio': 'https://www.emag.ro/audio/c',
  'TV': 'https://www.emag.ro/tv/c',
  'Tablete': 'https://www.emag.ro/tablete/c',
  'Fotografie': 'https://www.emag.ro/aparate-foto-digitale/c',
  'Smart Home': 'https://www.emag.ro/smart-home/c',
  'Gaming': 'https://www.emag.ro/gaming/c',
  'Drone': 'https://www.emag.ro/drone/c',
  // Adaugă altele dacă există
};

/**
 * Generează SVG hero pentru articol (fără AI - economisim tokeni)
 */
function generateHeroSVG(
  subCategory: string
): string {
  // Generate unique SVG based on subCategory hash
  const hash = subCategory.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    ['#ea580c', '#f59e0b'], // orange
    ['#0891b2', '#06b6d4'], // cyan
    ['#7c3aed', '#a855f7'], // purple
    ['#059669', '#10b981'], // green
    ['#dc2626', '#f87171'], // red
    ['#2563eb', '#60a5fa'], // blue
  ];
  const colorPair = colors[hash % colors.length];
  const cx1 = 100 + (hash % 200);
  const cy1 = 80 + (hash % 80);
  const cx2 = 200 + ((hash * 2) % 100);
  const cy2 = 100 + ((hash * 3) % 60);

  return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colorPair[0]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colorPair[1]};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#grad-${hash})" opacity="0.1"/>
  <circle cx="${cx1}" cy="${cy1}" r="60" fill="${colorPair[0]}" opacity="0.3"/>
  <circle cx="${cx2}" cy="${cy2}" r="40" fill="${colorPair[1]}" opacity="0.5"/>
  <text x="200" y="260" text-anchor="middle" font-size="18" font-weight="bold" fill="#78716c">${subCategory}</text>
</svg>`;
}

/**
 * Elimină diacriticele din text
 */
function removeDiacritics(str: string): string {
  const diacriticsMap: Record<string, string> = {
    'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
    'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T'
  };
  return str.replace(/[ăâîșțĂÂÎȘȚ]/g, char => diacriticsMap[char] || char);
}

/**
 * Caută și descarcă imagine de pe Freepik, convertește la WebP
 */
async function downloadFreepikImage(
  keyword: string,
  slug: string
): Promise<string | null> {
  const apiKey = process.env.FREEPIK_API_KEY;
  if (!apiKey) {
    console.log('   ⚠️  FREEPIK_API_KEY lipseste - skip imagine');
    return null;
  }

  try {
    console.log(`   🖼️  Caut imagine pe Freepik: "${keyword}"...`);

    // Caută imagini pe Freepik (doar gratuite)
    const searchResponse = await axios.get('https://api.freepik.com/v1/resources', {
      headers: {
        'x-freepik-api-key': apiKey,
        'Accept': 'application/json'
      },
      params: {
        term: keyword,
        'filters[content_type][]': 'photo', // doar poze, nu vectori
        'filters[license][]': 'free',        // doar imagini gratuite
        limit: 1
      }
    });

    const resources = searchResponse.data?.data;
    if (!resources || resources.length === 0) {
      console.log('   ⚠️  Nu am gasit imagini');
      return null;
    }

    const resource = resources[0];
    const resourceId = resource.id;
    console.log(`   📥 Descarc imagine ID: ${resourceId}...`);

    // Obține link de download
    const downloadResponse = await axios.get(
      `https://api.freepik.com/v1/resources/${resourceId}/download`,
      {
        headers: {
          'x-freepik-api-key': apiKey,
          'Accept': 'application/json'
        }
      }
    );

    const downloadUrl = downloadResponse.data?.data?.url;
    if (!downloadUrl) {
      console.log('   ⚠️  Nu am primit URL de download');
      return null;
    }

    // Descarcă imaginea
    const imageResponse = await axios.get(downloadUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    });

    // Convertește la WebP și optimizează
    const outputPath = path.join(process.cwd(), 'public', 'images', 'articles', `${slug}.webp`);

    await sharp(Buffer.from(imageResponse.data))
      .resize(1200, 675, { // 16:9 aspect ratio
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(outputPath);

    console.log(`   ✅ Imagine salvata: /images/articles/${slug}.webp`);
    return `/images/articles/${slug}.webp`;

  } catch (error: any) {
    console.error(`   ❌ Eroare descarcare imagine:`, error.message);
    if (error.response) {
      console.error(`   Response status: ${error.response.status}`);
      console.error(`   Response data:`, error.response.data);
    }
    return null;
  }
}

/**
 * Generează conținutul articolului cu AI
 */
async function generateArticleContent(
  keyword: string,
  subCategory: string,
  searchUrl: string,
  categoryUrl: string,
  nvidiaApiKey: string
): Promise<{ content: string; description: string; tags: string[]; readingTime: number }> {
  console.log(`   🤖 Generez continut cu NVIDIA AI...`);

  const prompt = `╔════════════════════════════════════════════════════════════════════╗
║  REGULA #1 ABSOLUTA: ZERO DIACRITICE IN INTREG ARTICOLUL!        ║
║  Scrie DOAR cu: a, e, i, o, u, s, t                               ║
║  NU folosi NICIODATA: ă, â, î, ș, ț                               ║
║  Exemple CORECTE: "in", "si", "pentru", "tine"                    ║
║  Exemple GRESITE: "în", "și", "pentru", "ține"                    ║
╚════════════════════════════════════════════════════════════════════╝

CONTEXT:
- Titlu articol: "${keyword}"
- Sub-categorie: "${subCategory}"
- Link search eMAG: ${searchUrl}
${categoryUrl ? `- Link categorie eMAG: ${categoryUrl}` : ''}

REGULI STRICTE OBLIGATORII:
1. Titlul articolului este EXACT: "${keyword}" (CU diacritice in titlu)
2. INTREG continutul articolului FARA diacritice (doar titlul le pastreaza)
3. NU repeta titlul in continut
4. Scrie natural, ca un expert care recomanda produse

REGULI PENTRU LIZIBILITATE PERFECTA:
- PARAGRAFE SCURTE: maxim 2-3 propozitii per paragraf (50-80 cuvinte)
- Lasa rand gol intre paragrafe
- Evita blocuri mari de text
- Fiecare paragraf = o singura idee
- Propozitii simple si directe

SCRIE CA UN OM ADEVARAT - TON CONVERSATIONAL:
- Scrie natural, ca un prieten care recomanda produse
- INTERZIS: "sa ne aventuram", "haideti sa exploram", "in peisajul", "in era digitala", "este esential sa", "nu este doar"
- INTERZIS: repetarea acelorasi fraze la fiecare produs
- Foloseste: "Am testat X timp...", "Surpriza placuta...", "Sincer, ma asteptam la...", "Dupa 2 saptamani..."
- Fii sincer: daca ceva nu merge bine, spune-o (bateria se descarca rapid la gaming, pretul e cam piperat, etc.)
- Scrie DIFERIT pentru fiecare produs - nu copia stilul

OPTIMIZARE SEO - CUVINTE CHEIE CU BOLD:
- Pune cuvantul cheie principal "${keyword.toLowerCase()}" cu **bold** de 3-4 ori prin articol (nu exagera)
- Pune variatii ale cuvantului cheie cu **bold** (de ex: daca e "cel mai bun smartwatch", bold pe "smartwatch", "smartwatch-uri")
- NU pune bold pe fiecare aparitie, doar strategic (la inceput paragraf, in titluri produse, in concluzie)
- Exemplu corect: "Daca esti in cautare de **cel mai bun smartwatch pentru barbati**, trebuie sa..."

DENSITATE CUVANT CHEIE (2-3%):
- Foloseste cuvantul cheie "${keyword.toLowerCase()}" natural de 15-20 ori in tot articolul
- Foloseste si variatii: daca keyword e "cel mai bun X", foloseste "X", "cel mai bun X", "X-uri bune"
- Mentioneaza cuvantul cheie in primele 100 cuvinte ale introducerii
- Mentioneaza cuvantul cheie in ultimele 100 cuvinte ale concluzie

STRUCTURA ARTICOL (1500-1800 CUVINTE):

1. INTRODUCERE (150-200 cuvinte):
- Incepe direct cu problema/nevoia
- De ce e important acest produs/categorie
- Ce va gasi cititorul in articol

2. CRITERII DE ALEGERE (250-300 cuvinte):
## Cum alegi ${keyword.toLowerCase()}

- 5-7 criterii esentiale (bullet points)
- Fiecare explicat in 2-3 propozitii
- Sfaturi practice
- Mentioneaza cuvantul cheie "${keyword.toLowerCase()}" de 2-3 ori in aceasta sectiune

3. TOP PRODUSE (600-700 cuvinte):
## Top ${keyword}

IMPORTANT: Foloseste DOAR modele ACTUALE din 2025 disponibile in Romania:
- Telefoane: Samsung Galaxy S24/S24 Ultra, iPhone 15/16, Google Pixel 8/9, OnePlus 12, Xiaomi 14
- Specificatii REALE: procesor Snapdragon 8 Gen 3, A17 Pro, tensor G3, etc.
- Preturi REALISTE pentru piata romaneasca

Pentru FIECARE produs (5-6 produse):
### [Brand + Model ACTUAL 2025]

[PARAGRAF DE 150-200 CUVINTE - SCRIS NATURAL ca un review adevarat:
- Specificatii tehnice CONCRETE (nume procesor real, GB RAM exact, mAh baterie)
- Ce imi place/nu imi place (scris in prima persoana, experienta reala)
- Comparatie cu alte modele (ex: "fata de S23, bateria tine cu 20% mai mult")
- Pret aproximativ in RON (ex: "pretul porneste de la 4500 RON")
- Pentru cine recomand: cazuri de utilizare concrete]

**Avantaje:**
- 3-4 avantaje concrete
- Fiecare pe un bullet point separat

**Dezavantaje:**
- 2-3 dezavantaje realiste
- Fiecare pe un bullet point separat

**🔗 Linkuri utile:**
- [Vezi pe eMAG](${searchUrl})
- [Compara preturi](${categoryUrl || searchUrl})

4. TABEL COMPARATIV (100-150 cuvinte):
## Comparatie rapida

| Produs | Rating | Ideal pentru |
|--------|--------|--------------|
| [Model 1] | X/10 | [Tip utilizator] |
| [Model 2] | X/10 | [Tip utilizator] |
...

5. SFATURI UTILIZARE (200-250 cuvinte):
## Sfaturi de utilizare si intretinere

- Sfaturi practice pentru folosirea corecta
- Intretinere si mentenanta
- Erori comune de evitat

6. INTREBARI FRECVENTE (200-250 cuvinte):
## Intrebari frecvente

╔═══════════════════════════════════════════════════════════╗
║ ATENTIE CRITICA - TITLURILE FAQ FARA BOLD:               ║
║  ❌ GRESIT: ### Cat de des trebuie **incarcat**?         ║
║  ✅ CORECT: ### Cat de des trebuie incarcat?             ║
║  TOATE titlurile H3 din FAQ trebuie scrise FARA **bold**!║
╚═══════════════════════════════════════════════════════════╝

### [Intrebare 1]?
Raspuns detaliat...

### [Intrebare 2]?
Raspuns detaliat...

7. CONCLUZIE (100-150 cuvinte):
- Rezumat scurt
- Recomandare finala
- Call to action

FORMAT RASPUNS:
FOARTE IMPORTANT:
1. Returneaza JSON VALID (toate newlines din stringuri trebuie escapate ca \\n)
2. Continutul trebuie sa fie DOAR MARKDOWN PUR - FARA HTML, FARA <div>, FARA <svg>, FARA tag-uri HTML!
3. NU include titlul articolului la inceputul continutului - incepe direct cu introducerea
4. Returneaza DOAR JSON, fara text inainte sau dupa:

{
  "content": "INTREG continutul in Markdown PUR (incepe cu ## sau paragraf, NU cu titlul!)",
  "description": "Meta description 150-160 caractere",
  "tags": ["tag1", "tag2", "tag3"],
  "readingTime": 8
}

INTERZIS in content: HTML tags, <div>, <svg>, <img>, orice alt HTML - DOAR MARKDOWN!`;

  try {
    // Retry logic cu exponential backoff pentru 429/503 errors
    let responseText;
    let lastError;
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await axios.post(
          'https://integrate.api.nvidia.com/v1/chat/completions',
          {
            model: 'meta/llama-3.1-405b-instruct',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,
            top_p: 0.95,
            max_tokens: 4096,
          },
          {
            headers: {
              'Authorization': `Bearer ${nvidiaApiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 120000, // 2 minute timeout
          }
        );

        responseText = response.data.choices[0].message.content;
        break; // Success - exit retry loop
      } catch (error: any) {
        lastError = error;

        // Daca e 429 (rate limit) sau 503 (overloaded), retry cu exponential backoff
        if ((error.response?.status === 429 || error.response?.status === 503) && attempt < maxRetries - 1) {
          const delaySeconds = Math.pow(2, attempt + 2); // 4s, 8s, 16s
          console.log(`   ⏳ API ${error.response?.status === 429 ? 'rate limited' : 'overloaded'}, retry in ${delaySeconds}s (attempt ${attempt + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
          continue;
        }

        // Pentru alte erori sau ultima incercare, throw
        throw error;
      }
    }

    if (!responseText) {
      throw lastError || new Error('Failed to generate content after retries');
    }

    let text = responseText.trim();

    // Extrage JSON - incearca mai multe metode
    let jsonText = '';

    // Metoda 1: cauta ```json ... ```
    const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1];
    } else {
      // Metoda 2: cauta primul JSON valid complet (cu balanță de acolade)
      const startIndex = text.indexOf('{');
      if (startIndex !== -1) {
        let braceCount = 0;
        let endIndex = startIndex;
        for (let i = startIndex; i < text.length; i++) {
          if (text[i] === '{') braceCount++;
          if (text[i] === '}') braceCount--;
          if (braceCount === 0) {
            endIndex = i + 1;
            break;
          }
        }
        jsonText = text.substring(startIndex, endIndex);
      }
    }

    if (!jsonText) {
      console.error('Raw response text:', text.substring(0, 500));
      throw new Error('Nu am putut extrage JSON din raspuns');
    }

    // Parse JSON using JSON5-like approach - try direct parse first
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (e) {
      // If direct parse fails, try fixing common issues with newlines in string values
      // Replace literal newlines/tabs inside string values with escaped versions
      try {
        // Simple approach: compact the JSON to single line, this will handle newlines
        const fixedJson = jsonText
          .replace(/\r\n/g, '\n')  // Normalize line endings
          .replace(/\n/g, '\\n')    // Escape all newlines
          .replace(/\\\\n/g, '\\n') // Fix double-escaping
          .replace(/\t/g, '\\t');   // Escape tabs

        data = JSON.parse(fixedJson);
      } catch (e2) {
        console.error('Failed to parse JSON even after fixes.');
        console.error('Original JSON (first 1000 chars):', jsonText.substring(0, 1000));
        throw e2;
      }
    }

    // Elimină primul H1 din content dacă există (pentru că pagina deja are un H1)
    let content = data.content || '';
    content = content.replace(/^#\s+[^\n]+\n\n?/, '');

    // Elimină diacriticele (backup pentru cazul când AI-ul nu respectă instrucțiunile)
    content = removeDiacritics(content);
    const description = removeDiacritics(data.description || '');

    return {
      content,
      description,
      tags: data.tags || [subCategory.toLowerCase()],
      readingTime: data.readingTime || 8
    };

  } catch (error) {
    console.error(`⚠️  Eroare la generarea continutului:`, error);
    throw error;
  }
}

/**
 * Generează un articol complet
 */
async function generateArticle(
  row: CSVRow,
  index: number,
  nvidiaApiKey: string
): Promise<Article> {
  console.log(`\n📝 [${index + 1}] Generez: "${row.keyword}"...`);

  // Generează slug
  const slug = row.keyword
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Sub-category slug
  const subCategorySlug = row.subCategory
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Category URL (dacă există mapping)
  const categoryUrl = CATEGORY_EMAG_MAPPING[row.subCategory] || '';

  // Generează SVG (fără AI - economisim tokeni)
  console.log(`   🎨 Generez SVG...`);
  const heroSvg = generateHeroSVG(row.subCategory);

  // Skip imagini externe - rămânem doar cu SVG
  const imageUrl = null;

  // Generează conținut
  const articleData = await generateArticleContent(
    row.keyword,
    row.subCategory,
    row.eMagLink,
    categoryUrl,
    nvidiaApiKey
  );

  const article: Article = {
    id: `csv-${index}`,
    title: row.keyword,  // CU diacritice
    slug,
    description: articleData.description,
    content: articleData.content,
    imageUrl: imageUrl || undefined,  // Imagine WebP de pe Freepik
    heroSvg,                          // SVG fallback
    mainCategory: 'Tehnologie & Gadgeturi',
    mainCategorySlug: 'tehnologie-gadgeturi',
    subCategory: row.subCategory,
    subCategorySlug,
    categoryUrl,
    searchUrl: row.eMagLink,
    tags: articleData.tags,
    readingTime: articleData.readingTime,
    publishedAt: new Date(),
    featured: parseInt(row.volume) > 5000, // Featured dacă volum > 5000
    volume: parseInt(row.volume) || 0
  };

  console.log(`✅ Generat: ${article.title}`);
  return article;
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  const startIndex = args.includes('--start') ? parseInt(args[args.indexOf('--start') + 1]) : 0;
  const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : 10;

  console.log('🚀 START - Generare articole din cats.csv\n');
  console.log('════════════════════════════════════════════════════════════════════════════════');

  // Încarcă NVIDIA API key
  const nvidiaApiKey = process.env.NVIDIA_API_KEY;
  if (!nvidiaApiKey) {
    throw new Error('Nu exista NVIDIA_API_KEY in .env');
  }
  console.log(`🔑 NVIDIA API key loaded (40 RPM limit)\n`);

  // Citește CSV
  const csvPath = path.join(process.cwd(), 'cats.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(csvContent, {
    columns: ['keyword', 'volume', 'competition', 'subCategory', 'eMagLink'],
    skip_empty_lines: true,
    from: 2 // Skip header
  }) as CSVRow[];

  console.log(`📊 Total keywords in CSV: ${records.length}`);
  const toProcess = records.slice(startIndex, startIndex + limit);
  console.log(`🎯 Procesez: ${toProcess.length} keywords (${startIndex} → ${startIndex + limit})\n`);

  // Generează articole
  const articles: Article[] = [];

  for (let i = 0; i < toProcess.length; i++) {
    // Elimină diacritice din keyword
    const row = {
      ...toProcess[i],
      keyword: removeDiacritics(toProcess[i].keyword)
    };

    try {
      const article = await generateArticle(row, startIndex + i, nvidiaApiKey);
      articles.push(article);

      // Salvează individual
      const articlePath = path.join(process.cwd(), 'data', 'csv-articles', `${article.slug}.json`);
      fs.mkdirSync(path.dirname(articlePath), { recursive: true});
      fs.writeFileSync(articlePath, JSON.stringify(article, null, 2));

      // Delay între requests (40 RPM = 1.5s between requests)
      if (i < toProcess.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

    } catch (error) {
      console.error(`❌ Eroare la ${row.keyword}:`, error);
    }
  }

  // Salvează index
  const indexPath = path.join(process.cwd(), 'data', 'csv-articles', 'index.json');
  const existingIndex = fs.existsSync(indexPath)
    ? JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
    : [];

  const updatedIndex = [...existingIndex];
  for (const article of articles) {
    const existingIdx = updatedIndex.findIndex(a => a.id === article.id);
    if (existingIdx >= 0) {
      updatedIndex[existingIdx] = article;
    } else {
      updatedIndex.push(article);
    }
  }

  fs.writeFileSync(indexPath, JSON.stringify(updatedIndex, null, 2));

  console.log('\n════════════════════════════════════════════════════════════════════════════════');
  console.log(`✅ FINALIZAT: ${articles.length} articole generate`);
  console.log(`📁 Salvate in: data/csv-articles/`);
}

main().catch(console.error);
