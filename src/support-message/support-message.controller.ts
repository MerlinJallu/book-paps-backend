import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { CreateSupportMessageDto } from '../dto/create-support-message.dto';
import { SupportMessageResponse, SupportMessageService } from './support-message.service';

@Controller('support-message')
export class SupportMessageController {
  constructor(private readonly supportMessageService: SupportMessageService) {}

  @Post()
  create(
    @Body() createSupportMessageDto: CreateSupportMessageDto,
    @Req() request: Request,
  ): Promise<SupportMessageResponse> {
    return this.supportMessageService.send(createSupportMessageDto, getClientIp(request));
  }
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers['x-forwarded-for'];
  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0];

  return (
    forwardedIp?.trim() ||
    request.ip ||
    request.socket.remoteAddress ||
    'unknown'
  );
}
