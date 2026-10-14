import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { EstadoPedido } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { join, extname } from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';
// @ts-ignore
const sharpModule = sharp.default || sharp;

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(createOrderDto: CreateOrderDto, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderDetails = [];

      for (const item of createOrderDto.items) {
        const product = await tx.producto.findUnique({
          where: { id: item.productoId },
        });

        if (!product || !product.activo) {
          throw new BadRequestException(`Producto no disponible o inactivo: ${item.productoId}`);
        }

        if (product.stock < item.cantidad) {
          throw new BadRequestException(`Stock insuficiente para: ${product.nombre}`);
        }

        // Descontar stock
        await tx.producto.update({
          where: { id: product.id },
          data: { stock: { decrement: item.cantidad } },
        });

        // Calcular subtotal
        subtotal += product.precio * item.cantidad;

        orderDetails.push({
          productoId: product.id,
          cantidad: item.cantidad,
          precio: product.precio,
        });
      }

      // Costo de envío
      const shippingCost = createOrderDto.metodoEnvio === 'Local' ? 8000 : 0;
      const total = subtotal + shippingCost;

      // Generar código
      const codigo = `PED-${Date.now().toString().slice(-6)}`;

      // Insertar pedido
      const order = await tx.pedido.create({
        data: {
          codigo,
          usuarioId: userId || null,
          nombreCliente: createOrderDto.nombreCliente,
          telefono: createOrderDto.telefono,
          direccion: createOrderDto.direccion,
          ciudad: createOrderDto.ciudad,
          metodoEnvio: createOrderDto.metodoEnvio,
          metodoPago: createOrderDto.metodoPago,
          notas: createOrderDto.notas,
          total,
          detalles: {
            create: orderDetails,
          },
        },
        include: {
          detalles: {
            include: { producto: true },
          },
        },
      });

      return order;
    });
  }

  async findAll(estado?: EstadoPedido) {
    const where = estado ? { estado } : {};
    return this.prisma.pedido.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { 
        detalles: { include: { producto: true } }, 
        usuario: true 
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.pedido.findUnique({
      where: { id },
      include: {
        detalles: {
          include: { producto: true },
        },
        usuario: true,
      },
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async updateEstado(id: string, estado: EstadoPedido) {
    const order = await this.prisma.pedido.findUnique({
      where: { id },
      include: { detalles: true },
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');

    // Restituir stock si se cancela el pedido
    if (order.estado !== 'CANCELADO' && estado === 'CANCELADO') {
      return this.prisma.$transaction(async (tx) => {
        for (const item of order.detalles) {
          await tx.producto.update({
            where: { id: item.productoId },
            data: { stock: { increment: item.cantidad } },
          });
        }
        return tx.pedido.update({
          where: { id },
          data: { estado },
          include: { detalles: { include: { producto: true } }, usuario: true },
        });
      });
    }

    // Re-descontar stock si se reactiva un pedido cancelado
    if (order.estado === 'CANCELADO' && estado !== 'CANCELADO') {
      return this.prisma.$transaction(async (tx) => {
        for (const item of order.detalles) {
          await tx.producto.update({
            where: { id: item.productoId },
            data: { stock: { decrement: item.cantidad } },
          });
        }
        return tx.pedido.update({
          where: { id },
          data: { estado },
          include: { detalles: { include: { producto: true } }, usuario: true },
        });
      });
    }

    return this.prisma.pedido.update({
      where: { id },
      data: { estado },
      include: { detalles: { include: { producto: true } }, usuario: true },
    });
  }

  async findOneByCode(codigo: string) {
    const order = await this.prisma.pedido.findUnique({
      where: { codigo },
      include: {
        detalles: {
          include: { producto: true },
        },
        usuario: {
          select: { id: true, nombre: true, email: true },
        },
      },
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async trackOrder(query: string) {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      throw new BadRequestException('Debes ingresar un código de pedido o número de teléfono');
    }

    const digits = cleanQuery.replace(/\D/g, '');

    // Si tiene formato de código de pedido
    if (cleanQuery.toUpperCase().startsWith('PED-') || (digits.length < 7 && isNaN(Number(cleanQuery)))) {
      const order = await this.prisma.pedido.findFirst({
        where: {
          codigo: { equals: cleanQuery, mode: 'insensitive' },
        },
        include: {
          detalles: { include: { producto: true } },
        },
      });
      if (!order) throw new NotFoundException(`No encontramos ningún pedido con el código "${cleanQuery}"`);
      return [order];
    }

    // Búsqueda por teléfono o coincidencia parcial
    const orders = await this.prisma.pedido.findMany({
      where: {
        OR: [
          { codigo: { contains: cleanQuery, mode: 'insensitive' } },
          { telefono: { contains: digits.length >= 7 ? digits.slice(-10) : cleanQuery } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        detalles: { include: { producto: true } },
      },
    });

    if (!orders || orders.length === 0) {
      throw new NotFoundException(`No encontramos pedidos asociados a "${cleanQuery}"`);
    }

    return orders;
  }

  async uploadComprobante(codigo: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Debes adjuntar un archivo de comprobante');
    }

    const order = await this.prisma.pedido.findUnique({ where: { codigo } });
    if (!order) {
      throw new NotFoundException(`Pedido ${codigo} no encontrado`);
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Formato no permitido. Solo imágenes JPG, PNG, WEBP o documentos PDF.');
    }

    const baseUploadDir = process.env.UPLOAD_DIR || 'uploads';
    const comprobantesDir = join(process.cwd(), baseUploadDir, 'comprobantes');
    if (!fs.existsSync(comprobantesDir)) {
      fs.mkdirSync(comprobantesDir, { recursive: true });
    }

    let filename = '';
    if (file.mimetype === 'application/pdf') {
      filename = `${uuidv4()}.pdf`;
      const filepath = join(comprobantesDir, filename);
      fs.writeFileSync(filepath, file.buffer);
    } else {
      filename = `${uuidv4()}.webp`;
      const filepath = join(comprobantesDir, filename);
      await sharpModule(file.buffer)
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(filepath);
    }

    const comprobanteUrl = `/uploads/comprobantes/${filename}`;

    const updatedOrder = await this.prisma.pedido.update({
      where: { codigo },
      data: { comprobantePago: comprobanteUrl },
      include: {
        detalles: { include: { producto: true } },
      },
    });

    return {
      message: 'Comprobante cargado exitosamente',
      comprobanteUrl,
      order: updatedOrder,
    };
  }
}
