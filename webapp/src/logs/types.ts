import { UploadResponse, SummarizeResponse } from "../services";

export type FileEntry = UploadResponse & Partial<SummarizeResponse> & {
  isValidated: boolean
};