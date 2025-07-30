import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class UpdateCartDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}