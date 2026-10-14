import { IsString, IsOptional, IsNumber, Min, IsUUID, IsArray, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  precio: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  precioAntes?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @IsString()
  categoria: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return value;
  })
  badges?: string[];
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return value;
  })
  beneficios?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }
    return value;
  })
  especificaciones?: any;

  @IsOptional()
  @IsString()
  modoUso?: string;
  
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  activo?: boolean;
}
