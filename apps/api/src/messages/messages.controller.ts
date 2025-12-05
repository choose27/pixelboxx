import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { AuthRequest } from '../types/request.interface';

@Controller()
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('channels/:channelId/messages')
  findAll(
    @Param('channelId') channelId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
    @Query('after') after?: string,
  ) {
    return this.messagesService.findAll(
      channelId,
      limit ? parseInt(limit) : 50,
      before,
      after,
    );
  }

  @Get('messages/:id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @Post('channels/:channelId/messages')
  create(
    @Param('channelId') channelId: string,
    @Request() req: AuthRequest,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagesService.create(channelId, req.user.id, dto);
  }

  @Put('messages/:id')
  update(@Param('id') id: string, @Request() req: AuthRequest, @Body() dto: UpdateMessageDto) {
    return this.messagesService.update(id, req.user.id, dto);
  }

  @Delete('messages/:id')
  delete(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.messagesService.delete(id, req.user.id);
  }

  @Put('messages/:id/pin')
  pin(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.messagesService.pin(id, req.user.id);
  }

  @Post('messages/:id/reactions')
  addReaction(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body('emoji') emoji: string,
  ) {
    return this.messagesService.addReaction(id, req.user.id, emoji);
  }

  @Delete('messages/:id/reactions/:emoji')
  removeReaction(
    @Param('id') id: string,
    @Param('emoji') emoji: string,
    @Request() req: AuthRequest,
  ) {
    return this.messagesService.removeReaction(id, req.user.id, emoji);
  }
}
