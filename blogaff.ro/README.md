# TechGadget Blog - Blog de Afiliere cu Generare Automată de Conținut

Blog modern pentru articole de tehnologie și gadget-uri, cu generare automată de conținut folosind Google Gemini AI.

## Stack Tehnologic

- **Framework**: Astro 5
- **Styling**: Tailwind CSS 4
- **AI**: Google Gemini API (versiunea gratuită)
- **TypeScript**: Pentru type safety
- **Node.js**: Pentru scripturi de generare

## Caracteristici

- Design modern și responsive (optimizat pentru toate dispozitivele mobile)
- Paletă de culori caldă și profesională (portocaliu/maro)
- Sistem complet de categorii și tag-uri
- Generare automată de articole cu Gemini AI
- Extractare automată de cuvinte cheie din diverse surse
- Link-uri afiliate integrate
- SEO-friendly
- Performanță excelentă

## Instalare și Configurare

### 1. Instalează dependințele

\`\`\`bash
npm install
\`\`\`

### 2. Configurează Gemini API

Creează un fișier `.env` în root:

\`\`\`bash
cp .env.example .env
\`\`\`

Obține o cheie API gratuită de la [Google AI Studio](https://makersuite.google.com/app/apikey) și adaugă-o în `.env`:

\`\`\`
GEMINI_API_KEY=your_api_key_here
\`\`\`

### 3. Pornește serverul de development

\`\`\`bash
npm run dev
\`\`\`

Accesează aplicația la: http://localhost:4321

## Workflow de Generare Articole

### Pasul 1: Extrage Cuvinte Cheie

Poți obține cuvinte cheie din mai multe surse:

- **Google Keyword Planner** (export CSV)
- **Ahrefs / SEMrush** (export CSV)
- **Google Trends** (copie/paste în TXT)
- **Manual** (creează un fișier TXT sau JSON)

**Exemplu cu fișier TXT:**

Creează `data/my-keywords.txt`:
\`\`\`
cele mai bune smartphone-uri 2025
laptop programare 2025
căști wireless noise cancelling
accesorii macbook pro m3
\`\`\`

**Exemplu cu fișier CSV:**

Creează `data/my-keywords.csv`:
\`\`\`csv
keyword,volume
cele mai bune smartphone-uri 2025,5400
laptop programare 2025,3200
căști wireless noise cancelling,8100
\`\`\`

**Procesează cuvintele cheie:**

\`\`\`bash
npm run extract-keywords data/my-keywords.txt data/keywords.json
\`\`\`

Acest script va:
- Detecta automat categoriile
- Genera tag-uri relevante
- Crea un fișier JSON formatat

### Pasul 2: Revizuiește Cuvintele Cheie

Deschide `data/keywords.json` și ajustează dacă e necesar:

\`\`\`json
[
  {
    "keyword": "cele mai bune smartphone-uri 2025",
    "category": "smartphone",
    "tags": ["smartphone", "review", "2025", "ghid"],
    "searchVolume": 5400
  }
]
\`\`\`

### Pasul 3: Generează Articole

\`\`\`bash
npm run generate-article data/keywords.json generated-articles
\`\`\`

Scriptul va:
- Genera un articol complet pentru fiecare keyword
- Salva articolele în format JSON în folderul specificat
- Include titlu, descriere, conținut, tag-uri și sugestii de produse afiliate
- Face pauze între requesturi pentru a respecta rate limit-ul

### Pasul 4: Integrează Articolele în Blog

Articolele generate sunt salvate în format JSON. Pentru a le integra în blog, poți:

1. **Manual**: Copiază conținutul în `src/data/sampleData.ts`
2. **Automat**: Creează un script pentru import automat (viitor)

## Structura Proiectului

\`\`\`
blogaff.ro/
├── src/
│   ├── components/        # Componente reutilizabile
│   │   └── ArticleCard.astro
│   ├── layouts/           # Layout-uri
│   │   └── Layout.astro
│   ├── pages/             # Pagini și rute
│   │   ├── index.astro
│   │   ├── articole/
│   │   │   └── [slug].astro
│   │   └── categorii/
│   │       ├── index.astro
│   │       └── [slug].astro
│   ├── styles/            # Stiluri globale
│   │   └── global.css
│   ├── types/             # Tipuri TypeScript
│   │   └── article.ts
│   ├── utils/             # Utilitare
│   │   └── gemini.ts
│   └── data/              # Date statice
│       └── sampleData.ts
├── scripts/               # Scripturi CLI
│   ├── extractKeywords.ts
│   └── generateArticle.ts
├── data/                  # Fișiere de date
│   └── keywords-example.json
└── generated-articles/    # Articole generate
\`\`\`

## Comenzi Disponibile

| Comandă | Descriere |
|---------|-----------|
| \`npm run dev\` | Pornește serverul de development |
| \`npm run build\` | Build pentru producție |
| \`npm run preview\` | Preview build de producție |
| \`npm run extract-keywords\` | Extrage și procesează cuvinte cheie |
| \`npm run generate-article\` | Generează articole cu Gemini AI |

## Categorii Disponibile

- **Smartphone** - Review-uri și comparații smartphone-uri
- **Laptopuri** - Ghiduri de cumpărare laptopuri
- **Accesorii** - Accesorii și gadget-uri tech
- **Audio** - Căști, boxe și echipamente audio

Poți adăuga categorii noi în `src/data/sampleData.ts`.

## Customizare

### Culori

Editează `src/styles/global.css` pentru a schimba paleta de culori:

\`\`\`css
@theme {
  --color-primary: #ea580c;        /* Portocaliu principal */
  --color-primary-dark: #c2410c;   /* Portocaliu închis */
  --color-secondary: #92400e;      /* Maro */
  --color-accent: #f59e0b;         /* Accent galben-portocaliu */
}
\`\`\`

### Layout și Design

Toate componentele și layout-urile sunt în `src/components/` și `src/layouts/`.

### Prompt-uri Gemini

Pentru a customiza conținutul generat, editează prompt-urile în `src/utils/gemini.ts`.

## SEO și Performanță

- Toate paginile au meta tags optimizate
- Imagini lazy-loaded
- Design responsive și mobile-first
- Structură HTML semantică
- URLs SEO-friendly

## Link-uri Afiliate

Adaugă URL-urile afiliate în articolele generate:

1. Generează articolul cu Gemini
2. Deschide fișierul JSON generat
3. Actualizează \`affiliateLinks[].url\` cu URL-urile tale afiliate
4. Adaugă \`price\` dacă dorești

## Tips și Best Practices

### Pentru Generarea de Conținut

- Folosește keyword-uri specifice și long-tail pentru rezultate mai bune
- Include volume de căutare pentru a prioritiza cuvintele cheie
- Revizuiește mereu articolele generate înainte de publicare
- Adaugă imagini relevante pentru fiecare articol

### Pentru SEO

- Fiecare articol ar trebui să aibă 1500-2500 cuvinte
- Include link-uri interne către alte articole
- Actualizează regular articolele vechi
- Monitorizează performanța în Google Search Console

### Pentru Rate Limit Gemini

API-ul gratuit Gemini are rate limits:
- 60 requests per minute
- 1500 requests per day

Scriptul include pauze de 5 secunde între articole pentru a respecta aceste limite.

## Deploy

Pentru a deploya blogul:

\`\`\`bash
npm run build
\`\`\`

Folderul \`dist/\` va conține site-ul static. Poți deploya pe:
- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages
