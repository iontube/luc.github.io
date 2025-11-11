import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';

dotenv.config();

async function testImageGeneration() {
  console.log('🧪 Testare generare imagini cu diferite modele Gemini\n');

  const apiKeys = process.env.GEMINI_API_KEYS?.split(',').filter(k => k.trim()) || [];
  if (apiKeys.length === 0) {
    throw new Error('Nu există API keys');
  }

  const genAI = new GoogleGenerativeAI(apiKeys[0]);

  // Lista de modele de testat
  const modelsToTest = [
    'gemini-2.0-flash-exp',
    'gemini-exp-1206',
    'gemini-2.0-flash-thinking-exp',
    'gemini-2.0-flash-thinking-exp-01-21'
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`\n🎨 Testez model: ${modelName}`);
      console.log('─'.repeat(60));

      const model = genAI.getGenerativeModel({
        model: modelName
      });

      // Request pentru generare imagine
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: 'Generate an image of a modern smartphone on a white background'
          }]
        }]
      });

      const response = await result.response;
      console.log('✅ Răspuns primit!');

      // Verifică tipul de răspuns
      const text = response.text();
      console.log('📝 Text răspuns (primele 500 chars):', text.substring(0, 500));

      // Verifică dacă există date imagine în răspuns
      if (response.candidates && response.candidates[0]) {
        const parts = response.candidates[0].content.parts;
        console.log('\n📦 Parts în răspuns:', parts.length);

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          console.log(`\nPart ${i}:`, Object.keys(part));

          // Verifică dacă există inlineData (imagine)
          if ('inlineData' in part) {
            console.log('🎉 GĂSIT IMAGINE!');
            console.log('   MimeType:', (part as any).inlineData.mimeType);
            console.log('   Data length:', (part as any).inlineData.data.length);

            // Salvează imaginea
            const imageData = Buffer.from((part as any).inlineData.data, 'base64');
            const fileName = `test-${modelName.replace(/[^a-z0-9]/gi, '-')}.png`;
            fs.writeFileSync(fileName, imageData);
            console.log(`   💾 Salvat în: ${fileName}`);

            return; // Succes! Oprește testarea
          }
        }
      }

      console.log('⚠️  Nu am găsit date imagine în răspuns');

    } catch (error: any) {
      console.error(`❌ Eroare ${modelName}:`, error.message);
    }
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('❌ Niciun model nu suportă generarea de imagini cu acest API');
  console.log('💡 Recomandare: folosește SVG-uri generate de Gemini');
}

testImageGeneration().catch(console.error);
