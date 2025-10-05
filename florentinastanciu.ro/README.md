# Florentina Stanciu – Make-up & Lami Artist

Website de prezentare profesional pentru servicii de machiaj și laminare gene.

## 📋 Structura Proiectului

```
florentinastanciu.ro/
├── index.html          # Pagina principală
├── styles.css          # Stiluri CSS custom
├── script.js           # Funcționalități JavaScript
└── README.md           # Documentație
```

## 🎨 Tehnologii Utilizate

- **HTML5** - Structură semantică
- **CSS3** - Stiluri custom și animații
- **Tailwind CSS** - Framework CSS utility-first
- **Flowbite** - Componente UI bazate pe Tailwind
- **JavaScript (Vanilla)** - Interactivitate și animații

## 🎨 Paletă de Culori

### Fundaluri Deschise (Cream)
- `#fffae7` - Cream 50
- `#fffadb` - Cream 100
- `#fffdd0` - Cream 200
- `#fff7ca` - Cream 300
- `#f2e6c1` - Cream 400

### Accente (Rose)
- `#f5efeb` - Rose 50
- `#e7e0e1` - Rose 100
- `#e7e0d8` - Rose 200
- `#d5b69a` - Rose 300
- `#cfb195` - Rose 400
- `#c9ab8f` - Rose 500
- `#c9a686` - Rose 600
- `#c5a17c` - Rose 700

## 📱 Secțiuni Website

### 1. **Hero Section**
- Imagine elegantă de fundal
- Titlu principal cu numele artistului
- Subtitlu descriptiv
- Call-to-action button
- Indicator de scroll animat

### 2. **Galerie**
- Grid responsiv pentru desktop, tabletă și mobil
- Suport pentru imagini orizontale și verticale
- Hover effects subtile
- Lightbox pentru vizualizare mărită
- Animații la scroll

### 3. **Servicii**
- 4 carduri elegante pentru servicii:
  - Machiaj de Mireasă
  - Laminare Gene
  - Machiaj Ocazii Speciale
  - Cursuri & Workshop-uri
- Iconițe SVG personalizate
- Hover effects și animații

### 4. **Despre Mine**
- Layout text + imagine
- Poziționare imagine pe stânga
- Conținut biografic profesionist
- Design elegant și feminin
- Elemente decorative

### 5. **Contact**
- Text introductiv
- Buton elegant către Instagram
- Preview grid Instagram (4 imagini)
- Hover effects pe imagini
- Design gradient pentru butonul Instagram

### 6. **Footer**
- Informații copyright
- Design simplu și elegant
- Culori dark (rose-900)

## ⚡ Funcționalități JavaScript

### Navbar
- Efect semi-transparent la scroll
- Meniu hamburger funcțional pe mobil
- Smooth scroll pentru navigare
- Închidere automată meniu mobil la click

### Galerie
- Lightbox pentru imagini
- Animații smooth la deschidere/închidere
- Suport ESC pentru închidere
- Click outside pentru închidere

### Animații
- Scroll reveal pentru secțiuni
- Fade-in effects
- Hover transitions
- Smooth scrolling

### Optimizare
- Lazy loading pentru imagini
- Debounce pentru scroll events
- Throttle pentru resize events
- Intersection Observer pentru animații

## 🚀 Instalare și Utilizare

### Rulare Locală

1. **Clonează sau descarcă proiectul**

2. **Deschide fișierul `index.html` în browser**
   - Dublu-click pe `index.html`, sau
   - Folosește un server local:

   ```bash
   # Cu Python 3
   python -m http.server 8000

   # Cu Node.js (http-server)
   npx http-server

   # Cu PHP
   php -S localhost:8000
   ```

3. **Accesează în browser**
   - Dacă folosești server local: `http://localhost:8000`

## 📝 Personalizare

### Schimbarea Imaginilor

Pentru a înlocui imaginile placeholder cu imagini reale:

1. **Hero Background** - Linia 69 în `index.html`:
   ```html
   <div class="absolute inset-0 opacity-30 bg-cover bg-center" style="background-image: url('imagini/hero-bg.jpg');"></div>
   ```

2. **Galerie** - Înlocuiește URL-urile Unsplash cu propriile imagini
   ```html
   <img src="imagini/galerie/machiaj-1.jpg" alt="Descriere">
   ```

3. **Despre** - Linia 247 în `index.html`
   ```html
   <img src="imagini/florentina-portrait.jpg" alt="Florentina Stanciu">
   ```

### Schimbarea Textelor

Toate textele sunt editabile direct în `index.html`. Caută comentariile HTML pentru fiecare secțiune:

```html
<!-- ============================================
     NUME SECȚIUNE
============================================= -->
```

### Modificarea Culorilor

Culorile sunt definite în configurația Tailwind din `index.html` (liniile 25-47). Pentru a schimba paleta:

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                cream: {
                    50: '#noua-culoare',
                    // ...
                },
                rose: {
                    300: '#noua-culoare',
                    // ...
                }
            }
        }
    }
}
```

### Link Instagram

Actualizează link-ul Instagram pe linia 329 în `index.html`:

```html
<a href="https://instagram.com/USERNAME_TAU" target="_blank">
```

## 🎯 Features

✅ **100% Responsive** - Perfect pe desktop, tabletă și mobil
✅ **Navbar Fix** - Rămâne vizibil la scroll
✅ **Meniu Hamburger** - Funcțional perfect pe mobil
✅ **Galerie Flexibilă** - Suport imagini orizontale și verticale
✅ **Lightbox** - Vizualizare mărită pentru imagini
✅ **Animații Smooth** - Scroll reveal și hover effects
✅ **SEO Friendly** - Meta tags și structură semantică
✅ **Accessible** - ARIA labels și focus states
✅ **Fast Loading** - Lazy loading și optimizări
✅ **Clean Code** - Comentarii clare și organizare logică

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔧 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 Licență

© 2025 Florentina Stanciu. Toate drepturile rezervate.

## 🤝 Contact

Pentru întrebări sau suport tehnic, contactează-mă pe Instagram.

---

**Dezvoltat cu ❤️ folosind Tailwind CSS & Flowbite**
