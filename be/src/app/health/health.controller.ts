import {Controller, Get, ServiceUnavailableException} from "@nestjs/common";
import {DataSource} from "typeorm";

import {Public} from "@/shared/decorators/auth.decorator";

@Public()
@Controller("health")
export class HealthController {
    constructor(private readonly dataSource: DataSource) {}

    @Get("live")
    live(): {status: "ok"} {
        return {status: "ok"};
    }

    @Get("ready")
    async ready(): Promise<{status: "ok"}> {
        try {
            await this.dataSource.query("SELECT 1");
        } catch {
            throw new ServiceUnavailableException("Database is unavailable");
        }

        return {status: "ok"};
    }
}
