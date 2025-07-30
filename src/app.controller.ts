import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHome() {
    return {
      message: 'API is working successfully',
      status: 'success',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/auth',
        products: '/api/products',
        cart: '/api/cart'
      }
    };
  }
}