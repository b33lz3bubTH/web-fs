import { promises as fs } from "fs";
import { Inode } from "./types";
import * as path from "path";

export class FileUtils {
    // Check if the path is a directory
    static async isDirectory(filePath: string): Promise<boolean> {
        const stats = await fs.lstat(filePath);
        return stats.isDirectory();
    }

    // Check if the path is a file
    static async isFile(filePath: string): Promise<boolean> {
        const stats = await fs.lstat(filePath);
        return stats.isFile();
    }

    // Recursively traverse directories (up to two levels deep)
    static async traverseDir(
        dirPath: string,
        rootDir: string, // Pass rootDir to generate relative paths
        depth: number = 2,
    ): Promise<Inode[]> {
        let inodes: Inode[] = [];

        async function recurse(
            currentPath: string,
            currentDepth: number,
        ): Promise<Inode[]> {
            if (currentDepth > depth) return [];

            const files = await fs.readdir(currentPath);
            let dirInodes: Inode[] = [];

            for (const file of files) {
                const fullPath = path.join(currentPath, file);
                const stats = await fs.lstat(fullPath);

                // Create a relative path by removing the rootDir part
                const relativePath = path.relative(rootDir, fullPath);

                const inode: Inode = {
                    name: file,
                    path: `/${relativePath}`, // Ensure it starts with a '/' for UI
                    isFile: stats.isFile(),
                    createdAt: stats.birthtime.toDateString(),
                    modifiedAt: stats.mtime.toDateString(),
                };

                if (stats.isDirectory()) {
                    // Recursive call, but only if depth allows it
                    inode.files = await recurse(fullPath, currentDepth + 1);
                }

                dirInodes.push(inode);
            }

            return dirInodes;
        }

        // Start the recursive traversal
        inodes = await recurse(dirPath, 0);
        return inodes;
    }

    static async createFile(
        filePath: string,
        content: string = "",
    ): Promise<void> {
        await fs.writeFile(filePath, content, "utf-8");
    }

    static async deleteFile(filePath: string): Promise<void> {
        await fs.unlink(filePath);
    }

    static async deleteDirectory(dirPath: string): Promise<void> {
        await fs.rmdir(dirPath, { recursive: true });
    }
}
