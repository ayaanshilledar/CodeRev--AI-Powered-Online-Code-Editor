"use client";
import { Moon, Sun, Sparkles, Wrench, File, Expand, Shrink, Settings, Code2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import axios from "axios";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "@/constants";
import { Box } from "@chakra-ui/react";
import Output from "./Output";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";

export default function CodeEditor({ file }) {
  const [selectedTheme, setSelectedTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updatedCode, setUpdatedCode] = useState(
    "//Select a file to start coding..!"
  );
  const [isFixing, setIsFixing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const monaco = useMonaco();
  const timeoutRef = useRef(null);
  const editorRef = useRef();
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const settingsRef = useRef(null);

  useEffect(() => {
    if (file) {
      fetchFileContent();
    }
  }, [file]);

  useEffect(() => {
    if (!file?.id || !file?.workspaceId) return;

    const filePath = `workspaces/${file.workspaceId}/files`;
    const fileRef = doc(db, filePath, file.id);

    const unsubscribe = onSnapshot(fileRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.content !== updatedCode) {
          setUpdatedCode(data.content || "");
        }
      }
    });

    return () => unsubscribe();
  }, [file]);

  const fetchFileContent = async () => {
    if (!file?.id || !file?.workspaceId) return;
    try {
      const filePath = `workspaces/${file.workspaceId}/files`;
      const fileRef = doc(db, filePath, file.id);
      const fileSnap = await getDoc(fileRef);

      if (fileSnap.exists()) {
        setUpdatedCode(fileSnap.data().content || "");
      }
    } catch (error) {
      console.error("Error fetching file content:", error);
    }
  };

  const handleEditorChange = (value) => {
    setUpdatedCode(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => autoSaveFile(value), 1000);
  };

  const autoSaveFile = async (content) => {
    if (!file?.id || !file?.workspaceId) return;
    try {
      const filePath = `workspaces/${file.workspaceId}/files`;
      const fileRef = doc(db, filePath, file.id);
      await updateDoc(fileRef, { content });
    } catch (error) {
      console.error("Error auto-saving file:", error);
    }
  };

  const onSelect = (codeLanguage) => {
    setCodeLanguage(codeLanguage);
  };

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const generateDocs = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post("/api/generate-documentation", {
        code: updatedCode,
        language: codeLanguage,
      });
      const documentation = res.data.documentation;
      const commentedDocs = `\n\n${documentation}`;
      setUpdatedCode((prevCode) => prevCode + commentedDocs);
    } catch (error) {
      console.error("Failed to generate documentation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fixSyntaxErrors = async () => {
    setIsFixing(true);
    try {
      const res = await axios.post("/api/get-errors", {
        code: updatedCode,
        language: codeLanguage,
      });

      if (res.data.fixedCode) {
        setUpdatedCode(res.data.fixedCode);
        if (!res.data.aiFixed) {
          console.log("No fixes were needed");
        }
      }
    } catch (error) {
      console.error(
        "Failed to fix syntax:",
        error?.response?.data?.error || error.message
      );
    } finally {
      setIsFixing(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setTimeout(() => editorRef.current?.layout(), 100);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themes = [
    { name: "Dark", value: "vs-dark" },
    { name: "Light", value: "light" },
    { name: "High Contrast", value: "hc-black" },
  ];

  const getMonacoLanguage = (language) => {
    if (language === "c") return "cpp";
    return language;
  };

  return (
    <div
      className={`bg-black/50 backdrop-blur-sm h-full rounded-xl border border-white/10 overflow-hidden flex flex-col ${isExpanded ? "fixed inset-0 z-50 m-0 rounded-none bg-black" : "relative"
        }`}
    >
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`transition-all duration-300 flex flex-col ${isExpanded ? "w-full" : "w-[70%]"
            } border-r border-white/10`}
        >
          {/* Editor Header */}
          <div className="flex justify-between items-center h-12 px-4 border-b border-white/10 bg-zinc-900/50">
            {file ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                <File size={14} className="text-zinc-400" />
                <span className="text-xs text-zinc-200 font-medium line-clamp-1 max-w-[150px]">
                  {file.name}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                <Code2 size={14} className="text-zinc-400" />
                <span className="text-xs text-zinc-400 font-medium">No file selected</span>
              </div>
            )}

            <div className="flex gap-2 items-center">
              {/* Settings Dropdown */}
              <div className="relative" ref={settingsRef}>
                <button
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setShowSettings(!showSettings)}
                  title="Editor Settings"
                >
                  <Settings size={16} />
                </button>
                {showSettings && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-3 space-y-3 z-50">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 block font-medium">
                        Theme
                      </label>
                      <select
                        className="w-full bg-zinc-800 text-zinc-200 text-xs p-2 rounded-lg border border-white/5 focus:border-white/20 outline-none"
                        value={selectedTheme}
                        onChange={(e) => setSelectedTheme(e.target.value)}
                      >
                        {themes.map((theme) => (
                          <option key={theme.value} value={theme.value}>
                            {theme.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 block font-medium">
                        Font Size
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="10"
                          max="24"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                        <span className="text-xs text-zinc-300 w-8 text-right font-mono">
                          {fontSize}px
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-4 w-[1px] bg-white/10 mx-1" />

              {/* Action Buttons */}
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg text-xs font-medium text-zinc-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={generateDocs}
                disabled={isLoading}
              >
                <Sparkles size={12} />
                {isLoading ? "Generating..." : "Docs"}
              </button>

              <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg text-xs font-medium text-zinc-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={fixSyntaxErrors}
                disabled={isFixing}
              >
                <Wrench size={12} />
                {isFixing ? "Fixing..." : "Fix"}
              </button>

              <button
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={toggleExpand}
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Shrink size={16} /> : <Expand size={16} />}
              </button>

              <div className="h-4 w-[1px] bg-white/10 mx-1" />

              <LanguageSelector language={codeLanguage} onSelect={onSelect} />
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative bg-[#1e1e1e]">
            <Editor
              height="100%"
              theme={selectedTheme}
              language={getMonacoLanguage(codeLanguage)}
              defaultValue={CODE_SNIPPETS[codeLanguage]}
              value={updatedCode}
              onMount={onMount}
              onChange={handleEditorChange}
              options={{
                fontSize: fontSize,
                wordWrap: "on",
                minimap: { enabled: false },
                bracketPairColorization: true,
                suggest: { preview: true },
                inlineSuggest: {
                  enabled: true,
                  showToolbar: "onHover",
                  mode: "subword",
                  suppressSuggestions: false,
                },
                quickSuggestions: {
                  other: true,
                  comments: true,
                  strings: true,
                },
                suggestSelection: "recentlyUsed",
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                fontFamily: "'Fira Code', monospace",
              }}
            />
          </div>
        </div>

        {/* Output Panel */}
        {!isExpanded && (
          <div className="w-[30%] h-full bg-black border-l border-white/10">
            <Output editorRef={editorRef} language={codeLanguage} />
          </div>
        )}
      </div>
    </div>
  );
}