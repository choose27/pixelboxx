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
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ThemesService } from './themes.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';

@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  /**
   * GET /themes - Browse public themes (paginated)
   */
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.themesService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
    );
  }

  /**
   * GET /themes/:id - Get theme details
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.themesService.findOne(id);
  }

  /**
   * POST /themes - Create/publish theme
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() dto: CreateThemeDto) {
    return this.themesService.create(req.user.id, dto);
  }

  /**
   * PUT /themes/:id - Update own theme
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateThemeDto,
  ) {
    return this.themesService.update(req.user.id, id, dto);
  }

  /**
   * DELETE /themes/:id - Delete own theme
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.themesService.delete(req.user.id, id);
  }

  /**
   * POST /themes/:id/use - Apply theme to profile
   */
  @Post(':id/use')
  @UseGuards(JwtAuthGuard)
  async useTheme(@Req() req: any, @Param('id') id: string) {
    return this.themesService.useTheme(req.user.id, id);
  }
}
