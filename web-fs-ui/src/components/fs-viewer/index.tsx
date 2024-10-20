import { useEffect, useState } from "react";
import { Api } from "../../utils/api";
import {
  FileOutlined,
  FolderOpenOutlined,
  VideoCameraTwoTone,
} from "@ant-design/icons";
import { Button, Card } from "antd";
import { FileClassifier } from "./service";
import ModalVideo from "react-modal-video"; // Modal Video

export interface IFile {
  createdAt: string;
  files?: IFile[];
  isFile: boolean;
  modifiedAt: string;
  name: string;
  path: string;
}
export const useFetchFilesFile = () => {
  const [files, setFiles] = useState<IFile[]>([]);

  const fetchFiles = async (path: string) => {
    const res = await fetch(Api.Files({ path, token: "....." }), {
      method: "GET",
    }).then((res) => res.json());
    console.log(res.results);
    setFiles(res.results as IFile[]);
  };

  return {
    fetchFiles,
    files,
  };
};

export function Files() {
  const { fetchFiles, files } = useFetchFilesFile();
  const [path, setPath] = useState(".");
  const [pathHistory, setPathHistory] = useState<string[]>([]);
  const [isOpen, setOpen] = useState(false); // Modal video state
  const [videoUrl, setVideoUrl] = useState("");

  const fileClassifier = new FileClassifier();

  useEffect(() => {
    fetchFiles(path);
  }, [path]);

  // Function to navigate into a folder
  const handleFolderClick = (newPath: string) => {
    // Remove leading slash if it exists
    const sanitizedPath = newPath.replace(/^\/+/, "");
    setPathHistory((prevHistory) => [...prevHistory, path]); // Save current path in history
    setPath(sanitizedPath); // Set sanitized path
  };

  // Function to go back to the previous folder
  const handleBackClick = () => {
    if (pathHistory.length > 0) {
      const previousPath = pathHistory[pathHistory.length - 1];
      setPathHistory((prevHistory) => prevHistory.slice(0, -1)); // Remove the last path from history
      setPath(previousPath); // Navigate to the previous path
    }
  };
  const handleFileOpen = (filePath: string, fileName: string) => {
    const sanitizedPath = filePath.replace(/^\/+/, "");

    const fileCategory = fileClassifier.checkFile(fileName);
    if (fileCategory === "media") {
      //window.open(
      //Api.MediaView({ filePath: sanitizedPath, token: "....." }),
      //"_blank",
      //);
      const videoSrc = Api.MediaView({
        filePath: sanitizedPath,
        token: ".....",
      });
      setVideoUrl(videoSrc); // Set the video URL for modal
      setOpen(true); // Open the modal
      return;
    }
    alert("cant open this kind of files.");
  };

  return (
    <div className="container">
      <div className="mb-3">
        <Button
          type="primary"
          onClick={handleBackClick}
          disabled={pathHistory.length === 0}
        >
          Back
        </Button>
      </div>

      <div className="row">
        {files.map((file: IFile) => (
          <div
            key={file.path}
            className="col-lg-2 col-md-3 col-sm-6 col-xs-6 mb-3"
          >
            <Card
              hoverable
              onClick={() =>
                file.isFile
                  ? handleFileOpen(file.path, file.name)
                  : handleFolderClick(file.path)
              }
              className="text-center"
            >
              {file.isFile ? (
                fileClassifier.checkFile(file.name) === "media" ? (
                  <VideoCameraTwoTone style={{ fontSize: "24px" }} />
                ) : (
                  <FileOutlined
                    style={{ fontSize: "24px", color: "#1890ff" }}
                  />
                )
              ) : (
                <FolderOpenOutlined
                  style={{ fontSize: "24px", color: "#faad14" }}
                />
              )}
              <p className="text-break">{file.name}</p>
            </Card>
          </div>
        ))}
      </div>
      <ModalVideo
        channel="custom" // Custom for direct URL loading
        isOpen={isOpen}
        url={videoUrl}
        onClose={() => setOpen(false)}
        autoplay
      />
    </div>
  );
}
