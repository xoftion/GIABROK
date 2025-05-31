import { exec } from "child_process";
import Docker from "dockerode";
import fs from "fs/promises";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";

const execAsync = promisify(exec);
const BASE_PATH = "/app/my-nextjs-app";

function getAbsolutePath(filePath: string): string {
  return filePath.startsWith("/") ? filePath : `${BASE_PATH}/${filePath}`;
}

export interface FileItem {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileItem[];
  content?: string;
}

export async function getFileTree(
  docker: Docker,
  containerId: string,
  containerPath: string = BASE_PATH
): Promise<FileItem[]> {
  const container = docker.getContainer(containerId);

  const findCommand = [
    "sh",
    "-c",
    `find ${containerPath} \\( -name node_modules -o -name .next \\) -prune -o -type f -o -type d | grep -v -E "(node_modules|\\.next)" | sort`,
  ];

  const exec = await container.exec({
    Cmd: findCommand,
    AttachStdout: true,
    AttachStderr: true,
  });

  const stream = await exec.start({ Detach: false, Tty: false });
  const output = await new Promise<string>((resolve, reject) => {
    let data = "";
    stream.on("data", (chunk: Buffer) => {
      data += chunk.toString();
    });
    stream.on("end", () => resolve(data));
    stream.on("error", reject);
  });

  const paths = output
    .trim()
    .split("\n")
    .filter((p) => p && p !== containerPath);
  const fileTree: Map<string, FileItem> = new Map();

  fileTree.set(containerPath, {
    name: "root",
    path: containerPath,
    type: "directory",
    children: [],
  });

  for (const filePath of paths) {
    const stat = await getFileStat(container, filePath);
    const relativePath = filePath.replace(containerPath + "/", "");
    const parts = relativePath.split("/");
    const fileName = parts[parts.length - 1] || "";

    const fileItem: FileItem = {
      name: fileName,
      path: filePath,
      type: stat.isDirectory ? "directory" : "file",
    };

    if (stat.isDirectory) {
      fileItem.children = [];
    }

    fileTree.set(filePath, fileItem);

    const parentPath = filePath.substring(0, filePath.lastIndexOf("/"));
    const parent = fileTree.get(parentPath || containerPath);
    if (parent && parent.children) {
      parent.children.push(fileItem);
    }
  }

  const root = fileTree.get(containerPath);
  return root?.children || [];
}

async function getFileStat(
  container: Docker.Container,
  filePath: string
): Promise<{ isDirectory: boolean }> {
  const exec = await container.exec({
    Cmd: ["stat", "-c", "%F", filePath],
    AttachStdout: true,
    AttachStderr: true,
  });

  const stream = await exec.start({ Detach: false, Tty: false });
  const output = await new Promise<string>((resolve, reject) => {
    let data = "";
    stream.on("data", (chunk: Buffer) => {
      data += chunk.toString();
    });
    stream.on("end", () => resolve(data));
    stream.on("error", reject);
  });

  return {
    isDirectory: output.trim().includes("directory"),
  };
}

export async function readFile(
  docker: Docker,
  containerId: string,
  filePath: string
): Promise<string> {
  const container = docker.getContainer(containerId);

  const exec = await container.exec({
    Cmd: ["sh", "-c", `cat "${filePath}" | head -c 10000000`],
    AttachStdout: true,
    AttachStderr: true,
  });

  const stream = await exec.start({ Detach: false, Tty: false });

  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let stderr = "";

    stream.on("data", (chunk: Buffer) => {
      if (chunk.length > 8) {
        const header = chunk.slice(0, 8);
        const streamType = header[0];

        if (streamType === 1) {
          chunks.push(chunk.slice(8));
        } else if (streamType === 2) {
          stderr += chunk.slice(8).toString("utf8");
        }
      } else {
        chunks.push(chunk);
      }
    });

    stream.on("end", () => {
      if (stderr) {
        console.error("File read stderr:", stderr);
      }

      const buffer = Buffer.concat(chunks);
      const content = buffer.toString("utf8");

      const cleanContent = content.replace(/^\uFEFF/, "");
      resolve(cleanContent);
    });

    stream.on("error", (error) => {
      console.error("Stream error:", error);
      reject(error);
    });
  });
}

export async function listFiles(
  docker: Docker,
  containerId: string,
  containerPath: string = BASE_PATH
): Promise<any[]> {
  const container = docker.getContainer(containerId);
  const exec = await container.exec({
    Cmd: ["ls", "-la", containerPath],
    AttachStdout: true,
    AttachStderr: true,
  });

  const stream = await exec.start({ Detach: false, Tty: false });
  const output = await new Promise<string>((resolve, reject) => {
    let data = "";
    stream.on("data", (chunk: Buffer) => {
      data += chunk.toString();
    });
    stream.on("end", () => resolve(data));
    stream.on("error", reject);
  });

  const lines = output.trim().split("\n");
  return lines
    .slice(1)
    .map((line) => {
      const parts = line.trim().split(/\s+/);
      const permissions = parts[0];
      const isDirectory = permissions!.startsWith("d");
      const name = parts.slice(8).join(" ");

      return {
        name,
        type: isDirectory ? "directory" : "file",
        permissions,
        size: parts[4],
        modified: `${parts[5]} ${parts[6]} ${parts[7]}`,
      };
    })
    .filter((item) => item.name !== "." && item.name !== "..");
}

export async function writeFile(
  containerId: string,
  filePath: string,
  content: string
): Promise<void> {
  console.log(`Writing file: ${filePath} (${content.length} characters)`);

  const tempFile = `/tmp/file-${uuidv4()}`;

  try {
    await fs.writeFile(tempFile, content, "utf8");
    console.log(`Temporary file created: ${tempFile}`);

    const absolutePath = getAbsolutePath(filePath);
    console.log(`Target path: ${absolutePath}`);

    try {
      const copyCommand = `docker cp "${tempFile}" "${containerId}:${absolutePath}"`;
      console.log(`Executing: ${copyCommand}`);
      const { stdout, stderr } = await execAsync(copyCommand);

      if (stderr) {
        console.log(`Copy stderr: ${stderr}`);
      }
      if (stdout) {
        console.log(`Copy stdout: ${stdout}`);
      }

      console.log("File copied successfully");
    } catch (copyError) {
      console.log("Copy failed, trying to create directory first:", copyError);

      const dirPath = absolutePath.substring(0, absolutePath.lastIndexOf("/"));
      const createDirCommand = `docker exec "${containerId}" mkdir -p "${dirPath}"`;
      console.log(`Executing: ${createDirCommand}`);

      await execAsync(createDirCommand);
      console.log("Directory created");

      const retryCommand = `docker cp "${tempFile}" "${containerId}:${absolutePath}"`;
      console.log(`Retrying: ${retryCommand}`);

      const { stdout, stderr } = await execAsync(retryCommand);
      if (stderr) {
        console.log(`Retry stderr: ${stderr}`);
      }
      if (stdout) {
        console.log(`Retry stdout: ${stdout}`);
      }

      console.log("File copied successfully on retry");
    }

    try {
      const verifyCommand = `docker exec "${containerId}" head -n 5 "${absolutePath}"`;
      const { stdout: verifyOutput } = await execAsync(verifyCommand);
      console.log(`File verification (first 5 lines):\n${verifyOutput}`);
    } catch (verifyError) {
      console.log("Could not verify file content:", verifyError);
    }

    await fs.unlink(tempFile);
    console.log("Temporary file cleaned up");
  } catch (error) {
    console.error("Write file error:", error);
    try {
      await fs.unlink(tempFile);
    } catch (unlinkError) {
      console.error("Failed to clean up temp file:", unlinkError);
    }
    throw error;
  }
}

export async function renameFile(
  containerId: string,
  oldPath: string,
  newPath: string
): Promise<void> {
  const absoluteOldPath = getAbsolutePath(oldPath);
  const absoluteNewPath = getAbsolutePath(newPath);

  const newDir = absoluteNewPath.substring(0, absoluteNewPath.lastIndexOf("/"));
  const createDirCommand = `docker exec "${containerId}" mkdir -p "${newDir}"`;
  await execAsync(createDirCommand);

  const moveCommand = `docker exec "${containerId}" mv "${absoluteOldPath}" "${absoluteNewPath}"`;
  await execAsync(moveCommand);
}

export async function removeFile(
  containerId: string,
  filePath: string
): Promise<void> {
  const absolutePath = getAbsolutePath(filePath);
  const removeCommand = `docker exec "${containerId}" rm -rf "${absolutePath}"`;
  await execAsync(removeCommand);
}
