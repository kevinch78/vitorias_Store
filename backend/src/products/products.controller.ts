import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(['productos', 'products'])
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get(['admin/productos', 'admin/products'])
  @UseGuards(JwtAuthGuard)
  findAllAdmin(@Query() query: QueryProductsDto) {
    return this.productsService.findAll({
      limit: 100,
      ...query,
      activo: query.activo || 'all',
    });
  }

  @Get(['productos/:slug', 'products/:slug'])
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOneBySlug(slug);
  }

  @Post(['admin/productos', 'admin/products'])
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('imagen'))
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.create(createProductDto, file);
  }

  @Patch(['admin/productos/:id', 'admin/products/:id'])
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('imagen'))
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.update(id, updateProductDto, file);
  }

  @Delete(['admin/productos/:id', 'admin/products/:id'])
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
