import admin from 'firebase-admin';
import crypto from 'node:crypto';
import { getUserById } from '../services/userService.js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// import { serviceAccount } from "../configs/firebase-key.json";

const BUCKET = 'images-rifa-user.appspot.com';

function generateId() {
  // Gera 16 bytes aleatórios
  const randomBytes = crypto.randomBytes(16);
  // Converte os bytes aleatórios para uma string hexadecimal
  const id = randomBytes.toString('hex');
  return id;
}

const serviceAccountPath = join(__dirname, '../configs/configfirebase.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: BUCKET
});

const bucket = admin.storage().bucket();

export const uploadImage = (req, res, next) => {
  if (!req.file) return next();

  const avatar = req.file;
  const nomeArquivo = `${generateId()}.${avatar.originalname.split('.').pop()}`;
  console.log(nomeArquivo);

  const file = bucket.file(nomeArquivo);

  const stream = file.createWriteStream({
    metadata: {
      contentType: avatar.mimetype
    }
  });

  stream.on('error', (e) => {
    console.error(e);
    return next(e); // Pass the error to the next middleware
  });

  stream.on('finish', async () => {
    try {
      await file.makePublic();
      req.file.firebaseUrl = `https://storage.googleapis.com/${BUCKET}/${nomeArquivo}`;
      next();
    } catch (e) {
      console.error(e);
      next(e);
    }
  });

  stream.end(avatar.buffer);
};



export const deleteImage = async (req, res, next) => {
    try {
      const userId = req.userId;
      console.log(`User ID: ${userId}`);
  
      const user = await getUserById(userId);
      if (!user) {
        console.error('User not found');
        return res.status(404).json({ message: 'User not found' });
      }
  
      console.log(`User: ${JSON.stringify(user)}`);
  
      const imageUrl = user.image;
      if (!imageUrl) {
        console.log('No image URL found for user');
        return res.status(404).json({ message: 'No image found for user' });
      }
  
      const imageName = imageUrl.replace("https://storage.googleapis.com/images-rifa-user.appspot.com/", "");
      console.log(`Image Name to delete: ${imageName}`);
  
      if (imageName) {
        // Verifica se o arquivo existe antes de tentar deletar
        const file = bucket.file(imageName);
        const [exists] = await file.exists();
        if (!exists) {
          console.log('File does not exist');
          return res.status(404).json({ message: 'Image not found in storage' });
        }
  
        await file.delete();
        console.log(`File ${imageName} deleted successfully.`);
        res.status(200).json({ message: 'Image deleted successfully' });
      } else {
        console.log('No image found to delete');
        res.status(404).json({ message: 'No image found to delete' });
      }
    } catch (error) {
      console.error(`Failed to delete file: `, error);
      res.status(500).json({ message: 'Failed to delete image', error });
    }
  };
  

