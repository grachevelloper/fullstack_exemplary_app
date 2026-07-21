import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";

import {TestStorageService} from "../test-storage.service";
import {STORAGE_PORT} from "../storage.port";
import {S3StorageService} from "./s3.service";

const storageProvider =
    process.env.NODE_ENV === "test" ? TestStorageService : S3StorageService;

@Module({
    imports: [ConfigModule],
    providers: [
        S3StorageService,
        TestStorageService,
        {
            provide: STORAGE_PORT,
            useExisting: storageProvider,
        },
    ],
    exports: [S3StorageService, TestStorageService, STORAGE_PORT],
})
export class S3Module {}
