"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";
import { MessageCircle, PanelLeftOpen } from "lucide-react";

// Components
import Chat from "@/components/Chat";
import Editor from "@/components/Editor";
import SearchBar from "@/components/Searchbar";
import Header from "@/components/Header";
import ShowMembers from "@/components/Members";
import LiveCursor from "@/components/LiveCursor";
import NavPanel from "@/components/Navpanel";
import VoiceChat from "@/components/VoiceChat";

const Workspace = () => {
  const { workspaceId } = useParams();

  // State management
  const [selectedFile, setSelectedFile] = useState(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [membersCount, setMembersCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch workspace data
  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!workspaceId) {
        setError("No workspace ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const workspaceRef = doc(db, "workspaces", workspaceId);
        const workspaceSnap = await getDoc(workspaceRef);

        if (workspaceSnap.exists()) {
          const workspaceData = workspaceSnap.data();
          setWorkspaceName(workspaceData.name || "Untitled Workspace");

          const membersRef = collection(db, `workspaces/${workspaceId}/members`);
          const membersSnap = await getDocs(membersRef);
          setMembersCount(membersSnap.size);
        } else {
          setError("Workspace not found");
        }
      } catch (err) {
        console.error("Error fetching workspace:", err);
        setError("Failed to load workspace. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspace();
  }, [workspaceId]);

  return (
    <div className="flex flex-col h-screen bg-black text-white min-w-[1024px] relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Header */}
      <div className="relative z-40">
        <Header workspaceId={workspaceId} />
      </div>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* File Panel Toggle */}
        <button
          className="absolute top-4 left-4 z-30 p-2 bg-zinc-900/60 backdrop-blur-sm border border-white/10 hover:bg-zinc-800/60 rounded-lg transition-all"
          onClick={() => setIsNavOpen(!isNavOpen)}
          aria-label={isNavOpen ? "Close file panel" : "Open file panel"}
        >
          <PanelLeftOpen
            size={20}
            className="text-zinc-400 hover:text-white transition-colors"
          />
        </button>

        {/* Left Side - File & Folder Panel */}
        <nav
          className={`relative transition-all duration-300 ${isNavOpen ? "w-[280px]" : "w-0"
            } overflow-hidden bg-zinc-900/40 backdrop-blur-md border-r border-white/5 flex flex-col h-full`}
        >
          {isNavOpen && (
            <NavPanel workspaceId={workspaceId} openFile={setSelectedFile} />
          )}
        </nav>

        {/* Main - Editor Content */}
        <main className="flex-1 h-full flex flex-col">
          {/* Workspace Header */}
          <div className="relative z-40 flex items-center justify-between px-6 py-3 border-b border-white/5 bg-zinc-900/30 backdrop-blur-sm">
            <h1 className="text-sm font-medium text-zinc-400 flex-1 text-center">
              <span className="text-zinc-500">Workspace:</span>{" "}
              <span className="text-white">
                {error ? "Error" : isLoading ? "Loading..." : workspaceName}
              </span>
            </h1>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20 transition-colors">
                <SearchBar workspaceId={workspaceId} />
              </div>

              {/* Members Count */}
              <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-lg">
                <ShowMembers workspaceId={workspaceId} />
              </div>

              {/* Invite Button */}
              <button
                className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900/60 backdrop-blur-sm border border-white/10 hover:bg-zinc-800/60 hover:border-white/20 rounded-lg transition-all"
              >
                Invite
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center p-8">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm max-w-md">
                {error}
              </div>
            </div>
          )}

          {/* Editor */}
          {!error && (
            <div className="flex-1 overflow-auto">
              <Editor file={selectedFile} />
            </div>
          )}
        </main>
      </div>

      {/* Chat Panel */}
      <aside
        className={`fixed bottom-0 right-0 transition-all duration-300 shadow-2xl ${isChatOpen ? "h-[80%]" : "h-0"
          } overflow-hidden w-[45%] bg-zinc-900/50 backdrop-blur-xl border-l border-t border-white/10 z-30`}
      >
        {isChatOpen && (
          <Chat
            workspaceId={workspaceId}
            isChatOpen={isChatOpen}
            setIsChatOpen={setIsChatOpen}
          />
        )}
      </aside>

      {/* Chat Toggle Button */}
      {!isChatOpen && (
        <button
          className="fixed bottom-8 right-8 z-40 py-3 px-5 flex items-center gap-2 bg-zinc-900/80 backdrop-blur-sm border border-white/10 hover:bg-zinc-800/80 text-white rounded-lg shadow-lg hover:scale-105 transition-all"
          onClick={() => setIsChatOpen(true)}
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="h-5 w-5" /> AI Assistant
        </button>
      )}

      {/* Live Cursor */}
      <div className="pointer-events-none fixed inset-0 z-50">
        <LiveCursor workspaceId={workspaceId} />
      </div>

      {/* Voice Chat - Disabled as per user preference */}
      {/* <VoiceChat workspaceId={workspaceId} /> */}
    </div>
  );
};

export default Workspace;
