import Editor from "@monaco-editor/react";
import { File } from "../utils/FileManager";

interface CodeProps {
  selectedFile: File | undefined;
  onChange: (value: string | undefined) => void;
}

export const Code = ({ selectedFile, onChange }: CodeProps) => {
  if (!selectedFile) {
    return (
      <div className="flex-1 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">No file selected</div>
          <div className="text-gray-500 text-sm">
            Select a file from the sidebar to start editing
          </div>
        </div>
      </div>
    );
  }

  let language = selectedFile.name.split(".").pop();

  if (language === "js" || language === "jsx") language = "javascript";
  else if (language === "ts" || language === "tsx") language = "typescript";

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Editor
        height="100%"
        language="plaintext"
        value={selectedFile.content}
        theme="vs-dark"
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "on",
          tabSize: 2,
          insertSpaces: true,
          renderWhitespace: "selection",
          bracketPairColorization: { enabled: false },
          smoothScrolling: true,
          cursorBlinking: "smooth",
          folding: false,
          foldingHighlight: false,
          showFoldingControls: "never",
        }}
      />
    </div>
  );
};
