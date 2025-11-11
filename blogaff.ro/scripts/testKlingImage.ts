import { KlingClient } from 'kling-sdk';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

async function testKlingImageGeneration() {
  const client = new KlingClient({
    accessKey: 'ARCRYFh9dFNmCJRMgeJYABMnRtgydkDm',
    secretKey: 'RJbYrdteQbeG9bY3FfetYbYEkpCGNKCM'
  });

  try {
    console.log('Creating image generation task...');

    const result = await client.createImageGeneration({
      model_name: 'kling-v1-5',
      prompt: 'A modern minimalist hero image for article about best smartwatches for men, featuring abstract geometric shapes in blue and orange tones, professional product photography style, clean design',
      negative_prompt: 'blurry, low quality, distorted, text, watermark',
      n: 1,
      aspect_ratio: '16:9'
    });

    const taskId = result.data.task_id;
    console.log('Task created! Task ID:', taskId);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const taskDetail = await client.getImageGenerationTask(taskId);
      const status = taskDetail.data.task_status;
      console.log('[' + (attempts + 1) + '/' + maxAttempts + '] Task status: ' + status);

      if (status === 'succeed') {
        console.log('\\nImage generation successful!');
        const images = taskDetail.data.task_result.images;
        
        for (let i = 0; i < images.length; i++) {
          const imageUrl = images[i].url;
          console.log('\\nDownloading image ' + (i + 1) + ': ' + imageUrl);
          
          // Download image
          const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          const imageBuffer = Buffer.from(response.data);
          
          const outputPath = path.join(process.cwd(), 'kling-test-' + (i + 1) + '.png');
          fs.writeFileSync(outputPath, imageBuffer);
          console.log('Image saved to: ' + outputPath);
          console.log('Image size: ' + imageBuffer.length + ' bytes');
        }
        
        return;
      } else if (status === 'failed') {
        console.error('Task failed:', taskDetail.data);
        return;
      }

      attempts++;
    }

    console.log('Timeout waiting for task completion');

  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testKlingImageGeneration();
