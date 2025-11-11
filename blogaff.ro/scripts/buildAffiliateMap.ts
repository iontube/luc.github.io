import * as fs from 'fs';
import * as path from 'path';

/**
 * Construiește maparea pentru linkuri afiliate bazat pe categoriile eMAG reale
 */

// Mapare keywords pentru subcategorii eMAG
const subcategoryKeywords: Record<string, string[]> = {
  // Telefoane & Tablete
  'Telefoane mobile': ['telefon', 'smartphone', 'telefon mobil'],
  'Smartphone-uri': ['smartphone', 'telefon'],
  'Tablete': ['tableta', 'ipad', 'tablet'],
  'Smartwatch': ['smartwatch', 'ceas inteligent', 'bratara fitness'],
  'Căști audio': ['casti', 'casti audio', 'headphones', 'earbuds'],
  'Huse telefoane': ['husa telefon', 'husa', 'protectie telefon'],
  'Folii protecție': ['folie protectie', 'folie sticla', 'geam protectie'],
  'Încărcătoare': ['incarcator', 'incarcator telefon', 'alimentator'],

  // Laptopuri & IT
  'Laptopuri': ['laptop', 'notebook', 'ultrabook', 'macbook', 'chromebook'],
  'Desktop PC': ['calculator', 'desktop', 'pc', 'sistem pc'],
  'Monitoare': ['monitor', 'ecran', 'display'],
  'Imprimante': ['imprimanta', 'printer', 'multifunctionala'],
  'Componente PC': ['componente pc', 'piese pc'],
  'Plăci video': ['placa video', 'gpu', 'placi video'],
  'Procesoare': ['procesor', 'cpu'],
  'Memorii RAM': ['memorie ram', 'ram', 'memorie'],
  'SSD-uri': ['ssd', 'hard disk ssd'],
  'Tastaturi': ['tastatura', 'keyboard'],
  'Mouse-uri': ['mouse', 'maus'],

  // TV & Audio-Video
  'Televizoare': ['televizor', 'tv', 'smart tv', 'oled', 'qled'],
  'Soundbar-uri': ['soundbar', 'bara de sunet'],
  'Sisteme audio': ['sistem audio', 'boxe', 'home cinema'],
  'Proiectoare': ['proiector', 'videoproiector'],
  'Aparate foto': ['aparat foto', 'camera foto', 'dslr', 'mirrorless'],

  // Gaming
  'Console gaming': ['consola', 'consola gaming'],
  'PlayStation 5': ['ps5', 'playstation 5', 'playstation'],
  'Xbox': ['xbox'],
  'Nintendo': ['nintendo', 'switch'],
  'Jocuri video': ['joc', 'joc video', 'game'],
  'Accesorii gaming': ['accesorii gaming', 'controller', 'maneta', 'headset gaming', 'tastatura gaming', 'mouse gaming', 'volan gaming'],
  'Scaune gaming': ['scaun gaming', 'scaun'],

  // Electrocasnice Mari
  'Frigidere': ['frigider'],
  'Combine frigorifice': ['combina frigorifica', 'combina'],
  'Congelatoare': ['congelator', 'lada frigorifica'],
  'Mașini de spălat rufe': ['masina de spalat', 'masina de spalat rufe'],
  'Mașini de spălat vase': ['masina de spalat vase', 'spalator vase'],
  'Uscătoare de rufe': ['uscator rufe', 'uscator'],
  'Cuptoare': ['cuptor', 'cuptor electric', 'cuptor incorporabil'],
  'Aragazuri': ['aragaz'],
  'Plite': ['plita', 'plita electrica', 'plita inductie'],
  'Cuptoare cu microunde': ['microunde', 'cuptor microunde'],
  'Hote': ['hota', 'hota bucatarie'],

  // Electrocasnice Mici
  'Aspiratoare': ['aspirator'],
  'Robot aspirator': ['robot aspirator', 'robot de aspirat'],
  'Espressoare': ['espressor', 'espressor cafea'],
  'Cafetiere': ['cafetiera', 'aparat cafea'],
  'Mixere': ['mixer'],
  'Blendere': ['blender'],
  'Friteuze cu aer cald': ['friteuza', 'friteuza cu aer cald', 'air fryer'],
  'Multicooker': ['multicooker', 'slow cooker'],
  'Grătare electrice': ['gratar electric'],
  'Prăjitoare pâine': ['prajitor paine', 'toaster', 'prajitor'],
  'Fiare de călcat': ['fier de calcat'],
  'Stații de călcat': ['statie de calcat'],

  // Climatizare & Încălzire
  'Aer condiționat': ['aer conditionat', 'climatizare', 'ac'],
  'Calorifere electrice': ['calorifer', 'calorifer electric', 'radiator electric'],
  'Convectoare': ['convector', 'convector electric'],
  'Radiatoare cu ulei': ['radiator cu ulei', 'radiator'],
  'Ventilatoare': ['ventilator'],

  // Îngrijire Personală
  'Epilatoare': ['epilator'],
  'Aparate de ras': ['aparat de ras', 'aparat ras', 'barbierit'],
  'Trimmere': ['trimmer', 'aparat tuns'],
  'Uscătoare de păr': ['uscator par', 'foehn'],
  'Plăci de păr': ['placa de par', 'ondulator'],
  'Ondulatoare': ['ondulator'],
  'Periuțe de dinți electrice': ['periuta electrica', 'periuta de dinti electrica'],

  // Mobilă
  'Scaune birou': ['scaun birou', 'scaun ergonomic', 'scaun'],
  'Birouri': ['birou', 'masa birou'],
  'Dulapuri': ['dulap'],
  'Paturi': ['pat'],
  'Saltele': ['saltea'],

  // Casă & Grădină
  'Unelte electrice': ['bormasina', 'polizor', 'flex', 'fierastrau'],
  'Mașini de găurit': ['masina de gaurit', 'bormasina'],
  'Fierăstraie': ['fierastrau'],
  'Mașini de tuns iarba': ['masina de tuns iarba', 'motocoasa', 'tuns gazon'],
  'Motocoase': ['motocoasa'],

  // Auto-Moto
  'Anvelope': ['anvelope', 'cauciucuri', 'roti'],
  'Accesorii auto': ['accesorii auto', 'camera auto', 'dvr'],
  'Camera auto DVR': ['camera auto', 'dvr'],
  'GPS auto': ['gps auto', 'navigatie', 'navigator'],

  // Jucării & Copii
  'Jucării': ['jucarie'],
  'LEGO': ['lego'],
  'Cărucioare copii': ['carucior', 'carucior copii'],
  'Scaune auto copii': ['scaun auto', 'scaun auto copii'],
  'Scutece': ['scutece', 'pampers'],

  // Sport & Outdoor
  'Biciclete': ['bicicleta', 'mtb', 'mountainbike', 'bicicleta electrica'],
  'Trotinete electrice': ['trotineta electrica', 'scooter electric'],
  'Benzi de alergare': ['banda de alergare', 'banda alergare'],
  'Biciclete fitness': ['bicicleta fitness', 'bicicleta de camera'],
};

async function main() {
  console.log('🔧 Construire mapare affiliate din categorii eMAG reale\n');

  // Citește categoriile permanente
  const categoriesPath = path.join(process.cwd(), 'data', 'emag-categories-permanent.json');
  const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));

  const affiliateMap: any = {};

  for (const category of categories) {
    const categorySlug = category.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    console.log(`\n📂 ${category.name} (${category.subcategories.length} subcategorii)`);

    if (!affiliateMap[categorySlug]) {
      affiliateMap[categorySlug] = {};
    }

    for (const subcat of category.subcategories) {
      const subcatSlug = subcat.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      const keywords = subcategoryKeywords[subcat.name] || [];

      if (keywords.length > 0) {
        affiliateMap[categorySlug][subcatSlug] = {
          name: subcat.name,
          emagUrl: subcat.url,
          keywords
        };
        console.log(`   ✅ ${subcat.name}: ${keywords.length} keywords`);
      } else {
        console.log(`   ⚠️  ${subcat.name}: NO KEYWORDS`);
      }
    }
  }

  // Salvează maparea
  const outputPath = path.join(process.cwd(), 'data', 'emag-affiliate-map-auto.json');
  fs.writeFileSync(outputPath, JSON.stringify(affiliateMap, null, 2), 'utf-8');

  console.log(`\n✅ Mapare salvată în: ${outputPath}\n`);

  // Statistici
  let totalSubcats = 0;
  let subcatsWithKeywords = 0;

  for (const cat of Object.values(affiliateMap)) {
    for (const subcat of Object.values(cat as any)) {
      totalSubcats++;
      if (subcat.keywords && subcat.keywords.length > 0) {
        subcatsWithKeywords++;
      }
    }
  }

  console.log(`📊 Statistici:`);
  console.log(`   Total subcategorii: ${totalSubcats}`);
  console.log(`   Cu keywords: ${subcatsWithKeywords}`);
  console.log(`   Fără keywords: ${totalSubcats - subcatsWithKeywords}\n`);
}

main().catch(console.error);
