import {NestFactory} from "@nestjs/core";

import {AppModule} from "./app/app.module";
import {configureApplication} from "./app/application-setup";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableShutdownHooks();
    configureApplication(app);

    await app.listen(process.env.BE_PORT ?? 3000);
}
void bootstrap();
