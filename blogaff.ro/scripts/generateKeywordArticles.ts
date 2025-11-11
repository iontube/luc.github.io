import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

interface Keyword {
  id: string;
  keyword: string;
  categoryId: string;
  categoryName: string;
  categoryUrl: string;
  subtag: string;
  searchUrl: string;
}

interface ArticleWithSVG {
  id: string;
  keywordId: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  heroSvg: string;
  category: string;
  categoryId: string;
  categoryName?: string;     // Nume categorie pentru breadcrumb
  categoryUrl: string;       // Link categorie: https://www.emag.ro/categorie/c
  searchUrl: string;         // Link search: https://www.emag.ro/search/keyword
  tags: string[];
  readingTime: number;
  publishedAt: Date;
  featured: boolean;
}

/**
 * Generează titlu natural bazat pe keyword și subtag
 */
function generateNaturalTitle(keyword: Keyword): string {
  const { categoryName, subtag } = keyword;

  // Template-uri variate pentru titluri naturale
  const templates = [
    // Pentru "2025"
    {
      condition: (st: string) => st === '2025',
      titles: [
        `${categoryName}: Top recomandari si ghid de alegere 2025`,
        `Ghid complet ${categoryName} - 2025`,
        `${categoryName} 2025: Care sunt cele mai bune optiuni?`,
      ]
    },
    // Pentru "ieftin"
    {
      condition: (st: string) => st === 'ieftin' || st === 'ieftine',
      titles: [
        `${categoryName}: Solutii ieftine si eficiente`,
        `Cum alegi ${categoryName.toLowerCase()} de calitate la pret bun`,
        `${categoryName} cu raport calitate-pret excelent`,
      ]
    },
    // Pentru "profesional"
    {
      condition: (st: string) => st === 'profesional' || st === 'profesionale',
      titles: [
        `${categoryName} profesionale: Ghid si recomandari`,
        `${categoryName} pentru utilizare profesionala: Top modele`,
        `Alege ${categoryName.toLowerCase()} profesionale potrivite`,
      ]
    },
    // Pentru "performant"
    {
      condition: (st: string) => st === 'performant' || st === 'performante',
      titles: [
        `${categoryName} performante: Cum alegi modelul potrivit`,
        `Top ${categoryName.toLowerCase()} cu performante ridicate`,
        `${categoryName}: Modele performante recomandate`,
      ]
    },
    // Pentru "compact"
    {
      condition: (st: string) => st === 'compact' || st === 'compacte',
      titles: [
        `${categoryName} compacte: Sfaturi si recomandari`,
        `Modele compacte ${categoryName.toLowerCase()}: Ghid complet`,
        `${categoryName} de dimensiuni reduse: Top optiuni`,
      ]
    },
    // Pentru "pentru acasa/casa"
    {
      condition: (st: string) => st.includes('casa') || st.includes('acasa'),
      titles: [
        `${categoryName} pentru acasa: Ghid de alegere`,
        `Cum alegi ${categoryName.toLowerCase()} potrivite pentru casa`,
        `${categoryName} rezidentiale: Top recomandari`,
      ]
    },
    // Pentru "pentru birou/birouri"
    {
      condition: (st: string) => st.includes('birou'),
      titles: [
        `${categoryName} pentru birouri: Solutii profesionale`,
        `${categoryName} de birou: Ghid complet si recomandari`,
        `Top ${categoryName.toLowerCase()} pentru mediul de lucru`,
      ]
    },
    // Pentru "mesh"
    {
      condition: (st: string) => st.includes('mesh'),
      titles: [
        `${categoryName} Mesh: Tehnologie si recomandari`,
        `Sisteme Mesh ${categoryName.toLowerCase()}: Ghid complet`,
        `${categoryName} cu tehnologie Mesh: Care sunt cele mai bune`,
      ]
    },
    // Pentru "Wi-Fi 6"
    {
      condition: (st: string) => st.includes('wi-fi') || st.includes('wifi'),
      titles: [
        `${categoryName} Wi-Fi 6: Ghid si top modele`,
        `${categoryName} cu Wi-Fi 6: Performanta de ultima generatie`,
        `Cum alegi ${categoryName.toLowerCase()} Wi-Fi 6 potrivite`,
      ]
    },
    // Default generic
    {
      condition: () => true,
      titles: [
        `${categoryName}: Ghid complet de alegere`,
        `Top ${categoryName.toLowerCase()} recomandate in 2025`,
        `Cum alegi ${categoryName.toLowerCase()} potrivite: Sfaturi si recomandari`,
      ]
    }
  ];

  // Găsește primul template care se potrivește
  const matchedTemplate = templates.find(t => t.condition(subtag.toLowerCase()));

  if (matchedTemplate && matchedTemplate.titles.length > 0) {
    // Alege random un titlu din template (pentru variație)
    const randomIndex = Math.floor(Math.random() * matchedTemplate.titles.length);
    return matchedTemplate.titles[randomIndex];
  }

  // Fallback
  return `${categoryName}: Ghid complet de alegere`;
}

/**
 * Generează SVG relevant pentru keyword folosind AI
 */
async function generateRelevantSVG(
  keyword: string,
  categoryName: string,
  genAI: GoogleGenerativeAI
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 2000,
    }
  });

  const prompt = `Generează un SVG minimalist și elegant pentru ilustrarea articolului despre "${keyword}".

CONTEXT:
- Keyword: "${keyword}"
- Categorie: "${categoryName}"
- SVG va fi hero image pentru articolul de blog

CERINȚE SVG:
- ViewBox: "0 0 400 300"
- Stil: minimalist, modern, clean
- Paleta: portocaliu (#ea580c), amber (#f59e0b), gri (#78716c)
- Include iconițe/forme simple relevante pentru produs
- Gradient background subtil
- Text: "${categoryName}" centrat jos (font-size 18, weight bold)
- Fără detalii excesive, maxim 15-20 elemente SVG

EXEMPLE:
- Pentru "laptop": dreptunghi cu ecran, tastatură simplificată
- Pentru "căști": formă de căști circulare, unde sonore
- Pentru "mouse": formă ergonomică simplă cu 2-3 butoane
- Pentru "drone": 4 elice + corp central simplu

FORMAT:
Returnează DOAR codul SVG complet, optimizat, fără explicații.
SVG-ul trebuie să fie valid și să poată fi inline în HTML.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let svg = response.text().trim();

    // Extrage SVG din răspuns
    const svgMatch = svg.match(/<svg[\s\S]*<\/svg>/i);
    if (svgMatch) {
      svg = svgMatch[0];
    }

    // Curăță și validează
    if (!svg.includes('<svg')) {
      throw new Error('SVG invalid generat');
    }

    return svg;

  } catch (error) {
    console.error(`⚠️  Eroare la generarea SVG, folosesc fallback`);

    // SVG fallback simplu
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ea580c;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#grad)" opacity="0.1"/>
  <circle cx="200" cy="120" r="60" fill="#ea580c" opacity="0.3"/>
  <circle cx="200" cy="120" r="40" fill="#f59e0b" opacity="0.5"/>
  <text x="200" y="260" text-anchor="middle" font-size="18" font-weight="bold" fill="#78716c">${categoryName}</text>
</svg>`;
  }
}

/**
 * Generează articol complet pentru keyword
 */
async function generateArticle(
  keyword: Keyword,
  genAI: GoogleGenerativeAI
): Promise<ArticleWithSVG | null> {
  console.log(`\n📝 Generez articol: "${keyword.keyword}"...`);

  // Generează titlu natural
  const naturalTitle = generateNaturalTitle(keyword);
  console.log(`   📌 Titlu generat: "${naturalTitle}"`);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      maxOutputTokens: 8192,
    }
  });

  const prompt = `╔════════════════════════════════════════════════════════════════════╗
║  REGULA #1 ABSOLUTA: ZERO DIACRITICE IN INTREG ARTICOLUL!        ║
║  Scrie DOAR cu: a, e, i, o, u, s, t                               ║
║  NU folosi NICIODATA: ă, â, î, ș, ț                               ║
║  Exemple CORECTE: "in", "si", "pentru", "tine", "umiditate"      ║
║  Exemple GRESITE: "în", "și", "pentru", "ține", "umiditate"      ║
╚════════════════════════════════════════════════════════════════════╝

CONTEXT:
- Keyword SEO (pentru continut): "${keyword.keyword}"
- Categorie eMAG: "${keyword.categoryName}"
- Link categorie: ${keyword.categoryUrl}
- Subtag: "${keyword.subtag}"

REGULI STRICTE OBLIGATORII:
1. Titlul EXACT (natural si lizibil): "${naturalTitle}"
2. NU repeta titlul in continut, foloseste keyword-ul "${keyword.keyword}" natural in text
3. ZERO DIACRITICE in tot articolul - verifica de 3 ori inainte de a genera!

REGULI PENTRU LIZIBILITATE PERFECTA:
- PARAGRAFE SCURTE: maxim 2-3 propozitii per paragraf (50-80 cuvinte)
- Lasa rand gol intre paragrafe
- Evita blocuri mari de text
- Fiecare paragraf = o singura idee
- Propozitii simple si directe

ILUSTRATII SVG INLINE (OBLIGATORIU):
Adauga 2-3 ilustratii SVG minimalist inline direct in markdown, astfel:

<div class="article-illustration">
<svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-section-X" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d47a1;stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:#1976d2;stop-opacity:0.2" />
    </linearGradient>
  </defs>
  <rect width="400" height="250" fill="url(#grad-section-X)"/>
  <!-- Forme simple relevante pentru sectiune: iconite, grafice simple -->
  <text x="200" y="230" text-anchor="middle" font-size="14" fill="#0d47a1">[Titlu ilustratie]</text>
</svg>
</div>

Plaseaza ilustratiile:
1. Dupa sectiunea "Cum alegi" - ilustratie despre criterii
2. Dupa tabelul comparativ - ilustratie despre comparatie
3. Inainte de FAQ - ilustratie informativa

Caracteristici SVG:
- ViewBox: "0 0 400 250"
- Stil minimalist, forme geometrice simple
- Paleta: albastru (#0d47a1, #1976d2), max 10-15 elemente
- Fiecare SVG cu ID unic pentru gradient (grad-section-1, grad-section-2, etc.)
- Text descriptiv la baza SVG-ului

IMPORTANT - SCRIE CA UN OM ADEVĂRAT:
- Scrie natural, ca si cum ai fi un expert care recomanda produse prietenilor
- INTERZIS: "sa ne aventuram", "haideti sa exploram", "in peisajul", "in era digitala", "este esential sa"
- Foloseste propozitii variate: unele scurte (5-7 cuvinte), altele mai lungi
- Adauga experienta personala: "Am testat...", "Din experienta mea...", "In practica..."
- Fii sincer despre dezavantaje, nu doar laude
- Scrie ca pentru un blog personal de tech, NU ca o reclama

STRUCTURĂ ARTICOL (1500-1800 CUVINTE):

1. INTRODUCERE (150-200 cuvinte):
- Începe direct cu problema/nevoia
- De ce e important acest produs/categorie
- Ce va găsi cititorul în articol

2. CRITERII DE ALEGERE (250-300 cuvinte):
## Cum alegi ${keyword.categoryName.toLowerCase()}

- 5-7 criterii esențiale (bullet points)
- Fiecare explicat în 2-3 propoziții
- Sfaturi practice
- Mentioneaza natural "${keyword.keyword}" in context

3. TOP PRODUSE ${keyword.subtag.toUpperCase()} (600-700 cuvinte):
## Top ${keyword.categoryName} ${keyword.subtag === '2025' ? 'in 2025' : keyword.subtag}

Pentru FIECARE produs (4-6 produse REALE din Romania):
### [Brand + Model Specific Real]

[PARAGRAF DE 150-200 CUVINTE fara diacritice - SCRIS PROFESIONAL:
- Incepe cu ce este produsul si pentru cine este ideal
- Specific tehnic: putere (W), capacitate (L), dimensiuni, greutate
- Caracteristici SPECIFICE: nr. programe presetate, functii smart, tehnologii speciale
- Beneficii practice: ce rezolva, cum usureaza viata, economii (timp/energie)
- Pentru ce situatii/utilizatori este recomandat
- Ton conversational dar profesional, ca un expert care recomanda
- Mentiuni despre eficienta, usurinta utilizarii, rezultate practice
Scris ca un PARAGRAF CONTINUU normal, NU ca lista. Minim 3-4 propozitii, 150-200 cuvinte.]

**Avantaje:**
- [Punct forte real 1]
- [Punct forte real 2]
- [Punct forte real 3]
- [Punct forte real 4]

**Dezavantaje:**
- [Punct slab real 1]
- [Punct slab real 2]

**🔗 Linkuri utile:**
- [Verifica preturi](${keyword.categoryUrl})
- [Verifica oferte](${keyword.searchUrl})

╔═══════════════════════════════════════════════════════════╗
║ ATENTIE CRITICA - TEXTUL LINKURILOR TREBUIE SA FIE EXACT: ║
║                                                             ║
║  ✅ CORECT: "Verifica preturi" si "Verifica oferte"        ║
║  ❌ GRESIT: "Vezi preturi", "Compara preturi", etc.        ║
║                                                             ║
║  Verifica OBLIGATORIU ca ai scris exact aceste 2 texte!   ║
╚═══════════════════════════════════════════════════════════╝

IMPORTANTE - PRODUSE REALE SI DETALIATE:
- Branduri REALE: Samsung, Apple, Bosch, Philips, LG, Asus, Lenovo, Xiaomi, Cosori, Trotec, Ceresit, etc.
- Modele REALE cu nume complete si coduri (ex: "Samsung Galaxy S24 Ultra", "Cosori Dual Blaze TwinFry 10L")
- Specificatii tehnice EXACTE: putere in W, capacitate in L/kg, nr programe, functii
- NU inventa modele - foloseste doar produse care exista in Romania 2025
- Fiecare descriere sa fie UNICA si DETALIATA - 150-200 cuvinte de continut valoros

4. TABEL COMPARATIV:
## Comparatie rapida

| Produs | Rating | Ideal pentru |
|--------|--------|--------------|
| [Model 1] | [X/10] | [tip user] |
| [Model 2] | [X/10] | [tip user] |

IMPORTANT TABEL:
- NU pune coloana de pret
- DOAR 3 coloane: Produs, Rating, Ideal pentru
- Fara diacritice in header: "Comparatie rapida"

5. GHID DE UTILIZARE (200-250 cuvinte):
## Sfaturi de utilizare și întreținere

- Cum să folosești corect
- Greșeli de evitat
- Trucuri pentru durabilitate

6. FAQ (250-300 cuvinte):
## Întrebări frecvente

### [Întrebare relevantă 1]?
Răspuns concret în 2-3 propoziții.

[4-5 întrebări]

╔═══════════════════════════════════════════════════════════╗
║ ATENTIE CRITICA - TITLURILE FAQ FARA BOLD:                 ║
║                                                             ║
║  ❌ GRESIT: ### Cat de des trebuie golit **rezervorul**?   ║
║  ✅ CORECT: ### Cat de des trebuie golit rezervorul?       ║
║                                                             ║
║  TOATE titlurile H3 din FAQ trebuie scrise FARA **bold**! ║
║  Bold-ul se pune DOAR in raspunsuri, NU in intrebari!     ║
╚═══════════════════════════════════════════════════════════╝

7. PARAGRAFE FINALE (100-150 cuvinte):
NU pune titlu H2! Scrie direct 2-3 paragrafe finale ca text normal:

- Rezuma optiunile disponibile
- Recomandari clare per tip de utilizator
- NU pune link explicit de genul "Vezi mai multe optiuni pe eMAG: https://..."
- Linkurile sunt deja in sectiunea produselor, nu mai adauga altele
- Incheie natural, fara URL-uri vizibile

OPTIMIZARE SEO:
- Keyword "${keyword.keyword}": 6-8 ori natural, PUNE IN BOLD de fiecare data (ex: **${keyword.keyword}**)
- Subtag "${keyword.subtag}": 4-6 ori, pune in bold
- Cuvinte cheie secundare: pune in bold (ex: **dezumidificator**, **umiditate**, etc.)
- Paragrafe: max 3-4 propozitii
- Foloseste markdown bold (**text**) pentru toate cuvintele cheie importante

╔═══════════════════════════════════════════════════════════╗
║ REGULA CRITICA - FORMATARE TITLURI:                        ║
║                                                             ║
║  ❌ NU pune NICIODATA bold/strong in titluri (H1/H2/H3)   ║
║  ✅ Titlurile sunt deja formatate vizual, NU au nevoie     ║
║                                                             ║
║  Exemplu GRESIT:                                           ║
║  ### Cat de des trebuie sa golesc rezervorul **dezumidificatorului**? ║
║                                                             ║
║  Exemplu CORECT:                                           ║
║  ### Cat de des trebuie sa golesc rezervorul dezumidificatorului?     ║
║                                                             ║
║  Bold-ul se foloseste DOAR in paragrafe, NU in titluri!   ║
╚═══════════════════════════════════════════════════════════╝

FORMAT JSON:
{
  "title": "${keyword.keyword.charAt(0).toUpperCase() + keyword.keyword.slice(1)}",
  "description": "[meta SEO 150-160 caractere cu keyword si beneficiu - TEXT SIMPLU, FARA ** sau alte formatari markdown]",
  "content": "[articol markdown complet]",
  "tags": ["[tag1]", "[tag2]", "[tag3]", "[tag4]", "[tag5]"],
  "readingTime": 8
}

IMPORTANT PENTRU DESCRIPTION:
- Description este text SIMPLU pentru meta tag
- NU folosi ** pentru bold in description
- NU folosi alte formatari markdown in description
- Doar text curat, fara simboluri speciale de formatare

IMPORTANT - VALIDITATE JSON:
- Genereaza JSON VALID
- Toate newline-urile in string "content" TREBUIE escaped ca \\n
- Toate ghilimelele in string "content" TREBUIE escaped ca \\"
- Nu pune newline-uri literale in stringuri JSON
- Testeaza mental ca JSON-ul este valid inainte de a-l returna

Raspunde DOAR cu JSON valid, fara text extra, fara markdown code blocks.`;

  try {
    // Generează articol și SVG în paralel
    const [articleResult, svg] = await Promise.all([
      model.generateContent(prompt),
      generateRelevantSVG(keyword.keyword, keyword.categoryName, genAI)
    ]);

    const response = await articleResult.response;
    let text = response.text().trim();

    // Curăță JSON
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    // Sanitizează JSON - înlocuiește newline-uri literale cu \\n în string-uri
    // Această funcție fixează problema "Bad control character in string literal"
    function sanitizeJSON(jsonStr: string): string {
      // Split by quotes pentru a identifica string-urile
      const parts = jsonStr.split('"');
      for (let i = 1; i < parts.length; i += 2) {
        // Partea i este într-un string (între quotes)
        // Înlocuiește newline literal cu \\n
        parts[i] = parts[i].replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
      }
      return parts.join('"');
    }

    text = sanitizeJSON(text);

    // Parse JSON cu error handling
    let articleData;
    try {
      articleData = JSON.parse(text);
    } catch (e) {
      // Dacă JSON parsing eșuează, salvează pentru debug
      console.log('⚠️  JSON parsing eșuat, salvez pentru debug...');
      const fs = await import('fs');
      const path = await import('path');
      const debugPath = path.join(process.cwd(), 'debug-json-error.txt');
      fs.writeFileSync(debugPath, text, 'utf-8');
      console.log(`📝 JSON original salvat în: ${debugPath}`);
      throw e;
    }

    // IMPORTANT: Elimină diacritice din tot conținutul (failsafe)
    function removeDiacritics(text: string): string {
      return text
        .replace(/ă/g, 'a')
        .replace(/Ă/g, 'A')
        .replace(/â/g, 'a')
        .replace(/Â/g, 'A')
        .replace(/î/g, 'i')
        .replace(/Î/g, 'I')
        .replace(/ș/g, 's')
        .replace(/Ș/g, 'S')
        .replace(/ț/g, 't')
        .replace(/Ț/g, 'T');
    }

    // Aplică eliminarea diacriticelor pe toate câmpurile text
    articleData.title = removeDiacritics(articleData.title);
    articleData.description = removeDiacritics(articleData.description);
    articleData.content = removeDiacritics(articleData.content);
    if (articleData.tags) {
      articleData.tags = articleData.tags.map((tag: string) => removeDiacritics(tag));
    }

    // IMPORTANT: Curăță description de formatare markdown (pentru meta tags)
    articleData.description = articleData.description
      .replace(/\*\*/g, '') // Remove ** bold
      .replace(/\*/g, '')   // Remove * italic
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
      .replace(/#{1,6}\s/g, '') // Remove headers
      .trim();

    // Generează slug din titlul natural
    const slug = naturalTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const article: ArticleWithSVG = {
      id: keyword.id,
      keywordId: keyword.id,
      title: naturalTitle,  // Folosește titlul natural generat
      slug,
      description: articleData.description,
      content: articleData.content,
      heroSvg: svg, // SVG inline
      category: 'produse',
      categoryId: keyword.categoryId,
      categoryName: keyword.categoryName,  // Nume categorie pentru breadcrumb
      categoryUrl: keyword.categoryUrl,   // Link categorie eMAG
      searchUrl: keyword.searchUrl,       // Link search eMAG
      tags: articleData.tags || [keyword.categoryName.toLowerCase(), keyword.subtag, 'articol'],
      readingTime: articleData.readingTime || 8,
      publishedAt: new Date(),
      featured: keyword.subtag === '2025' // Featured dacă e keyword principal
    };

    console.log(`✅ Generat: ${article.title} (${svg.length} chars SVG)`);
    return article;

  } catch (error) {
    console.error(`❌ Eroare:`, error);
    return null;
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
  console.log('🚀 START - Generare articole cu SVG pentru keywords eMAG\n');
  console.log('═'.repeat(80));

  const apiKeys = loadApiKeys();
  if (apiKeys.length === 0) {
    console.error('❌ Nu există API keys în api.txt');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKeys[0]); // Folosește prima cheie

  // Citește keywords
  const keywordsPath = path.join(process.cwd(), 'data', 'emag-keywords.json');
  if (!fs.existsSync(keywordsPath)) {
    console.error('❌ Fișierul emag-keywords.json nu există!');
    console.log('💡 Rulează: npm run generate-keywords\n');
    return;
  }

  const allKeywords: Keyword[] = JSON.parse(fs.readFileSync(keywordsPath, 'utf-8'));

  // Opțiuni CLI
  const args = process.argv.slice(2);
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const startArg = args.find(arg => arg.startsWith('--start='));

  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 5;
  const start = startArg ? parseInt(startArg.split('=')[1]) : 0;

  const keywords = allKeywords.slice(start, start + limit);

  console.log(`📊 Total keywords: ${allKeywords.length}`);
  console.log(`🎯 Procesez: ${keywords.length} keywords (${start} → ${start + keywords.length})\n`);

  // Creează directoare
  const articlesDir = path.join(process.cwd(), 'data', 'keyword-articles');
  if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir, { recursive: true });
  }

  const articles: ArticleWithSVG[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];

    console.log(`\n[${i + 1}/${keywords.length}] ${keyword.keyword}`);

    const article = await generateArticle(keyword, genAI);

    if (article) {
      articles.push(article);

      // Salvează articol individual
      const articlePath = path.join(articlesDir, `${article.slug}.json`);
      fs.writeFileSync(articlePath, JSON.stringify(article, null, 2), 'utf-8');

      successCount++;
    } else {
      errorCount++;
    }

    // Pauză între requesturi (Gemini rate limit)
    if (i < keywords.length - 1) {
      console.log('⏳ Pauză 3 secunde...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Salvează index
  const indexPath = path.join(articlesDir, 'index.json');
  let allArticles = articles;

  if (fs.existsSync(indexPath)) {
    const existing = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    allArticles = [...existing, ...articles];
  }

  fs.writeFileSync(indexPath, JSON.stringify(allArticles, null, 2), 'utf-8');

  console.log('\n═'.repeat(80));
  console.log(`\n✅ Succes: ${successCount} articole`);
  console.log(`❌ Erori: ${errorCount}`);
  console.log(`📊 Total în index: ${allArticles.length} articole`);
  console.log(`\n💾 Salvat în: ${articlesDir}`);

  if (start + limit < allKeywords.length) {
    console.log(`\n💡 Pentru a continua:`);
    console.log(`   npm run generate-keyword-articles -- --start=${start + limit} --limit=5\n`);
  } else {
    console.log(`\n🎉 Toate keywords au fost procesate!`);
  }

  console.log('✨ DONE!\n');
}

main().catch(console.error);
