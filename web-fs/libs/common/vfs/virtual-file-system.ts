import { Singleton } from "../utilts/singleton";
import { FileUtils } from "./file-utils";
import { Inode } from "./types";
import * as path from "path";

@Singleton
class FileSystemManager {
    constructor(private rootDir: string = "/tmp") {}

    async lazyLoadTraverse(subDir: string): Promise<Inode[]> {
        const absolutePath = path.resolve(this.rootDir, subDir);
        return await FileUtils.traverseDir(absolutePath, this.rootDir);
    }

    async createFileInDirectory(
        subDir: string,
        fileName: string,
        content: string,
    ): Promise<void> {
        const filePath = path.join(this.rootDir, subDir, fileName);
        await FileUtils.createFile(filePath, content);
    }

    async deleteFileInDirectory(
        subDir: string,
        fileName: string,
    ): Promise<void> {
        const filePath = path.join(this.rootDir, subDir, fileName);
        await FileUtils.deleteFile(filePath);
    }

    async deleteDirectory(subDir: string): Promise<void> {
        const dirPath = path.join(this.rootDir, subDir);
        await FileUtils.deleteDirectory(dirPath);
    }

    async isDirectory(subDir: string): Promise<boolean> {
        const dirPath = path.join(this.rootDir, subDir);
        return await FileUtils.isDirectory(dirPath);
    }

    async isFile(subDir: string): Promise<boolean> {
        const filePath = path.join(this.rootDir, subDir);
        return await FileUtils.isFile(filePath);
    }
}

export { FileSystemManager };
