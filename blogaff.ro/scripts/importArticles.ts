import * as fs from 'fs';
import * as path from 'path';

/**
 * Script pentru importarea articolelor generate în src/data/generatedArticles.ts
 */

async function main() {
  const generatedDir = path.join(process.cwd(), 'generated-articles');
  const outputFile = path.join(process.cwd(), 'src', 'data', 'generatedArticles.ts');

  if (!fs.existsSync(generatedDir)) {
    console.error('❌ Folderul generated-articles/ nu există!');
    process.exit(1);
  }

  const files = fs.readdirSync(generatedDir).filter((f) => f.endsWith('.json'));

  console.log(`📦 Import ${files.length} articole...\n`);

  const articles = files.map((file) => {
    const filePath = path.join(generatedDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  });

  // Generează fișier TypeScript
  const tsContent = `import type { Article } from '../types/article';

// Articole generate automat - Nu edita manual!
// Regenerează cu: npm run import-articles

export const generatedArticles: Article[] = ${JSON.stringify(articles, null, 2)};
`;

  fs.writeFileSync(outputFile, tsContent, 'utf-8');

  console.log(`✅ ${files.length} articole importate în src/data/generatedArticles.ts`);
  console.log('\n💡 Articolele sunt acum disponibile în dev server!');
  console.log('   Accesează: http://localhost:4321/articole/[slug]');
}

main();
