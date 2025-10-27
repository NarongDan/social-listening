import { FilterQuery } from "mongoose";
import { RawData } from "../schemas/raw-data.schema";
import { NewRawData } from "../types/raw-data.types";

export interface IRawDataRepository {
    insertRawData(doc: NewRawData): Promise<RawData>;
    insertManyRawData(docs: NewRawData[]): Promise<{ inserted: number }>;
    findOneRawData(filter: FilterQuery<RawData>,): Promise<RawData | null>;
    findManyRawData(filter: FilterQuery<RawData>,): Promise<RawData[]>;
    updateOneRawData(filter: FilterQuery<RawData>, doc: NewRawData): Promise<RawData | null>;
    deleteOneRawData(filter: FilterQuery<RawData>,): Promise<RawData | null>;
}

export const RAW_DATA_REPOSITORY = 'RAW_DATA_REPOSITORY';
