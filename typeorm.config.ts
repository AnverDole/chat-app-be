import * as dotenv from "dotenv";
import { DataSource } from "typeorm";

dotenv.config();

export default new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? "3306"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ["src/**/*.entity.ts"],
    migrations: [
        process.env.NODE_ENV === "production"
            ? "dist/migrations/*.js"
            : "src/migrations/*.ts",
    ],
    synchronize: false, // <-- important: don't enable this. synchronizations are handled by migrations
}); 