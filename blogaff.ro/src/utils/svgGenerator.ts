// Generator de SVG-uri ilustrative pentru articole
// Generează SVG-uri simple și relevante bazate pe categoria produsului

export function generateArticleSvg(keyword: string, category: string): string {
  const cleanKeyword = keyword.toLowerCase();

  // Detectează tipul de produs și returnează SVG corespunzător
  if (cleanKeyword.includes('frigider') || cleanKeyword.includes('congelator') || cleanKeyword.includes('combina frigorifica')) {
    return generateFridgeSvg();
  }
  if (cleanKeyword.includes('laptop') || cleanKeyword.includes('notebook') || cleanKeyword.includes('pc')) {
    return generateLaptopSvg();
  }
  if (cleanKeyword.includes('telefon') || cleanKeyword.includes('smartphone')) {
    return generatePhoneSvg();
  }
  if (cleanKeyword.includes('televizor') || cleanKeyword.includes('tv')) {
    return generateTvSvg();
  }
  if (cleanKeyword.includes('masina de spalat')) {
    return generateWashingMachineSvg();
  }
  if (cleanKeyword.includes('aspirator') || cleanKeyword.includes('robot')) {
    return generateVacuumSvg();
  }
  if (cleanKeyword.includes('aer conditionat') || cleanKeyword.includes('ventilator')) {
    return generateAcSvg();
  }
  if (cleanKeyword.includes('calorifer') || cleanKeyword.includes('radiator') || cleanKeyword.includes('centrala') || cleanKeyword.includes('incalzitor')) {
    return generateHeaterSvg();
  }
  if (cleanKeyword.includes('boxa') || cleanKeyword.includes('casti') || cleanKeyword.includes('soundbar')) {
    return generateAudioSvg();
  }
  if (cleanKeyword.includes('camera') || cleanKeyword.includes('aparat foto')) {
    return generateCameraSvg();
  }
  if (cleanKeyword.includes('blender') || cleanKeyword.includes('mixer') || cleanKeyword.includes('robot de bucatarie')) {
    return generateKitchenSvg();
  }
  if (cleanKeyword.includes('friteuza')) {
    return generateFryerSvg();
  }
  if (cleanKeyword.includes('carucior') || cleanKeyword.includes('scaun auto')) {
    return generateBabySvg();
  }
  if (cleanKeyword.includes('bicicleta') || cleanKeyword.includes('trotineta')) {
    return generateBikeSvg();
  }
  if (cleanKeyword.includes('smartwatch') || cleanKeyword.includes('bratara')) {
    return generateWatchSvg();
  }

  // SVG generic pentru produse
  return generateGenericProductSvg();
}

function generateFridgeSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="w-full h-full">
    <defs>
      <linearGradient id="fridgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#e0f2fe;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#7dd3fc;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="#f0f9ff"/>
    <rect x="140" y="60" width="120" height="180" rx="8" fill="url(#fridgeGrad)" stroke="#0284c7" stroke-width="3"/>
    <rect x="140" y="60" width="120" height="80" fill="#bae6fd" opacity="0.5"/>
    <line x1="140" y1="140" x2="260" y2="140" stroke="#0284c7" stroke-width="2"/>
    <circle cx="245" cy="100" r="4" fill="#0284c7"/>
    <circle cx="245" cy="180" r="4" fill="#0284c7"/>
    <path d="M 180 100 L 190 100 L 190 110 L 180 110 Z" fill="#0ea5e9" opacity="0.3"/>
    <path d="M 200 105 L 210 105 L 210 115 L 200 115 Z" fill="#0ea5e9" opacity="0.3"/>
  </svg>`;
}

function generateLaptopSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="w-full h-full">
    <defs>
      <linearGradient id="laptopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#475569;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="#f8fafc"/>
    <rect x="100" y="80" width="200" height="130" rx="4" fill="url(#laptopGrad)" stroke="#0f172a" stroke-width="2"/>
    <rect x="110" y="90" width="180" height="100" fill="#0ea5e9" opacity="0.8"/>
    <rect x="80" y="210" width="240" height="10" rx="2" fill="#334155"/>
    <circle cx="200" cy="215" r="3" fill="#64748b"/>
  </svg>`;
}

function generatePhoneSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="w-full h-full">
    <defs>
      <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#334155;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="#fef3c7"/>
    <rect x="150" y="50" width="100" height="200" rx="12" fill="url(#phoneGrad)" stroke="#0f172a" stroke-width="2"/>
    <rect x="160" y="70" width="80" height="150" rx="4" fill="#0ea5e9" opacity="0.9"/>
    <circle cx="200" cy="235" r="6" fill="#475569" stroke="#94a3b8" stroke-width="1"/>
    <rect x="185" y="58" width="30" height="6" rx="3" fill="#475569"/>
  </svg>`;
}

function generateTvSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="w-full h-full">
    <rect width="400" height="300" fill="#f1f5f9"/>
    <rect x="50" y="60" width="300" height="170" rx="6" fill="#1e293b" stroke="#0f172a" stroke-width="3"/>
    <rect x="65" y="75" width="270" height="140" fill="#0ea5e9" opacity="0.8"/>
    <rect x="170" y="230" width="60" height="30" fill="#334155"/>
    <rect x="120" y="260" width="160" height="8" rx="4" fill="#475569"/>
    <circle cx="200" cy="250" r="3" fill="#ef4444"/>
  </svg>`;
}

function generateWashingMachineSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="w-full h-full">
    <rect width="400" height="300" fill="#fef2f2"/>
    <rect x="120" y="50" width="160" height="200" rx="8" fill="#f8fafc" stroke="#64748b" stroke-width="3"/>
    <rect x="120" y="50" width="160" height="40" fill="#e2e8f0"/>
    <circle cx="200" cy="170" r="60" fill="#f1f5f9" stroke="#475569" stroke-width="3"/>
    <circle cx="200" cy="170" r="50" fill="#dbeafe" opacity="0.7"/>
    <circle cx="200" cy="170" r="40" fill="#93c5fd" opacity="0.5"/>
    <circle cx="160" cy="70" r="6" fill="#10b981"/>
    <circle cx="180" cy="70" r="6" fill="#f59e0b"/>
    <rect x="220" y="65" width="40" height="10" rx="2" fill="#cbd5e1"/>
  </svg>`;
}

function generateVacuumSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="w-full h-full">
    <rect width="400" height="300" fill="#fefce8"/>
    <circle cx="180" cy="150" r="50" fill="#dc2626" opacity="0.9" stroke="#991b1b" stroke-width="2"/>
    <circle cx="180" cy="150" r="35" fill="#fca5a5" opacity="0.5"/>
    <rect x="220" y="140" width="80" height="20" rx="10" fill="#7f1d1d"/>
    <circle cx="160" cy="200" r="15" fill="#1f2937"/>
    <circle cx="200" cy="200" r="15" fill="#1f2937"/>
  </svg>`;
}

function generateAcSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="w-full h-full">
    <rect width="400" height="300" fill="#ecfeff"/>
    <rect x="80" y="100" width="240" height="80" rx="8" fill="#f8fafc" stroke="#0891b2" stroke-width="2"/>
    <rect x="90" y="110" width="220" height="20" fill="#cffafe"/>
    <path d="M 100 150 Q 120 140, 140 150" stroke="#06b6d4" stroke-width="2" fill="none"/>
    <path d="M 160 150 Q 180 140, 200 150" stroke="#06b6d4" stroke-width="2" fill="none"/>
    <path d="M 220 150 Q 240 140, 260 150" stroke="#06b6d4" stroke-width="2" fill="none"/>
    <circle cx="300" cy="120" r="4" fill="#10b981"/>
  </svg>`;
}

function generateHeaterSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="w-full h-full">
    <rect width="400" height="300" fill="#fff7ed"/>
    <rect x="130" y="70" width="140" height="160" rx="6" fill="#f8fafc" stroke="#f97316" stroke-width="2"/>
    <line x1="150" y1="90" x2="150" y2="210" stroke="#fb923c" stroke-width="3"/>
    <line x1="170" y1="90" x2="170" y2="210" stroke="#fb923c" stroke-width="3"/>
    <line x1="190" y1="90" x2="190" y2="210" stroke="#fb923c" stroke-width="3"/>
    <line x1="210" y1="90" x2="210" y2="210" stroke="#fb923c" stroke-width="3"/>
    <line x1="230" y1="90" x2="230" y2="210" stroke="#fb923c" stroke-width="3"/>
    <line x1="250" y1="90" x2="250" y2="210" stroke="#fb923c" stroke-width="3"/>
    <circle cx="200" cy="100" r="5" fill="#ef4444"/>
  </svg>`;
}

function generateAudioSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="w-full h-full">
    <rect width="400" height="300" fill="#faf5ff"/>
    <circle cx="150" cy="150" r="50" fill="#1f2937" stroke="#111827" stroke-width="3"/>
    <circle cx="150" cy="150" r="30" fill="#4b5563"/>
    <circle cx="250" cy="150" r="50" fill="#1f2937" stroke="#111827" stroke-width="3"/>
    <circle cx="250" cy="150" r="30" fill="#4b5563"/>
    <path d="M 200 100 Q 200 80, 200 80" stroke="#374151" stroke-width="4" fill="none"/>
    <rect x="195" y="70" width="10" height="40" rx="5" fill="#6b7280"/>
  </svg>`;
}

function generateCameraSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="w-full h-full">
    <rect width="400" height="300" fill="#f3f4f6"/>
    <rect x="100" y="110" width="200" height="120" rx="8" fill="#1f2937" stroke="#111827" stroke-width="2"/>
    <circle cx="220" cy="170" r="40" fill="#4b5563" stroke="#374151" stroke-width="2"/>
    <circle cx="220" cy="170" r="25" fill="#6b7280" opacity="0.7"/>
    <rect x="100" y="100" width="60" height="20" rx="4" fill="#374151"/>
    <circle cx="270" cy="130" r="6" fill="#ef4444"/>
    <rect x="300" y="165" width="30" height="10" rx="2" fill="#4b5563"/>
  </svg>`;
}

function generateKitchenSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="w-full h-full">
    <rect width="400" height="300" fill="#fef3c7"/>
    <rect x="150" y="140" width="100" height="80" rx="4" fill="#f8fafc" stroke="#78716c" stroke-width="2"/>
    <circle cx="200" cy="130" r="50" fill="#e7e5e4" stroke="#78716c" stroke-width="2"/>
    <circle cx="200" cy="130" r="35" fill="#d6d3d1" opacity="0.6"/>
    <path d="M 180 120 L 200 100 L 220 120" stroke="#57534e" stroke-width="2" fill="none"/>
    <rect x="185" y="220" width="30" height="20" fill="#a8a29e"/>
  </svg>`;
}

function generateFryerSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="w-full h-full">
    <rect width="400" height="300" fill="#fef2f2"/>
    <rect x="120" y="120" width="160" height="120" rx="8" fill="#1f2937" stroke="#111827" stroke-width="2"/>
    <rect x="130" y="100" width="140" height="30" rx="6" fill="#f3f4f6" stroke="#6b7280" stroke-width="1"/>
    <circle cx="200" cy="115" r="6" fill="#94a3b8"/>
    <rect x="140" y="140" width="120" height="80" rx="4" fill="#422006" opacity="0.7"/>
    <circle cx="180" cy="170" r="15" fill="#fbbf24" opacity="0.6"/>
    <circle cx="210" cy="180" r="18" fill="#fbbf24" opacity="0.6"/>
  </svg>`;
}

function generateBabySvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="w-full h-full">
    <rect width="400" height="300" fill="#fce7f3"/>
    <rect x="120" y="100" width="160" height="100" rx="12" fill="#fbcfe8" stroke="#ec4899" stroke-width="2"/>
    <circle cx="280" cy="220" r="25" fill="#1f2937" stroke="#111827" stroke-width="2"/>
    <circle cx="120" cy="220" r="25" fill="#1f2937" stroke="#111827" stroke-width="2"/>
    <path d="M 280 200 L 330 180" stroke="#6b7280" stroke-width="3"/>
    <circle cx="160" cy="140" r="8" fill="#f472b6"/>
    <circle cx="240" cy="140" r="8" fill="#f472b6"/>
  </svg>`;
}

function generateBikeSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="w-full h-full">
    <rect width="400" height="300" fill="#ecfccb"/>
    <circle cx="120" cy="200" r="40" fill="none" stroke="#404040" stroke-width="4"/>
    <circle cx="280" cy="200" r="40" fill="none" stroke="#404040" stroke-width="4"/>
    <path d="M 120 200 L 200 120 L 280 200" stroke="#404040" stroke-width="3" fill="none"/>
    <line x1="200" y1="120" x2="200" y2="180" stroke="#404040" stroke-width="3"/>
    <path d="M 180 180 L 220 180" stroke="#404040" stroke-width="3"/>
  </svg>`;
}

function generateWatchSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="w-full h-full">
    <rect width="400" height="300" fill="#f0fdf4"/>
    <rect x="160" y="110" width="80" height="80" rx="12" fill="#1f2937" stroke="#111827" stroke-width="2"/>
    <rect x="170" y="120" width="60" height="60" rx="6" fill="#0ea5e9" opacity="0.9"/>
    <rect x="190" y="90" width="20" height="30" fill="#374151"/>
    <rect x="190" y="190" width="20" height="30" fill="#374151"/>
    <circle cx="200" cy="150" r="3" fill="#10b981"/>
  </svg>`;
}

function generateGenericProductSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="w-full h-full">
    <defs>
      <linearGradient id="genericGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#fb923c;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="#fffbeb"/>
    <rect x="120" y="80" width="160" height="140" rx="12" fill="url(#genericGrad)" stroke="#ea580c" stroke-width="3"/>
    <circle cx="200" cy="150" r="40" fill="#fff" opacity="0.3"/>
    <path d="M 180 150 L 200 130 L 220 150 L 200 170 Z" fill="#fff" opacity="0.5"/>
  </svg>`;
}

// Funcție pentru a converti SVG în data URL
export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
