import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Keyword, Article, Category } from '../types/article';

// Inițializare client Gemini
// IMPORTANT: Adaugă cheia API în fișierul .env ca GEMINI_API_KEY
let genAI: GoogleGenerativeAI | null = null;

export function initializeGemini(apiKey: string) {
  genAI = new GoogleGenerativeAI(apiKey);
}

// Funcție pentru a genera un articol complet din keyword-uri
export async function generateArticle(
  keyword: Keyword,
  category: Category
): Promise<Partial<Article>> {
  if (!genAI) {
    throw new Error('Gemini AI nu este inițializat. Rulați initializeGemini() mai întâi.');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',  // Model gratuit 2025
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    }
  });

  // Prompt ultra-optimizat pentru scriere umană și SEO
  const prompt = `Scrie un articol complet în limba română despre "${keyword.keyword}".

REGULI STRICTE PENTRU TITLU:
- Titlul TREBUIE să fie EXACT: "${keyword.keyword}" (folosește exact acest text, cu majuscule și minuscule ca în exemplu)
- Nu adăuga nimic înainte sau după keyword

REGULI PENTRU SCRIERE UMANĂ (FOARTE IMPORTANT):
- Scrie natural, ca și cum ai povesti unui prieten
- EVITĂ complet clișeele AI: "să ne aventurăm", "haideți să explorăm", "în peisajul", "în era digitală", "este esențial să", etc.
- Folosește propoziții variate: unele scurte, altele mai lungi
- Adaugă experiențe practice și exemple concrete
- Folosește humor ușor când e potrivit
- Fii direct și sincer, inclusiv despre dezavantajele produselor

STRUCTURĂ ARTICOL (1200-1800 CUVINTE):

1. INTRODUCERE (150-200 cuvinte):
- Începe direct cu problema pe care o rezolvă produsul
- Folosește "${keyword.keyword}" natural în primele 2 propoziții
- Explică rapid de ce cineva ar căuta acest produs
- Fii empatic cu nevoia utilizatorului

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

5. GHID DE UTILIZARE / ÎNTREȚINERE (200-250 cuvinte):
## Cum să folosești și să întreții [keyword]
- Sfaturi practice în bullet points
- Greșeli comune de evitat
- Trucuri pentru durabilitate

6. ÎNTREBĂRI FRECVENTE (250-300 cuvinte):
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
- Vorbe ște la persoana a 2-a (tu/voi) când te adresezi cititorului
- Folosește exemple concrete: "Am testat...", "În practică...", "Dacă..."
- Fii sincer despre prețuri și calitate
- Evită superlativele excesive
- Recunoaște când un produs nu e pentru toată lumea

BRAND-URI ȘI MODELE:
- Folosește DOAR branduri și modele REALE, populare în România (Samsung, LG, Bosch, Philips, etc.)
- Menționează modele specifice cu nume complete (ex: "Samsung Galaxy A54" nu doar "Samsung")
- Prețuri realiste pentru piața din România

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
    const response = await result.response;
    const text = response.text();

    // Parse JSON din răspuns
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Răspunsul nu conține un JSON valid');
    }

    const articleData = JSON.parse(jsonMatch[0]);

    // Generare slug
    const slug = keyword.keyword
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    return {
      title: articleData.title,
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
        url: '#' // Utilizatorul va adăuga URL-urile afiliate reale
      }))
    };
  } catch (error) {
    console.error('Eroare la generarea articolului:', error);
    throw error;
  }
}

// Funcție pentru a genera doar un titlu și descriere (pentru preview rapid)
export async function generateArticlePreview(
  keyword: string
): Promise<{ title: string; description: string }> {
  if (!genAI) {
    throw new Error('Gemini AI nu este inițializat.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
Generează un titlu și o descriere scurtă pentru un articol despre "${keyword}" într-un blog de tehnologie.

FORMAT JSON:
{
  "title": "Titlul articolului (50-60 caractere)",
  "description": "Meta descriere (150-160 caractere)"
}

Răspunde DOAR cu JSON-ul, fără text suplimentar.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Răspunsul nu conține un JSON valid');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Eroare la generarea preview:', error);
    throw error;
  }
}

// Funcție pentru a optimiza un articol existent
export async function optimizeArticle(
  content: string,
  focusKeyword: string
): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini AI nu este inițializat.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
Optimizează următorul articol pentru cuvântul cheie "${focusKeyword}":

${content}

SARCINI:
1. Îmbunătățește structura și claritatea
2. Adaugă secțiuni lipsă dacă e cazul
3. Optimizează pentru SEO fără să exagerezi cu keyword-ul
4. Îmbunătățește call-to-action-urile
5. Asigură-te că toate informațiile sunt precise și utile

Răspunde cu articolul optimizat în format markdown.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Eroare la optimizarea articolului:', error);
    throw error;
  }
}
