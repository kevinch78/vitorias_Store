import { Controller, Post, Body, Get, Param, Patch, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { EstadoPedido } from '@prisma/client';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post(['pedidos', 'orders'])
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  create(@Body() createOrderDto: CreateOrderDto, @GetUser('id') userId: string) {
    return this.ordersService.createOrder(createOrderDto, userId);
  }

  @Get(['pedidos/rastreo/:query', 'orders/track/:query'])
  trackOrder(@Param('query') query: string) {
    return this.ordersService.trackOrder(query);
  }

  @Get(['pedidos/:codigo', 'orders/:codigo'])
  findOneByCode(@Param('codigo') codigo: string) {
    return this.ordersService.findOneByCode(codigo);
  }

  @Post(['pedidos/:codigo/comprobante', 'orders/:codigo/receipt'])
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseInterceptors(FileInterceptor('comprobante'))
  uploadComprobante(
    @Param('codigo') codigo: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.ordersService.uploadComprobante(codigo, file);
  }

  @Get(['admin/pedidos', 'admin/orders'])
  @UseGuards(JwtAuthGuard)
  findAll(@Query('estado') estado?: EstadoPedido) {
    return this.ordersService.findAll(estado);
  }

  @Get(['admin/pedidos/:id', 'admin/orders/:id'])
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(['admin/pedidos/:id/estado', 'admin/orders/:id/status'])
  @UseGuards(JwtAuthGuard)
  updateEstado(@Param('id') id: string, @Body('estado') estado: EstadoPedido) {
    return this.ordersService.updateEstado(id, estado);
  }
}
