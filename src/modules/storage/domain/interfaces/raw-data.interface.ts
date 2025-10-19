import { RawData } from "../schemas/raw-data.schema";
import { NewRawData } from "../types/raw-data.types";

export interface IRawDataRepository {
    insert(doc: NewRawData): Promise<RawData>;
    insertMany(docs: NewRawData[]): Promise<{ inserted: number }>;
}

export const RAW_DATA_REPOSITORY = 'RAW_DATA_REPOSITORY';
