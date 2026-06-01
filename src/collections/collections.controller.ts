import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { CollectionResponse, CollectionsService } from './collections.service';
import { CreateCollectionDto } from '../dto/create-collection.dto';
import { UpdateCollectionDto } from '../dto/update-collection.dto';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  findAll(): Promise<CollectionResponse[]> {
    return this.collectionsService.findAll();
  }

  @Post()
  create(@Body() createCollectionDto: CreateCollectionDto): Promise<CollectionResponse> {
    return this.collectionsService.create(createCollectionDto);
  }

  @Put(':slug')
  update(
    @Param('slug') slug: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ): Promise<CollectionResponse> {
    return this.collectionsService.update(slug, updateCollectionDto);
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.OK)
  delete(@Param('slug') slug: string): Promise<CollectionResponse> {
    return this.collectionsService.delete(slug);
  }
}
