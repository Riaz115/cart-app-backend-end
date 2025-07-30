import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CartService } from "./cart.service";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartDto } from "./dto/update-cart.dto";

@Controller("cart")
@UseGuards(JwtAuthGuard) // Enable this back
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req) {
    const cart = await this.cartService.getCart(req.user.userId);
    return cart || { items: [], totalPrice: 0 };
  }

  @Post("add")
  async addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, addToCartDto);
  }

  @Put("update")
  async updateQuantity(@Request() req, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.updateQuantity(req.user.userId, updateCartDto);
  }

  @Delete("remove/:productId")
  async removeFromCart(@Request() req, @Param("productId") productId: string) {
    return this.cartService.removeFromCart(req.user.userId, productId);
  }

  @Delete("clear")
  async clearCart(@Request() req) {
    await this.cartService.clearCart(req.user.userId);
    return { message: "Cart cleared successfully" };
  }
}
