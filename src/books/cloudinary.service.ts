import { Injectable } from '@nestjs/common';
import cloudinary from '../cloudinary.config';

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File): Promise<any> {
    const result = await cloudinary.uploader.upload(file.path, {
    });
    return result; 
  }
}
