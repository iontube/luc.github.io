import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function testImageGeneration() {
  const apiKeys = process.env.GEMINI_API_KEYS?.split(',') || [];
  if (apiKeys.length === 0) {
    console.error('No API keys found');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKeys[0].trim());

  try {
    console.log('Testing image generation with gemini-2.5-flash-image...');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

    const prompt = 'A modern minimalist hero image for an article about the best smartwatches for men, featuring abstract geometric shapes in blue and orange tones, professional style';

    const result = await model.generateContent(prompt);
    const response = await result.response;

    console.log('Response received');

    // Check for inline data (image)
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) {
          console.log('Image data found!');
          const imageData = part.inlineData.data;
          const mimeType = part.inlineData.mimeType;
          console.log(`MIME type: ${mimeType}`);

          // Decode base64 and save
          const buffer = Buffer.from(imageData, 'base64');
          const outputPath = path.join(process.cwd(), 'test-image.png');
          fs.writeFileSync(outputPath, buffer);
          console.log(`Image saved to: ${outputPath}`);
          console.log(`Image size: ${buffer.length} bytes`);
        } else if (part.text) {
          console.log('Text part:', part.text);
        }
      }
    }

  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response, null, 2));
    }
  }
}

testImageGeneration();
