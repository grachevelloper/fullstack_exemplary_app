/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {NestFactory} from "@nestjs/core";

import {AppModule} from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix("/api");
    const server = app.getHttpServer();
    const router = server._router;
    console.log("=== ALL REGISTERED ROUTES ===");
    if (router && router.stack) {
        console.log("=== ALL REGISTERED ROUTES ===");
        router.stack.forEach((layer: any) => {
            if (layer.route) {
                const methods = Object.keys(layer.route.methods)
                    .join(", ")
                    .toUpperCase();
                console.log(`${methods} ${layer.route.path}`);
            }
        });
    } else {
        console.log("=== GETTING ROUTES AFTER APP INIT ===");
        // Или просто подождем инициализации
        await app.init();

        const adapter = app.getHttpAdapter();
        console.log("HTTP adapter:", adapter.constructor.name);
    }

    await app.listen(process.env.BE_PORT ?? 3000);
}
bootstrap();
