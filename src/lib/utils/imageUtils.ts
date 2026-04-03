import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';
import sharp from 'sharp';

// Image Utilities
// This file will contain helper functions for image handling,
// such as saving images to the filesystem.

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'products');

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Saves an image to the public uploads directory with a unique name.
 * @param tempImagePath The temporary path of the image to save.
 * @returns The relative public path of the saved image.
 */
export async function saveImage(tempImagePath: string): Promise<string> {
  if (!fs.existsSync(tempImagePath)) {
    throw new Error(`Source image path does not exist: ${tempImagePath}`);
  }

  const originalName = path.basename(tempImagePath);
  const randomString = randomBytes(8).toString('hex');
  const uniqueFilename = `${randomString}-${originalName}`;
  const destinationPath = path.join(UPLOAD_DIR, uniqueFilename);

  // Using sharp to process and save the image
  // This also helps in verifying the file is a valid image
  await sharp(tempImagePath).toFile(destinationPath);

  // Return the relative path for use in the database/URL
  const relativePath = `/uploads/products/${uniqueFilename}`;

  console.log(`Image successfully saved to public folder: ${relativePath}`);

  return relativePath;
}
