import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import * as sharp from 'sharp';
// @ts-ignore
const sharpModule = sharp.default || sharp;
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import * as fs from 'fs';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async processImage(file: Express.Multer.File): Promise<string | null> {
    if (!file) return null;
    
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Formato de imagen no permitido');
    }

    const filename = `${uuidv4()}.webp`;
    const baseUploadDir = process.env.UPLOAD_DIR || 'uploads';
    const uploadsDir = join(process.cwd(), baseUploadDir, 'products');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filepath = join(uploadsDir, filename);

    await sharpModule(file.buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(filepath);

    return `/uploads/products/${filename}`;
  }

  async create(createProductDto: CreateProductDto, file?: Express.Multer.File) {
    const slug = slugify(createProductDto.nombre, { lower: true, strict: true });
    
    // Check if slug exists
    const existing = await this.prisma.producto.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException('Ya existe un producto con ese nombre/slug');
    }

    const { categoria, ...restDto } = createProductDto;

    const cat = await this.prisma.categoria.findFirst({
      where: {
        OR: [
          { nombre: categoria },
          { slug: slugify(categoria, { lower: true }) }
        ]
      }
    });

    if (!cat) {
      throw new BadRequestException('Categoría no encontrada');
    }

    const imageUrl = file ? await this.processImage(file) : null;

    return this.prisma.producto.create({
      data: {
        ...restDto,
        categoriaId: cat.id,
        slug,
        imagen: imageUrl,
      },
    });
  }

  async findAll(query: QueryProductsDto) {
    const { search, categoriaSlug, orden, limit = 50, page = 1, activo } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Si activo === 'all', no filtramos para permitir al admin ver productos activos e inactivos
    if (activo === 'all') {
      // Sin filtro de activo
    } else if (activo === 'false' || activo === '0') {
      where.activo = false;
    } else {
      // Por defecto para la tienda pública: solo productos activos
      where.activo = true;
    }

    if (search) {
      where.nombre = { contains: search, mode: 'insensitive' };
    }

    const catTarget = categoriaSlug || query.categoria;
    if (catTarget) {
      where.categoria = {
        OR: [
          { slug: catTarget },
          { nombre: catTarget }
        ]
      };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (orden === 'precio_asc') orderBy = { precio: 'asc' };
    if (orden === 'precio_desc') orderBy = { precio: 'desc' };
    if (orden === 'recientes') orderBy = { createdAt: 'desc' };

    const [total, data] = await Promise.all([
      this.prisma.producto.count({ where }),
      this.prisma.producto.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { categoria: true },
      }),
    ]);

    return { total, page, limit, data };
  }

  async findOneBySlug(slug: string) {
    const product = await this.prisma.producto.findFirst({
      where: { slug, activo: true },
      include: { categoria: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, file?: Express.Multer.File) {
    const product = await this.prisma.producto.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const { categoria, ...restDto } = updateProductDto;
    const dataToUpdate: any = { ...restDto };

    if (dataToUpdate.nombre) {
      dataToUpdate.slug = slugify(dataToUpdate.nombre, { lower: true, strict: true });
    }

    if (categoria) {
      const cat = await this.prisma.categoria.findFirst({
        where: {
          OR: [
            { nombre: categoria },
            { slug: slugify(categoria, { lower: true }) }
          ]
        }
      });
      if (!cat) throw new BadRequestException('Categoría no encontrada');
      dataToUpdate.categoriaId = cat.id;
    }

    if (file) {
      dataToUpdate.imagen = await this.processImage(file);
    }

    return this.prisma.producto.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: string) {
    const product = await this.prisma.producto.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    return this.prisma.producto.update({
      where: { id },
      data: { activo: false },
    });
  }
}
