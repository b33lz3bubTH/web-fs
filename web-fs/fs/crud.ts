import { Query, api } from "encore.dev/api";
import { Inode } from "../libs/common/vfs/types";
import { FileSystemManager } from "../libs/common/vfs/virtual-file-system";
import { validateSession } from "../users/crud";

interface GetDirFilesParams {
    token: string;
    path: Query<string>; // always a query parameter
}
interface GetDirFilesReponse {
    results: Inode[];
    count: number;
}

export const getDirFiles = api(
    { method: "GET" },
    async (p: GetDirFilesParams): Promise<GetDirFilesReponse> => {
        const user = await validateSession({ token: p.token });
        const vfs = new FileSystemManager("/home/sourav/Downloads");
        const files = await vfs.lazyLoadTraverse(p.path);
        return {
            count: files.length,
            results: files,
        };
    },
);
