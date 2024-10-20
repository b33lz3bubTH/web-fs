import { api } from "encore.dev/api";
import crypto from "crypto";
import { PrismaService } from "../libs/db/prisma";

const prismaService = await new PrismaService().connect();
const prisma = prismaService?.getClient();

export const rootInit = api.raw(
    { expose: true, path: "/root-user/init", method: "POST" },
    async (_req, resp) => {
        if (!prisma) {
            throw new Error(`db connection failed.`);
        }
        const initUser = {
            email: "sourav@sourav.com",
            password: "sourav123",
        };
        let rootUser = await prisma.rootUser.findFirst({
            where: {
                role: 100,
                email: initUser.email,
            },
        });
        if (!rootUser) {
            rootUser = await prisma.rootUser.create({
                data: { ...initUser },
            });
        }
        resp.setHeader("Content-Type", "application/json");
        return resp.end(JSON.stringify(rootUser));
    },
);

interface RootLoginParams {
    email: string;
    password: string;
}
function generateUniqueString(length = 10) {
    return crypto
        .randomBytes(length)
        .toString("base64")
        .replace(/\+/g, "0")
        .substring(0, length);
}

export const rootLogin = api(
    { method: "GET", path: "/root-login" },
    async (
        params: RootLoginParams,
    ): Promise<{ valid: boolean; sessionToken: string }> => {
        if (!prisma) {
            throw new Error(`db connection failed.`);
        }

        const { email, password } = params;
        let rootUser = await prisma.rootUser.findFirst({
            where: { email, password },
        });

        if (!rootUser) {
            throw new Error(`invalid login creds.`);
        }
        const sessionToken = await prisma.rootUserSession.create({
            data: {
                expiresAt: new Date(Date.now() + 86400000),
                email: rootUser.email,
                sessionId: generateUniqueString(14),
            },
        });
        return {
            valid: rootUser ? true : false,
            sessionToken: sessionToken.sessionId,
        };
    },
);

export const validateSession = api(
    { method: "GET", path: "/verify-session", expose: true },
    async ({
        token,
    }: {
        token: string;
    }): Promise<{ email: string; role: number }> => {
        if (!prisma) {
            throw new Error(`db connection failed.`);
        }

        const session = await prisma.rootUserSession.findFirst({
            where: {
                sessionId: token,
            },
        });
        if (!session) {
            throw new Error(`invalid session`);
        }

        if (new Date() > new Date(session.expiresAt)) {
            throw new Error(`session has expired`);
        }

        const user = await prisma.rootUser.findFirst({
            where: {
                email: session.email,
            },
        });
        if (!user) throw new Error(`root user missing`);

        return {
            role: user.role,
            email: session.email,
        };
    },
);
