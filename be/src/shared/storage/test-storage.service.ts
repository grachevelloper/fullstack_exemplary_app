import {Injectable} from "@nestjs/common";

import {generateKey} from "../utils/generate";
import {
    StoragePort,
    StorageUploadFile,
    StorageUploadResult,
} from "./storage.port";

@Injectable()
export class TestStorageService implements StoragePort {
    private readonly uploadedKeys = new Set<string>();

    async upload(file: StorageUploadFile): Promise<StorageUploadResult> {
        const key = generateKey(file.originalname);
        this.uploadedKeys.add(key);

        return {
            url: `${process.env.S3_PUBLIC_DOMAIN ?? "http://localhost:9000"}/${key}`,
            key,
            mimeType: file.mimetype,
            size: file.size,
        };
    }

    async delete(key: string): Promise<void> {
        this.uploadedKeys.delete(key);
    }
}
