import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MongooseConfigService } from "mongoose.config";
import { MARKDOWN_MODEL_NAME, MarkdownSchema } from "./markdown.model";
import { MarkdownController } from "./markdown.controller";
import { MarkdownService } from "./markdown.service";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    MongooseModule.forFeature([{ name: MARKDOWN_MODEL_NAME, schema: MarkdownSchema }])
  ],
  controllers: [MarkdownController],
  providers: [MarkdownService, MongooseConfigService],
})

export class MarkdownModule {}