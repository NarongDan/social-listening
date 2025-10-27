import { FilterQuery } from "mongoose";
import { ProcessedData } from "../schemas/processed-data.schema";
import { SentimentAnalysis } from "../schemas/sentiment-analysis.schema";


export interface ISentimentAnalysisRepository {
    insertOneSentimentAnalysis(doc: SentimentAnalysis): Promise<SentimentAnalysis>;
    // insertManyProcessedData(docs: ProcessedData[]): Promise<{ inserted: number }>;
    findOneSentimentAnalysis(filter: FilterQuery<SentimentAnalysis>,): Promise<SentimentAnalysis | null>;
    // findManyProcessedData(filter: FilterQuery<ProcessedData>,): Promise<ProcessedData[]>;
    // updateOneProcessedData(filter: FilterQuery<ProcessedData>, doc: ProcessedData): Promise<ProcessedData | null>;
    // deleteOneProcessedData(filter: FilterQuery<ProcessedData>,): Promise<ProcessedData | null>;
}

export const SENTIMENT_ANALYSIS_REPOSITORY = 'SENTIMENT_ANALYSIS_REPOSITORY';
