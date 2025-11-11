# Workflow Complet - Generare Articole eMAG

## 📋 Prezentare Generală

Sistem automat pentru generarea a **~9,110 articole** (5 articole × 1,822 categorii) cu:
- ✅ Keywords relevante generate cu AI
- ✅ SVG illustrations inline (fără fișiere separate)
- ✅ Sub limita Cloudflare Pages (20,000 fișiere)
- ✅ Scriptul Profitshare convertește automat linkurile în afiliate

## 🎯 Calculul Final

```
1,822 categorii × 5 articole/categorie = 9,110 articole HTML
+ 500 assets (CSS, JS, fonts, etc.)
─────────────────────────────────────────────────────
= 9,610 fișiere ✅ SUB LIMITA 20,000
```

## 🚀 Pași Completi (Prima Dată)

### 1. Pregătire Inițială

```bash
# Verifică că ai CSV-ul cu categorii
ls emag_category_links.csv  # 1,822 categorii

# Verifică cheia API Gemini în .env
cat .env
# GEMINI_API_KEY=your_key_here
```

### 2. Procesare Categorii (DOAR PRIMA DATĂ)

```bash
# Convertește CSV → JSON structurat
npm run process-emag-categories

# Output: data/emag-categories.json (1,822 categorii)
```

### 3. Generare Subtag-uri cu AI

**IMPORTANT**: Procesul durează ~2 ore pentru toate categoriile (rate limits Gemini)

```bash
# Procesează primele 50 categorii (test)
npm run generate-subtags -- --start=0 --limit=50

# Output: data/emag-categories-with-subtags.json

# Pentru fiecare categorie, AI generează 5 subtag-uri relevante:
# Ex: "laptop" → ["pentru gaming", "ultraportabil", "pentru programare", "ieftin", "business"]
```

**Continuare în batch-uri:**

```bash
# Batch 2
npm run generate-subtags -- --start=50 --limit=50

# Batch 3
npm run generate-subtags -- --start=100 --limit=50

# ... până la 1,822

# SAU folosește un loop:
for i in {0..1800..50}; do
  npm run generate-subtags -- --start=$i --limit=50
  sleep 5
done
```

### 4. Generare Keywords

```bash
# Generează 5 keywords per categorie (instant, fără API calls)
npm run generate-keywords

# Output:
# - data/emag-keywords.json (9,110 keywords)
# - data/emag-keywords-grouped.json (grupate pe categorii)
# - data/emag-keywords.csv (pentru referință)

# Exemple generate:
# "cel mai bun laptop 2025"
# "cel mai bun laptop pentru gaming"
# "cel mai bun laptop ultraportabil"
# "cel mai bun laptop pentru programare"
# "cel mai bun laptop ieftin"
```

### 5. Generare Articole cu SVG

**IMPORTANT**: Procesul durează ~7-8 ore pentru toate articolele (rate limits Gemini)

```bash
# Test cu primele 5 keywords
npm run generate-keyword-articles -- --start=0 --limit=5

# Output: data/keyword-articles/
# - {slug}.json pentru fiecare articol
# - index.json cu toate articolele

# Fiecare articol include:
# - content: markdown complet (1500-1800 cuvinte)
# - heroSvg: SVG inline relevant generat cu AI
# - tags, description, metadata
```

**Continuare în batch-uri:**

```bash
# Batch-uri de câte 10 articole
npm run generate-keyword-articles -- --start=0 --limit=10
npm run generate-keyword-articles -- --start=10 --limit=10
npm run generate-keyword-articles -- --start=20 --limit=10

# SAU loop automat (overnight):
for i in {0..9100..10}; do
  npm run generate-keyword-articles -- --start=$i --limit=10
  sleep 5
done
```

### 6. Verificare și Deploy

```bash
# Verifică articolele generate
ls data/keyword-articles/*.json | wc -l
# Ar trebui să fie 9,110

# Pornește dev server
npm run dev

# Accesează:
# http://localhost:4321/categorii-emag (categorii cu progress bar)
# http://localhost:4321/articole/{slug} (articole individuale)

# Build pentru producție
npm run build

# Verifică numărul de fișiere
find dist -type f | wc -l
# Ar trebui să fie < 20,000

# Deploy pe Cloudflare Pages
# (push la git sau drag & drop folder dist/)
```

## ⚡ Workflow Rapid (După Prima Generare)

Dacă ai deja subtag-uri generate și vrei doar să adaugi articole noi:

```bash
# 1. Verifică keywords existente
cat data/emag-keywords.json

# 2. Generează doar articolele lipsă
npm run generate-keyword-articles -- --start=100 --limit=50

# 3. Build și deploy
npm run build
```

## 📊 Monitorizare Progres

### Verifică câte categorii au subtag-uri:
```bash
node -e "console.log(require('./data/emag-categories-with-subtags.json').length)"
```

### Verifică câte keywords sunt generate:
```bash
node -e "console.log(require('./data/emag-keywords.json').length)"
```

### Verifică câte articole sunt generate:
```bash
node -e "console.log(require('./data/keyword-articles/index.json').length)"
```

## 🎨 Despre SVG-urile Generate

- **Inline în HTML** (nu fișiere separate) → economisește din limita 20k
- **Generate cu AI** relevant pentru fiecare keyword
- **Minimalist** și modern (portocaliu/amber/gri)
- **Optimizate** pentru încărcare rapidă

Exemplu SVG pentru "cel mai bun laptop pentru gaming":
```svg
<svg viewBox="0 0 400 300">
  <defs>
    <linearGradient id="grad">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <!-- Laptop shape -->
  <rect x="100" y="80" width="200" height="120" fill="#1a1a1a"/>
  <!-- Screen glow -->
  <rect x="105" y="85" width="190" height="80" fill="url(#grad)" opacity="0.3"/>
  <!-- Text -->
  <text x="200" y="260" text-anchor="middle" font-weight="bold">Laptop</text>
</svg>
```

## 🔧 Troubleshooting

### Eroare: "GEMINI_API_KEY nu este setat"
```bash
# Creează .env dacă nu există
cp .env.example .env

# Adaugă cheia API
echo "GEMINI_API_KEY=your_key_here" >> .env
```

### Eroare: Rate limit exceeded
```bash
# Așteaptă 1 minut și reîncearcă
# SAU crește delay-ul în script de la 3s la 5s
```

### Articole prea puține generate
```bash
# Verifică erorile în console
# Verifică că toate scripturile anterioare au rulat cu succes
```

## 📈 Estimări Timp

| Pas | Timp Estimat | Note |
|-----|--------------|------|
| Procesare categorii | 5 secunde | Run once |
| Generare subtag-uri | ~2 ore | 1,822 × 2s + API delay |
| Generare keywords | 2 secunde | No API calls |
| Generare articole | ~7-8 ore | 9,110 × 3s + API delay |
| **TOTAL FIRST RUN** | **~10 ore** | Poate fi rulat overnight |

## 💡 Tips

1. **Rulează overnight**: Generarea completă poate fi lăsată să ruleze peste noapte
2. **Batch processing**: Procesează în batch-uri de 50-100 pentru control mai bun
3. **Verifică progresul**: Folosește comenzile de monitorizare pentru a vedea progresul
4. **Backup**: Fă backup la `data/` după fiecare pas important
5. **Test local**: Testează cu `npm run dev` înainte de deploy

## 🎯 Next Steps

După generarea articolelor:
1. ✅ Verifică calitatea articolelor generate
2. ✅ Customizează template-ul de afișare
3. ✅ Adaugă imagini reale de produse (opțional)
4. ✅ Optimizează SEO metadata
5. ✅ Submit sitemap la Google Search Console
