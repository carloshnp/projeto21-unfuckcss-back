import { Body, Controller, Post, UseGuards, Req, Get } from '@nestjs/common';
import { MarkdownService } from './markdown.service';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import { User } from 'src/schema/user.schema/user.schema';

interface AuthenticatedRequest extends ExpressRequest {
  user: User;
}

@Controller('markdown')
export class MarkdownController {
  constructor(private readonly markdownService: MarkdownService) {}

  @Post('fetch')
  @UseGuards(JwtAuthGuard)
  async fetchMarkdown(@Body() body: { accessToken: string, owner: string, repo: string }, @Req() request: AuthenticatedRequest): Promise<void> {
    const { accessToken, owner, repo } = body;
    const { userId } = request.user;
    await this.markdownService.saveMarkdownFiles(accessToken, owner, repo, userId);
    const markdownFiles = await this.markdownService.getMarkdownFiles(userId);
    console.log(markdownFiles);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getMarkdownFiles(@Req() request: AuthenticatedRequest) {
    const { userId } = request.user;
    const markdownFiles = await this.markdownService.getMarkdownFiles(userId);
    return markdownFiles;
  }

}
