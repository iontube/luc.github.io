import * as fs from 'fs';
import * as path from 'path';

/**
 * Script pentru procesarea tuturor cuvintelor cheie din cuvinte.txt
 * și categorizarea lor automată
 */

interface Keyword {
  keyword: string;
  category: string;
  tags: string[];
  searchVolume?: number;
}

// Mapare extinsă categorii pentru toate tipurile de produse
const categoryMapping: Record<string, { keywords: string[]; mainCategory: string }> = {
  electrocasnice_bucatarie: {
    keywords: ['friteuza', 'blender', 'mixer', 'robot de bucatarie', 'feliator', 'storcator', 'fierbator', 'masina de facut paine', 'prajitor', 'gatit cu aburi', 'multicooker', 'gofre', 'vafe', 'clatite', 'gratar electric', 'cuptor electric', 'cantar de bucatarie', 'vidat alimente', 'espressor', 'cafetiera', 'rasnita', 'hota', 'aragaz', 'cuptor cu microunde', 'masina de spalat vase', 'oala sub presiune', 'sandwich maker', 'slow cooker', 'deshidrator', 'termos', 'fierbator de oua', 'tocator de legume', 'masina de tocat carne', 'razatoare', 'masina de facut paste', 'zdrobitor de struguri', 'masina de umplut carnati', 'tigaie'],
    mainCategory: 'electrocasnice'
  },
  racire: {
    keywords: ['frigider', 'congelator', 'combina frigorifica', 'lada frigorifica', 'vitrina frigorifica', 'masina de facut gheata', 'racitor de vinuri'],
    mainCategory: 'electrocasnice'
  },
  incalzire: {
    keywords: ['calorifer', 'radiator', 'centrala termica', 'semineu', 'soba', 'convector', 'pompa de caldura', 'instant pe gaz', 'boiler', 'panou radiant', 'panou solar', 'incalzitor', 'aeroterma'],
    mainCategory: 'electrocasnice'
  },
  climatizare: {
    keywords: ['ventilator', 'aer conditionat', 'racitor de aer', 'purificator', 'umidificator', 'dezumidificator', 'generator de ozon'],
    mainCategory: 'electrocasnice'
  },
  ingrijire_casa: {
    keywords: ['masina de spalat', 'uscator de rufe', 'aspirator', 'mop', 'fier de calcat', 'statie de calcat', 'masa de calcat', 'masina de cusut', 'laminator'],
    mainCategory: 'electrocasnice'
  },
  tech_computing: {
    keywords: ['laptop', 'notebook', 'pc', 'procesor', 'placa video', 'placa de baza', 'ssd', 'hard disk', 'memorie ram', 'monitor', 'ups', 'sursa de alimentare', 'cooler', 'carcasa', 'mouse', 'tastatura', 'mousepad', 'hub usb', 'stick usb'],
    mainCategory: 'tech'
  },
  telefoane_tablete: {
    keywords: ['telefon', 'smartphone', 'tableta', 'smartwatch', 'bratara fitness', 'ebook reader'],
    mainCategory: 'tech'
  },
  audio_video: {
    keywords: ['televizor', 'boxa', 'boxe', 'casti', 'soundbar', 'microfon', 'lavaliera', 'videoproiector', 'ecran de proiectie', 'player auto', 'subwoofer', 'lampa circulara', 'tabla interactiva', 'radio', 'orga electronica'],
    mainCategory: 'tech'
  },
  foto_video: {
    keywords: ['camera', 'aparat foto', 'drona', 'stabilizator', 'camera auto', 'camera supraveghere', 'camera web', 'camera video sport'],
    mainCategory: 'tech'
  },
  networking: {
    keywords: ['router', 'amplificator wi fi', 'wi fi mesh', 'modulator auto'],
    mainCategory: 'tech'
  },
  gaming: {
    keywords: ['consola pentru gaming', 'birou de gaming', 'scaun de gaming', 'ochelari vr', 'volan pentru gaming'],
    mainCategory: 'gaming'
  },
  bebelusi_copii: {
    keywords: ['carucior', 'scaun auto', 'inaltator auto', 'balansoar', 'leagan', 'tarc', 'patut', 'masinuta electrica', 'tricicleta', 'premergator', 'marsupiu', 'aerosoli', 'nebulizator', 'scoica auto', 'landou', 'masa de infasat', 'scaun de masa', 'lapte praf', 'sterilizator', 'pompa de san', 'cantar pentru bebelusi', 'incalzitor de biberoane', 'termometru pentru bebelusi', 'aspirator nazal', 'bicicleta pentru copii', 'trambulina', 'tobogan', 'scaun de bicicleta'],
    mainCategory: 'copii'
  },
  ingrijire_personala: {
    keywords: ['epilator', 'uscator de par', 'perie rotativa', 'placa de indreptat', 'ondulator', 'placa de creponat', 'aparat de ras', 'aparat de tuns', 'periuta de dinti', 'dus bucal', 'crema', 'sampon', 'demachiant', 'parfum'],
    mainCategory: 'beauty'
  },
  sanatate: {
    keywords: ['tensiometru', 'glucometru', 'pulsoximetru', 'cantar corporal', 'aparat auditiv', 'fotoliu de masaj', 'aparat de masaj', 'probiotice', 'proteine'],
    mainCategory: 'sanatate'
  },
  scule_bricolaj: {
    keywords: ['bormasina', 'ciocan rotopercutor', 'polizor', 'flex', 'aparat de sudura', 'redresor', 'compresor', 'drujba', 'fierastrau', 'rindea', 'masina de frezat', 'slefuit', 'surubelnita', 'pistol de vopsit', 'masina de tencuit', 'nivela laser', 'telemetru', 'multimetru', 'creion de tensiune', 'statie de lipit', 'capsator'],
    mainCategory: 'bricolaj'
  },
  gradina: {
    keywords: ['masina de tuns iarba', 'robot de tuns', 'motocoasa', 'scarificator', 'motoburghiu', 'motosapa', 'motocultor', 'pompa de stropit', 'pompa submersibila', 'atomizor', 'suflanta', 'tocator de crengi', 'solar', 'lampi solare', 'compostor', 'betoniera', 'freza de zapada'],
    mainCategory: 'gradina'
  },
  auto: {
    keywords: ['baterie auto', 'anvelope', 'camera auto', 'navigatie auto', 'gps', 'detector de radar', 'modulator', 'incarcator auto', 'aspirator auto', 'prelata auto', 'cabluri de pornire', 'masina de polish', 'cric', 'odorizant auto', 'antena cb', 'statie cb', 'becuri auto', 'suport tv'],
    mainCategory: 'auto'
  },
  mobilier_casa: {
    keywords: ['saltea', 'topper', 'perna', 'brad de craciun', 'cabina de dus', 'plafoniera', 'lustra', 'dulap pentru scule', 'trusa de scule'],
    mainCategory: 'casa'
  },
  sport_fitness: {
    keywords: ['banda de alergat', 'bicicleta de fitness', 'bicicleta eliptica', 'stepper', 'gantere', 'aparat fitness', 'bicicleta', 'trotineta', 'hoverboard', 'role', 'centura de slabit'],
    mainCategory: 'sport'
  },
  diverse: {
    keywords: ['imprimanta', 'scanner', 'vopsea lavabila', 'ulei de motor', 'tracker gps', 'etilotest', 'binoclu', 'telescop', 'detector', 'senzor', 'incubator', 'aparat de muls', 'dozator de apa', 'cana filtranta', 'filtru de apa', 'invertor', 'generator', 'hidrofor', 'dedurizator', 'panouri fotovoltaice', 'baterii pentru panouri', 'uleiuri esentiale', 'interfon', 'sonerie', 'termostat'],
    mainCategory: 'diverse'
  }
};

function detectCategory(keyword: string): string {
  const lowerKeyword = keyword.toLowerCase();

  for (const [_, data] of Object.entries(categoryMapping)) {
    if (data.keywords.some((term) => lowerKeyword.includes(term))) {
      return data.mainCategory;
    }
  }

  return 'generale';
}

function generateTags(keyword: string, category: string): string[] {
  const words = keyword.toLowerCase().split(/\s+/);
  const stopWords = ['cel', 'cea', 'cele', 'mai', 'bun', 'buna', 'bune', 'si', 'și', 'sau', 'pentru', 'din', 'la', 'cu', 'de', 'in', 'în', 'pe', 'top'];

  // Filtrează stop words și păstrează cuvinte relevante
  let tags = words
    .filter((word) => !stopWords.includes(word) && word.length > 2)
    .filter((word, index, self) => self.indexOf(word) === index);

  // Adaugă categoria ca tag
  if (category !== 'generale') {
    tags.unshift(category);
  }

  // Adaugă tag-uri specifice
  if (keyword.includes('electric')) tags.push('electric');
  if (keyword.includes('wireless')) tags.push('wireless');
  if (keyword.includes('smart')) tags.push('smart');
  if (keyword.includes('profesional')) tags.push('profesional');
  if (keyword.includes('copii') || keyword.includes('bebelusi')) tags.push('copii');

  // Limitează la 6 tag-uri
  return tags.slice(0, 6);
}

async function main() {
  console.log('🔑 Procesare cuvinte cheie din cuvinte.txt...\n');

  // Citește fișierul cuvinte.txt
  const cuvintePath = path.join(process.cwd(), 'cuvinte.txt');
  if (!fs.existsSync(cuvintePath)) {
    console.error('❌ Fișierul cuvinte.txt nu există!');
    process.exit(1);
  }

  const content = fs.readFileSync(cuvintePath, 'utf-8');
  const lines = content.split('\n').filter((line) => line.trim());

  console.log(`📊 Găsite ${lines.length} cuvinte cheie\n`);

  const keywords: Keyword[] = [];

  // Procesează fiecare cuvânt cheie
  for (const line of lines) {
    const keyword = line.trim();
    if (!keyword) continue;

    const category = detectCategory(keyword);
    const tags = generateTags(keyword, category);

    keywords.push({
      keyword,
      category,
      tags
    });
  }

  // Grupare pe categorii pentru statistici
  const categoryStats: Record<string, number> = {};
  keywords.forEach((kw) => {
    categoryStats[kw.category] = (categoryStats[kw.category] || 0) + 1;
  });

  console.log('📈 Statistici pe categorii:');
  Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} cuvinte`);
    });

  // Salvează în data/keywords.json
  const outputPath = path.join(process.cwd(), 'data', 'keywords.json');
  fs.writeFileSync(outputPath, JSON.stringify(keywords, null, 2), 'utf-8');

  console.log(`\n✅ Salvat în: ${outputPath}`);
  console.log(`\n💡 Următorul pas: npm run generate-all-articles`);
}

main();
