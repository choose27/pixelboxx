import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GuestbookService } from './guestbook.service';
import { CreateGuestbookEntryDto } from './dto/create-guestbook-entry.dto';

@Controller('guestbook')
export class GuestbookController {
  constructor(private readonly guestbookService: GuestbookService) {}

  /**
   * GET /guestbook/:username - List entries (paginated)
   */
  @Get(':username')
  async findAll(
    @Param('username') username: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.guestbookService.findAll(
      username,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  /**
   * POST /guestbook/:username - Leave entry
   */
  @Post(':username')
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('username') username: string,
    @Req() req: any,
    @Body() dto: CreateGuestbookEntryDto,
  ) {
    return this.guestbookService.create(username, req.user.id, dto);
  }

  /**
   * DELETE /guestbook/:id - Delete own entry
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.guestbookService.delete(req.user.id, id);
  }

  /**
   * PUT /guestbook/:id/hide - Owner can hide/unhide entries
   */
  @Put(':id/hide')
  @UseGuards(JwtAuthGuard)
  async toggleHidden(@Req() req: any, @Param('id') id: string) {
    return this.guestbookService.toggleHidden(req.user.id, id);
  }
}
