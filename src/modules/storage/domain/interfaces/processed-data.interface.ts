import { FilterQuery } from "mongoose";
import { ProcessedData } from "../schemas/processed-data.schema";


export interface IProcessedDataRepository {
    insertProcessedData(doc: ProcessedData): Promise<ProcessedData>;
    insertManyProcessedData(docs: ProcessedData[]): Promise<{ inserted: number }>;
    findOneProcessedData(filter: FilterQuery<ProcessedData>,): Promise<ProcessedData | null>;
    findManyProcessedData(filter: FilterQuery<ProcessedData>,): Promise<ProcessedData[]>;
    updateOneProcessedData(filter: FilterQuery<ProcessedData>, doc: ProcessedData): Promise<ProcessedData | null>;
    deleteOneProcessedData(filter: FilterQuery<ProcessedData>,): Promise<ProcessedData | null>;
}

export const PROCESSED_DATA_REPOSITORY = 'PROCESSED_DATA_REPOSITORY';
