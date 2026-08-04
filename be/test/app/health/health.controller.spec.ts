import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {ServiceUnavailableException} from "@nestjs/common";
import {HealthController} from "src/app/health/health.controller";
import {DataSource} from "typeorm";

describe("HealthController", () => {
    const dataSource = {
        query: jest.fn(),
    } as unknown as DataSource;
    const controller = new HealthController(dataSource);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("reports liveness without querying dependencies", () => {
        expect(controller.live()).toEqual({status: "ok"});
        expect(dataSource.query).not.toHaveBeenCalled();
    });

    it("reports readiness when PostgreSQL is reachable", async () => {
        jest.mocked(dataSource.query).mockResolvedValueOnce([{"?column?": 1}]);

        await expect(controller.ready()).resolves.toEqual({status: "ok"});
        expect(dataSource.query).toHaveBeenCalledWith("SELECT 1");
    });

    it("returns 503 when PostgreSQL is unavailable", async () => {
        jest.mocked(dataSource.query).mockRejectedValueOnce(new Error("offline"));

        await expect(controller.ready()).rejects.toBeInstanceOf(
            ServiceUnavailableException,
        );
    });
});
