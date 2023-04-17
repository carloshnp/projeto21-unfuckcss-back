import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { Octokit } from '@octokit/rest';
import { MongooseConfigService } from 'mongoose.config';
import { Markdown, MarkdownDocument } from './markdown.model';
import { marked } from 'marked';

interface MarkdownFile {
  name: string;
  content: {
    sha: string;
    node_id: string;
    size: number;
    url: string;
    content: string;
    encoding: string;
  }
}

@Injectable()
export class MarkdownService {
  constructor(
    private readonly configService: MongooseConfigService,
    @InjectModel('Markdown')
    private readonly markdownModel: Model<MarkdownDocument>,
  ) {}

  async getMarkdownFilesFromGitHub(accessToken: string, owner: string, repo: string): Promise<MarkdownFile[]> {
    const octokit = new Octokit({ auth: accessToken });
    const result = await octokit.git.getTree({
        owner,
        repo,
        tree_sha: 'HEAD',
        recursive: 'true',
    });
    const tree = result?.data?.tree;
    if (!tree) {
        throw new Error('Unable to retrieve markdown files');
    }
    const markdownFiles = await Promise.all(
        tree.map(async (file: any) => {
            if (file.path.endsWith('.md')) {
                const { data: content } = await octokit.request('GET ' + file.url);
                return {
                    name: file.path,
                    content,
                };
            }
            return null;
        })
    )
    return markdownFiles.filter((file: MarkdownFile) => file !== null) as MarkdownFile[];
  }

  async saveMarkdownFiles(
    accessToken: string,
    owner: string,
    repo: string,
    userId: string
  ): Promise<void> {
    try {
      console.log(userId, 'ok');
      const files = await this.getMarkdownFilesFromGitHub(accessToken, owner, repo);
      await Promise.all(
        files.map(async (file) => {
            console.log(accessToken, owner, repo, userId);
            const { name, content } = file;
            const htmlContent = marked(content.content);
            await this.markdownModel.findOneAndUpdate(
                { name, owner, repo },
                { content: htmlContent, user: userId },
                { upsert: true }
            );
        }),
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getMarkdownFiles(userId: string): Promise<Markdown[]> {
    const markdownFiles = await this.markdownModel.find({ user: userId }).populate('user');
    return markdownFiles;
  }
}
