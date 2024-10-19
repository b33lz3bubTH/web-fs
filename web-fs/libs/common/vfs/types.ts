export interface Inode {
    name: string;
    path: string;
    isFile: boolean;
    createdAt: string;
    modifiedAt: string;
    files?: Inode[]; // Optional array of child inodes for directories
}
export enum FileType {
    FILE = "file",
    DIRECTORY = "directory",
}
