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
import { BoxxesService } from './boxxes.service';
import { CreateBoxxDto } from './dto/create-boxx.dto';
import { UpdateBoxxDto } from './dto/update-boxx.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { AuthRequest } from '../types/request.interface';

@Controller('boxxes')
@UseGuards(JwtAuthGuard)
export class BoxxesController {
  constructor(private boxxesService: BoxxesService) {}

  @Post()
  create(@Request() req: AuthRequest, @Body() dto: CreateBoxxDto) {
    return this.boxxesService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Query('take') take?: string, @Query('skip') skip?: string) {
    return this.boxxesService.findAll(
      take ? parseInt(take) : 50,
      skip ? parseInt(skip) : 0,
    );
  }

  @Get('me')
  getUserBoxxes(@Request() req: AuthRequest) {
    return this.boxxesService.getUserBoxxes(req.user.id);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string, @Request() req: AuthRequest) {
    return this.boxxesService.findBySlug(slug, req.user?.id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Request() req: AuthRequest, @Body() dto: UpdateBoxxDto) {
    return this.boxxesService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.boxxesService.delete(id, req.user.id);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.boxxesService.getMembers(id);
  }

  @Post(':id/join')
  join(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.boxxesService.join(id, req.user.id);
  }

  @Delete(':id/leave')
  leave(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.boxxesService.leave(id, req.user.id);
  }

  @Post(':id/invites')
  createInvite(@Param('id') id: string, @Request() req: AuthRequest, @Body() dto: CreateInviteDto) {
    return this.boxxesService.createInvite(id, req.user.id, dto);
  }

  @Post('join/:code')
  joinWithInvite(@Param('code') code: string, @Request() req: AuthRequest) {
    return this.boxxesService.joinWithInvite(code, req.user.id);
  }
}
