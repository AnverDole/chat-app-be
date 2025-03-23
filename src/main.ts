import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { BadRequestException, ValidationPipe } from "@nestjs/common";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = new ConfigService();

    // Enable CORS
    app.enableCors({
        origin: configService.get<string>("WEB_APP_URL"),
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            exceptionFactory: (errors) => {
                const formattedErrors = {};
                errors.forEach((err) => {
                    const constraints = Object.values(err.constraints || {});
                    if (constraints.length) {
                        formattedErrors[err.property] = constraints[0]; // or join them if you want all
                    }
                });
                return new BadRequestException({ errors: formattedErrors });
            },
        }),
    );

    await app.listen(
        configService.get<number>("SERVER_PORT") ??
            configService.get<number>("PORT") ??
            8000,
    );
}

void bootstrap();
