import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {
    this.seedProducts();
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findById(id: string): Promise<Product | null> {
    // Add validation for ObjectId
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID format');
    }
    return this.productModel.findById(id).exec();
  }

  private async seedProducts() {
    const count = await this.productModel.countDocuments();
    if (count === 0) {
      const products = [
        {
          name: 'Wireless Bluetooth Headphones',
          description: 'High-quality wireless headphones with noise cancellation',
          price: 99.99,
          image: 'https://images.pexels.com/photos/3394659/pexels-photo-3394659.jpeg?auto=compress&cs=tinysrgb&w=400',
          category: 'electronics',
          stock: 15
        },
        {
          name: 'Smart Fitness Watch',
          description: 'Track your health and fitness with this smartwatch',
          price: 199.99,
          image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400',
          category: 'electronics',
          stock: 8
        },
        {
          name: 'Organic Cotton T-Shirt',
          description: 'Comfortable and sustainable organic cotton t-shirt',
          price: 24.99,
          image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
          category: 'clothing',
          stock: 25
        },
        {
          name: 'JavaScript: The Good Parts',
          description: 'Essential book for JavaScript developers',
          price: 29.99,
          image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400',
          category: 'books',
          stock: 12
        },
        {
          name: 'Ceramic Coffee Mug Set',
          description: 'Beautiful set of 4 ceramic coffee mugs',
          price: 39.99,
          image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
          category: 'home',
          stock: 20
        },
        {
          name: 'Yoga Exercise Mat',
          description: 'Non-slip yoga mat perfect for home workouts',
          price: 34.99,
          image: 'https://images.pexels.com/photos/4498318/pexels-photo-4498318.jpeg?auto=compress&cs=tinysrgb&w=400',
          category: 'sports',
          stock: 18
        }
      ];

      await this.productModel.insertMany(products);
      console.log('Sample products seeded successfully');
    }
  }
}
