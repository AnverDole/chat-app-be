import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthSharedModule } from "src/auth-shared.module";

@Module({
    imports: [AuthSharedModule],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [],
})
export class AuthModule {}
