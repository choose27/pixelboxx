// @ts-nocheck
import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PixelPagesService } from './pixelpages.service';
import { UpdatePixelPageDto } from './dto/update-pixelpage.dto';
import { UpdateCssDto } from './dto/update-css.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { GenerateDesignFromImageDto } from './dto/generate-design-from-image.dto';
import { GenerateDesignFromDescriptionDto } from './dto/generate-design-from-description.dto';
import { AiServiceService } from '../ai-service/ai-service.service';

@Controller('pixelpages')
export class PixelPagesController {
  constructor(
    private readonly pixelPagesService: PixelPagesService,
    private readonly aiServiceService: AiServiceService,
  ) {}

  /**
   * GET /pixelpages/:username - View public profile
   */
  @Get(':username')
  async getByUsername(@Param('username') username: string) {
    return this.pixelPagesService.getByUsername(username);
  }

  /**
   * GET /pixelpages/me - Get own profile for editing
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getOwnPage(@Req() req: any) {
    return this.pixelPagesService.getOwnPage(req.user.id);
  }

  /**
   * PUT /pixelpages/me - Update profile
   */
  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updatePage(@Req() req: any, @Body() dto: UpdatePixelPageDto) {
    return this.pixelPagesService.updatePage(req.user.id, dto);
  }

  /**
   * PUT /pixelpages/me/css - Update custom CSS only
   */
  @Put('me/css')
  @UseGuards(JwtAuthGuard)
  async updateCss(@Req() req: any, @Body() dto: UpdateCssDto) {
    return this.pixelPagesService.updateCss(req.user.id, dto);
  }

  /**
   * POST /pixelpages/me/sections - Add section
   */
  @Post('me/sections')
  @UseGuards(JwtAuthGuard)
  async createSection(@Req() req: any, @Body() dto: CreateSectionDto) {
    return this.pixelPagesService.createSection(req.user.id, dto);
  }

  /**
   * PUT /pixelpages/me/sections/:id - Update section
   */
  @Put('me/sections/:id')
  @UseGuards(JwtAuthGuard)
  async updateSection(
    @Req() req: any,
    @Param('id') sectionId: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.pixelPagesService.updateSection(req.user.id, sectionId, dto);
  }

  /**
   * DELETE /pixelpages/me/sections/:id - Remove section
   */
  @Delete('me/sections/:id')
  @UseGuards(JwtAuthGuard)
  async deleteSection(@Req() req: any, @Param('id') sectionId: string) {
    return this.pixelPagesService.deleteSection(req.user.id, sectionId);
  }

  /**
   * POST /pixelpages/me/design/from-image - Generate CSS from inspiration image
   */
  @Post('me/design/from-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async generateDesignFromImage(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: GenerateDesignFromImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }

    // Generate CSS from image using AI service
    const result = await this.aiServiceService.generateCSSFromImage(
      file.buffer,
      dto.preferences,
    );

    return result;
  }

  /**
   * POST /pixelpages/me/design/from-description - Generate CSS from text description
   */
  @Post('me/design/from-description')
  @UseGuards(JwtAuthGuard)
  async generateDesignFromDescription(
    @Req() req: any,
    @Body() dto: GenerateDesignFromDescriptionDto,
  ) {
    // Generate CSS from description using AI service
    const result = await this.aiServiceService.generateCSSFromDescription(
      dto.description,
      dto.preferences,
    );

    return result;
  }
}
