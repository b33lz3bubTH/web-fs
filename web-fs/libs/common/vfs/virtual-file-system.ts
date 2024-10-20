import { Singleton } from "../utilts/singleton";
import { FileUtils } from "./file-utils";
import { Inode } from "./types";
import * as path from "path";

@Singleton
class FileSystemManager {
    constructor(private rootDir: string = "/tmp") {}

    private isSafePath(targetPath: string): boolean {
        const resolvedTargetPath = path.resolve(targetPath);
        const resolvedRootPath = path.resolve(this.rootDir);

        return resolvedTargetPath.startsWith(resolvedRootPath);
    }

    getFullSystemPath(relativePath: string): string {
        const absolutePath = path.resolve(this.rootDir, relativePath);

        if (!this.isSafePath(absolutePath)) {
            throw new Error("Invalid directory traversal attempt.");
        }

        return absolutePath;
    }

    async lazyLoadTraverse(subDir: string): Promise<Inode[]> {
        const absolutePath = path.resolve(this.rootDir, subDir);

        if (!this.isSafePath(absolutePath)) {
            throw new Error("invalid directory traversal attempt.");
        }

        return await FileUtils.traverseDir(absolutePath, this.rootDir);
    }

    async createFileInDirectory(
        subDir: string,
        fileName: string,
        content: string,
    ): Promise<void> {
        const filePath = path.join(this.rootDir, subDir);

        if (!this.isSafePath(filePath)) {
            throw new Error("invalid directory traversal attempt.");
        }

        await FileUtils.createFile(path.join(filePath, fileName), content);
    }

    async deleteFileInDirectory(
        subDir: string,
        fileName: string,
    ): Promise<void> {
        const filePath = path.join(this.rootDir, subDir, fileName);

        if (!this.isSafePath(filePath)) {
            throw new Error("invalid directory traversal attempt.");
        }

        await FileUtils.deleteFile(filePath);
    }

    async deleteDirectory(subDir: string): Promise<void> {
        const dirPath = path.join(this.rootDir, subDir);

        if (!this.isSafePath(dirPath)) {
            throw new Error("invalid directory traversal attempt.");
        }

        await FileUtils.deleteDirectory(dirPath);
    }

    async isDirectory(subDir: string): Promise<boolean> {
        const dirPath = path.join(this.rootDir, subDir);

        if (!this.isSafePath(dirPath)) {
            throw new Error("invalid directory traversal attempt.");
        }

        return await FileUtils.isDirectory(dirPath);
    }

    async isFile(subDir: string): Promise<boolean> {
        const filePath = path.join(this.rootDir, subDir);

        if (!this.isSafePath(filePath)) {
            throw new Error("nvalid directory traversal attempt.");
        }

        return await FileUtils.isFile(filePath);
    }
}

export { FileSystemManager };
