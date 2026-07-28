import * as dotenv from "dotenv";
import {DataSource} from "typeorm";
import {SnakeNamingStrategy} from "typeorm-naming-strategies";

dotenv.config({path: "../.env"});

const {NODE_ENV} = process.env;

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ["src/**/*.entity.ts"],
    migrations: ["src/migrations/**/*.ts"],
    synchronize: NODE_ENV === "development",
    namingStrategy: new SnakeNamingStrategy(),
    logging: true,
});

export default AppDataSource;
