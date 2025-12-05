import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { AuthRequest } from '../types/request.interface';

@Controller()
@UseGuards(JwtAuthGuard)
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @Post('boxxes/:boxxId/channels')
  create(
    @Param('boxxId') boxxId: string,
    @Request() req: AuthRequest,
    @Body() dto: CreateChannelDto,
  ) {
    return this.channelsService.create(boxxId, req.user.id, dto);
  }

  @Get('boxxes/:boxxId/channels')
  findAll(@Param('boxxId') boxxId: string) {
    return this.channelsService.findAll(boxxId);
  }

  @Put('channels/:id')
  update(@Param('id') id: string, @Request() req: AuthRequest, @Body() dto: UpdateChannelDto) {
    return this.channelsService.update(id, req.user.id, dto);
  }

  @Delete('channels/:id')
  delete(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.channelsService.delete(id, req.user.id);
  }

  @Put('channels/:id/position')
  updatePosition(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body('position') position: number,
  ) {
    return this.channelsService.updatePosition(id, req.user.id, position);
  }
}
