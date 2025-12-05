import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';

export interface DesignPreferences {
  dark_mode?: boolean;
  animation_level?: 'none' | 'low' | 'medium' | 'high';
  high_contrast?: boolean;
  pixel_density?: 'minimal' | 'normal' | 'heavy';
  neon_intensity?: 'low' | 'medium' | 'high';
}

export interface DesignResult {
  css: string;
  explanation: string;
  colors: string[];
}

export interface ModerationResult {
  safe: boolean;
  score: number;
  flags: string[];
  action: 'approve' | 'reject' | 'review';
  reason?: string;
}

@Injectable()
export class AiServiceService {
  private readonly logger = new Logger(AiServiceService.name);
  private readonly aiServiceUrl: string;
  private readonly apiKey: string;

  constructor(private readonly httpService: HttpService) {
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    this.apiKey = process.env.AI_SERVICE_API_KEY || 'internal-service-key';
  }

  /**
   * Generate CSS from an inspiration image
   */
  async generateCSSFromImage(
    imageBuffer: Buffer,
    preferences?: DesignPreferences,
  ): Promise<DesignResult> {
    try {
      const formData = new FormData();
      formData.append('image', imageBuffer, {
        filename: 'inspiration.jpg',
        contentType: 'image/jpeg',
      });

      if (preferences) {
        formData.append('preferences', JSON.stringify(preferences));
      }

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.aiServiceUrl}/design/from-image`,
          formData,
          {
            headers: {
              'X-API-Key': this.apiKey,
              ...formData.getHeaders(),
            },
          },
        ),
      );

      this.logger.log('Generated CSS from image successfully');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to generate CSS from image:', error.message);
      throw new HttpException(
        'Failed to generate design from image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate CSS from a text description
   */
  async generateCSSFromDescription(
    description: string,
    preferences?: DesignPreferences,
  ): Promise<DesignResult> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.aiServiceUrl}/design/from-description`,
          {
            description,
            preferences,
          },
          {
            headers: {
              'X-API-Key': this.apiKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log('Generated CSS from description successfully');
      return response.data;
    } catch (error) {
      this.logger.error(
        'Failed to generate CSS from description:',
        error.message,
      );
      throw new HttpException(
        'Failed to generate design from description',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Moderate an image (placeholder - auto-approve for now)
   * TODO: Implement actual vision-based moderation
   */
  async moderateImage(imageBuffer: Buffer): Promise<ModerationResult> {
    // Placeholder implementation - auto-approve
    this.logger.log('Image moderation (placeholder): auto-approved');

    // TODO: Call AI service endpoint when implemented
    // const response = await firstValueFrom(
    //   this.httpService.post(
    //     `${this.aiServiceUrl}/moderate/image`,
    //     formData,
    //     { headers: { 'X-API-Key': this.apiKey } }
    //   )
    // );

    return {
      safe: true,
      score: 1.0,
      flags: [],
      action: 'approve',
    };
  }

  /**
   * Moderate text content (placeholder - auto-approve for now)
   * TODO: Implement actual text moderation with Claude
   */
  async moderateText(content: string): Promise<ModerationResult> {
    // Placeholder implementation - auto-approve
    this.logger.log('Text moderation (placeholder): auto-approved');

    // TODO: Call AI service endpoint when implemented
    // const response = await firstValueFrom(
    //   this.httpService.post(
    //     `${this.aiServiceUrl}/moderate/text`,
    //     { content },
    //     { headers: { 'X-API-Key': this.apiKey } }
    //   )
    // );

    return {
      safe: true,
      score: 1.0,
      flags: [],
      action: 'approve',
    };
  }

  /**
   * Health check for AI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/health`),
      );
      return response.status === 200;
    } catch (error) {
      this.logger.warn('AI service health check failed:', error.message);
      return false;
    }
  }
}
