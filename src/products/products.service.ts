import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from '../common';
import { constants } from 'buffer';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit{

  private readonly logger = new Logger('ProductsService');
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create(
      {
        data: createProductDto
      },
    );
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalPages = await this.product.count({where: {available: true}});
    const lastPage = Math.ceil(totalPages / limit);

    return { 
    data: await this.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {available: true}
    }),
    meta:{
      totalItems: totalPages,
      page: page,
      lastPage: lastPage
    }
  }
}

  async findOne(id: number) {
    const product= await this.product.findFirst({
      where: {id, available: true}
    });

    if(!product){
      throw new NotFoundException('Product not found with id: '+id);
    }
    return product;
  }

  async update(updateProductDto: UpdateProductDto) {
    const {id,...data} = updateProductDto;
    const product = await this.findOne(id);
    return this.product.update({
      where: {id},
      data: data
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    const product = await this.product.update({
      where: {id},
      data: {available: false}
    });
    return product;
  }
}
