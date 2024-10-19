import { PrismaClient } from "@prisma/client";
import { Singleton } from "../common/utilts/singleton";

@Singleton
export class PrismaService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    public async connect() {
        try {
            await this.prisma.$connect();
            console.log("Connected to the database");
            return this;
        } catch (error) {
            console.error("Failed to connect to the database", error);
        }
    }

    public getClient(): PrismaClient {
        return this.prisma;
    }

    public async disconnect() {
        await this.prisma.$disconnect();
        console.log("Disconnected from the database");
    }
}
