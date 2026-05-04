'use server';

import fs from 'fs';
import path from 'path';

export async function getSlideshowImages() {
  const slideshowDir = path.join(process.cwd(), 'public/slideshow');
  
  try {
    const files = fs.readdirSync(slideshowDir);
    
    // Filter for common image extensions
    const images = files.filter(file => 
      /\.(jpg|jpeg|png|webp|avif)$/i.test(file)
    );

    // Return the absolute paths for the browser
    return images.map(name => `/slideshow/${name}`);
  } catch (error) {
    console.error("Could not read slideshow directory:", error);
    return [];
  }
}