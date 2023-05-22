export interface IprocessEnv {
    PORT_NUMBER: string;
    ORIGINS: string;
    DB_CONNECT: string;
    BCRYPT_SALT_ROUNDS: string;
    COOKIE_PARSER_SECRET_KEY: string;
    JWT_SECRET_KEY: string;
    JWT_EXPIRY: string;
    COOKIE_MAX_AGE: string;
    ACCESS_TOKEN_EXPIRY: string;
}

declare global {
    namespace NodeJS {
        interface ProcessEnv extends IprocessEnv { }
    }
}
export { }