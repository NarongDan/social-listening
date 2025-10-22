import { FilterQuery } from "mongoose";
import { RawData } from "../schemas/raw-data.schema";
import { NewRawData } from "../types/raw-data.types";

export interface IRawDataRepository {
    insert(doc: NewRawData): Promise<RawData>;
    insertMany(docs: NewRawData[]): Promise<{ inserted: number }>;
    findOne(filter: FilterQuery<RawData>,): Promise<RawData | null>;
    findManyRawData(filter: FilterQuery<RawData>,): Promise<RawData[]>;
    updateOneRawData(filter: FilterQuery<RawData>, doc: NewRawData): Promise<RawData | null>;
    deleteOneRawData(filter: FilterQuery<RawData>,): Promise<RawData | null>;
}

export const RAW_DATA_REPOSITORY = 'RAW_DATA_REPOSITORY';
