import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MongooseConfigSerice implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: 'mongodb://localhost:27017/unfuckcss',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    };
  }
}