import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Încarcă variabilele de mediu
dotenv.config();

interface EmagCategory {
  id: string;
  name: string;
  url: string;
  hasArticle: boolean;
  articleSlug?: string;
}

interface GeneratedArticle {
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  categoryId: string;
  emagUrl: string;
  tags: string[];
  readingTime: number;
  publishedAt: Date;
  featured: boolean;
}

/**
 * Generează articol tip "Cele mai bune X" pentru o categorie eMAG
 */
async function generateCategoryArticle(
  category: EmagCategory,
  genAI: GoogleGenerativeAI
): Promise<GeneratedArticle | null> {
  console.log(`\n📝 Generez articol pentru: ${category.name}...`);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      maxOutputTokens: 8192,
    }
  });

  const keyword = `Cele mai bune ${category.name.toLowerCase()}`;

  const prompt = `Scrie un articol complet în limba română despre "${keyword}" - un ghid de cumpărare pentru produse din categoria "${category.name}" de pe eMAG.

REGULI STRICTE PENTRU TITLU:
- Titlul TREBUIE să fie: "Cele mai bune ${category.name} - Ghid de cumpărare 2025"

CONTEXT SPECIFIC:
- Categoria eMAG: ${category.name}
- Link categorie: ${category.url}
- Acest articol ajută utilizatorii să aleagă cele mai bune produse din această categorie

REGULI PENTRU SCRIERE UMANĂ (FOARTE IMPORTANT):
- Scrie natural, ca și cum ai povesti unui prieten
- EVITĂ clișeele AI: "să ne aventurăm", "haideți să explorăm", "în peisajul", "în era digitală"
- Folosește propoziții variate: unele scurte, altele mai lungi
- Adaugă experiențe practice și exemple concrete
- Fii direct și sincer, inclusiv despre dezavantajele produselor

STRUCTURĂ ARTICOL (1500-2000 CUVINTE):

1. INTRODUCERE (150-200 cuvinte):
- Începe direct cu problema pe care o rezolvă categoria de produse
- Explică de ce este important să alegi corect
- Prezintă pe scurt ce va găsi cititorul în articol

2. CRITERII DE ALEGERE (250-300 cuvinte):
## Cum alegi cele mai bune ${category.name}

- 5-7 criterii esențiale în format bullet points
- Fiecare criteriu explicat în 2-3 propoziții
- Sfaturi practice pentru evaluare

3. TOP PRODUSE RECOMANDATE (600-700 cuvinte):
## Top ${category.name} recomandate în 2025

Pentru FIECARE produs (4-6 produse REALE):
### [Nume Brand + Model Specific]
**Preț aproximativ**: [range realist în RON pentru piața RO]

- **Pentru cine este ideal**: [descriere specifică]
- **Puncte forte**:
  - [avantaj 1]
  - [avantaj 2]
  - [avantaj 3]
- **Puncte slabe**:
  - [dezavantaj real 1]
  - [dezavantaj real 2]
- **Verdict**: O propoziție scurtă și clară

4. TABEL COMPARATIV:
## Comparație rapidă

| Produs | Preț (RON) | Rating | Ideal pentru |
|--------|------------|--------|-------------|
| [Brand Model 1] | [preț] | [X/10] | [tip utilizator] |
| [Brand Model 2] | [preț] | [X/10] | [tip utilizator] |

5. GHID DE UTILIZARE (200-250 cuvinte):
## Sfaturi de utilizare și întreținere

- Cum să folosești corect produsele
- Greșeli comune de evitat
- Trucuri pentru durabilitate

6. ÎNTREBĂRI FRECVENTE (250-300 cuvinte):
## Întrebări frecvente (FAQ)

### [Întrebare practică 1]?
Răspuns direct în 2-3 propoziții.

[4-5 întrebări relevante pentru categoria de produse]

7. CONCLUZIE (100-150 cuvinte):
## Concluzia noastră

- Recomandare clară pentru diferite tipuri de utilizatori
- Call-to-action natural: "Vezi toate produsele din categoria ${category.name} pe eMAG"

BRAND-URI ȘI MODELE:
- Folosește DOAR branduri REALE populare în România
- Modele specifice cu nume complete (ex: "Bosch Serie 6 WAU28R90BY")
- Prețuri REALISTE pentru piața din România 2025
- Nu inventa modele inexistente

OPTIMIZARE SEO:
- Keyword principal: "${keyword}" (folosit 6-8 ori natural)
- Categoria "${category.name}" menționată des
- Paragrafe de maxim 3-4 propoziții
- Subtitluri clare cu ## și ###

FORMAT JSON pentru răspuns:
{
  "title": "Cele mai bune ${category.name} - Ghid de cumpărare 2025",
  "description": "[meta descriere SEO 150-160 caractere care include categoria și beneficiul]",
  "content": "[articol complet în markdown cu toate secțiunile]",
  "tags": ["[tag1]", "[tag2]", "[tag3]", "[tag4]", "[tag5]"],
  "readingTime": 9
}

Răspunde DOAR cu JSON-ul, fără text înaintea sau după el.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Curăță textul de markdown code blocks
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    // Parse JSON
    const articleData = JSON.parse(cleanText);

    // Generare slug
    const slug = `cele-mai-bune-${category.id}`;

    const article: GeneratedArticle = {
      title: articleData.title,
      slug,
      description: articleData.description,
      content: articleData.content,
      category: 'emag',
      categoryId: category.id,
      emagUrl: category.url,
      tags: articleData.tags || [category.name.toLowerCase(), 'ghid', 'emag', '2025'],
      readingTime: articleData.readingTime || 9,
      publishedAt: new Date(),
      featured: false
    };

    console.log(`✅ Articol generat: ${article.title}`);
    return article;

  } catch (error) {
    console.error(`❌ Eroare la generarea articolului pentru ${category.name}:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 START - Generare articole pentru categorii eMAG\n');
  console.log('═'.repeat(80));

  // Verifică cheia API
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY nu este setat în fișierul .env');
    console.log('\n💡 Pași pentru a obține cheia API:');
    console.log('   1. Vizitează: https://aistudio.google.com/apikey');
    console.log('   2. Creează o cheie API nouă');
    console.log('   3. Adaugă-o în .env: GEMINI_API_KEY=your_key_here\n');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Citește categoriile
  const categoriesPath = path.join(process.cwd(), 'data', 'emag-categories.json');
  const categories: EmagCategory[] = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));

  // Opțiuni din command line
  const args = process.argv.slice(2);
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const startArg = args.find(arg => arg.startsWith('--start='));

  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10;
  const start = startArg ? parseInt(startArg.split('=')[1]) : 0;

  const categoriesToProcess = categories.slice(start, start + limit);

  console.log(`\n📊 Total categorii: ${categories.length}`);
  console.log(`🎯 Procesez: ${categoriesToProcess.length} categorii (de la ${start} la ${start + categoriesToProcess.length})\n`);

  // Creează directorul pentru articole generate
  const articlesDir = path.join(process.cwd(), 'data', 'generated-articles');
  if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir, { recursive: true });
  }

  const generatedArticles: GeneratedArticle[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < categoriesToProcess.length; i++) {
    const category = categoriesToProcess[i];

    console.log(`\n[${i + 1}/${categoriesToProcess.length}] ${category.name}`);

    const article = await generateCategoryArticle(category, genAI);

    if (article) {
      generatedArticles.push(article);

      // Salvează articolul individual
      const articlePath = path.join(articlesDir, `${article.slug}.json`);
      fs.writeFileSync(articlePath, JSON.stringify(article, null, 2), 'utf-8');

      // Actualizează categoria
      category.hasArticle = true;
      category.articleSlug = article.slug;

      successCount++;
    } else {
      errorCount++;
    }

    // Pauză între requesturi (respectă rate limits)
    if (i < categoriesToProcess.length - 1) {
      console.log('⏳ Pauză 3 secunde...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Actualizează fișierul de categorii
  fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2), 'utf-8');

  // Salvează indexul de articole
  const indexPath = path.join(articlesDir, 'index.json');
  const existingIndex = fs.existsSync(indexPath)
    ? JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
    : [];

  const updatedIndex = [...existingIndex, ...generatedArticles];
  fs.writeFileSync(indexPath, JSON.stringify(updatedIndex, null, 2), 'utf-8');

  console.log('\n═'.repeat(80));
  console.log(`\n✅ Succes: ${successCount} articole`);
  console.log(`❌ Erori: ${errorCount}`);
  console.log(`\n💾 Articole salvate în: ${articlesDir}`);
  console.log(`📋 Index actualizat: ${indexPath}`);

  console.log('\n💡 Pentru a genera mai multe articole:');
  console.log(`   npm run generate-category-articles -- --start=${start + limit} --limit=10\n`);
  console.log('✨ DONE!\n');
}

main().catch(console.error);
