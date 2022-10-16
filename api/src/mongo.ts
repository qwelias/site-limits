import { MongoClient } from 'mongodb'
import { config } from './config'

export const mc = new MongoClient(config.mongo.url as string)
