import { IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsUUID()
  productoId: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  cantidad: number;
}
