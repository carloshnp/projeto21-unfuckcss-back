import mongoose, { Document, Schema } from "mongoose";
import { User, UserDocument } from "src/schema/user.schema/user.schema";

export interface Markdown {
    name: string;
    owner: string;
    repo: string;
    content: string;
    user: UserDocument["_id"];
}

export type MarkdownDocument = Markdown & Document;

export const MarkdownSchema = new Schema<Markdown>({
    name: { type: String, required: true },
    owner: { type: String, required: true },
    repo: { type: String, required: true },
    content: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export const MARKDOWN_MODEL_NAME = 'Markdown';