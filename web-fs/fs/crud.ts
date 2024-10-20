import { Query, api } from "encore.dev/api";
import { Inode } from "../libs/common/vfs/types";
import { FileSystemManager } from "../libs/common/vfs/virtual-file-system";
import { validateSession } from "../users/crud";
import { parse } from "url";

import fs from "fs";
import path from "path";

interface GetDirFilesParams {
    token: string;
    path: Query<string>; // always a query parameter
}
interface GetDirFilesReponse {
    results: Inode[];
    count: number;
}

const vfs = new FileSystemManager("/home/sourav/Downloads");

export const getDirFiles = api(
    { method: "GET", expose: true, path: "/fs" },
    async (p: GetDirFilesParams): Promise<GetDirFilesReponse> => {
        //const user = await validateSession({ token: p.token });
        //if (!user) {
        // throw new Error("invalid session");
        //}
        const files = await vfs.lazyLoadTraverse(p.path);
        return {
            count: files.length,
            results: files,
        };
    },
);

export const accessFile = api.raw(
    { method: "GET", expose: true, path: "/fs/stream-video" },
    async (req, res): Promise<void> => {
        const url = req.url ?? "";
        const query = parse(url, true).query;
        const encodedFilePath = query.filePath as string;
        const token = query.token as string;

        //const user = await validateSession({ token });
        //if (!user) {
        // res.end("invalid session");
        //return;
        //}

        const filePath = decodeURIComponent(encodedFilePath);
        const absFilePath = path.normalize(vfs.getFullSystemPath(filePath));

        fs.stat(`${absFilePath}`, (err, stats) => {
            if (err) {
                console.error("File not found:", err);
                res.writeHead(404, { "Content-Type": "text/plain" });
                return res.end("File not found");
            }

            const fileSize = stats.size;
            const CHUNK_SIZE = 10 ** 6; // 1MB (customizable chunk size)

            const range = req.headers.range;

            let start = 0;
            let end = fileSize - 1;

            if (range) {
                const parts = range.replace(/bytes=/, "").split("-");
                start = parseInt(parts[0], 10);

                if (parts[1]) {
                    end = parseInt(parts[1], 10);
                } else {
                    end = Math.min(start + CHUNK_SIZE, fileSize - 1);
                }

                if (start >= fileSize || end >= fileSize) {
                    res.writeHead(416, { "Content-Type": "text/plain" });
                    return res.end("Requested range not satisfiable");
                }

                res.writeHead(206, {
                    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": end - start + 1,
                    "Content-Type": "video/mp4", // or 'video/x-matroska' for MKV
                });
            } else {
                res.writeHead(200, {
                    "Content-Length": fileSize,
                    "Content-Type": "video/mp4", // or 'video/x-matroska' for MKV
                });
            }

            const videoStream = fs.createReadStream(absFilePath, {
                start,
                end,
            });

            videoStream.pipe(res);

            videoStream.on("error", (streamErr) => {
                console.error("Error streaming file:", streamErr);
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Error streaming file");
            });
        });
    },
);
