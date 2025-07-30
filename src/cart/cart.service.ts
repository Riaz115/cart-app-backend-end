import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { ProductsService } from '../products/products.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private productsService: ProductsService,
  ) {}

  async getCart(userId: string): Promise<Cart | null> {
    return this.cartModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('items.productId')
      .exec();
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productId, quantity } = addToCartDto;

    // Validate product exists and has stock
    const product = await this.productsService.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    let cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!cart) {
      // Create new cart
      cart = new this.cartModel({
        userId: new Types.ObjectId(userId),
        items: [{ productId: new Types.ObjectId(productId), quantity }],
        totalPrice: product.price * quantity,
      });
    } else {
      // Update existing cart
      const existingItemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId
      );

      if (existingItemIndex > -1) {
        // Update existing item
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({ productId: new Types.ObjectId(productId), quantity });
      }

      // Recalculate total price
      cart.totalPrice = await this.calculateTotalPrice(cart);
    }

    await cart.save();
    return this.cartModel.findById(cart._id).populate('items.productId').exec();
  }



  ///////////////////////
  async updateQuantity(userId: string, updateCartDto: UpdateCartDto): Promise<Cart> {
    const { productId, quantity } = updateCartDto;

    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    // Validate product stock
    const product = await this.productsService.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    cart.items[itemIndex].quantity = quantity;
    cart.totalPrice = await this.calculateTotalPrice(cart);

    await cart.save();
    return this.cartModel.findById(cart._id).populate('items.productId').exec();
  }

  async removeFromCart(userId: string, productId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

    cart.totalPrice = await this.calculateTotalPrice(cart);
    await cart.save();

    return this.cartModel.findById(cart._id).populate('items.productId').exec();
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartModel.deleteOne({ userId: new Types.ObjectId(userId) });
  }

  private async calculateTotalPrice(cart: Cart): Promise<number> {
    let total = 0;
    
    for (const item of cart.items) {
      const product = await this.productsService.findById(item.productId.toString());
      if (product) {
        total += product.price * item.quantity;
      }
    }

    return total;
  }
}