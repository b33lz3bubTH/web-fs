

export type ExtensionCategory = "media" | "doc" | "audio" | "bin" | "unknown"

export class FileClassifier{
    constructor(){
    }
    checkFile(fileName: string): ExtensionCategory {
        const ext = fileName.split(".").pop();
        switch(ext){
            case "mp3": return "audio";
                case "mp4": return "media";
                case "mkv": return "media";
                case "avi": return "media";
                case "docx": return "doc";
                case "pdf": return "doc";
        }
        return "unknown"
    }

}
