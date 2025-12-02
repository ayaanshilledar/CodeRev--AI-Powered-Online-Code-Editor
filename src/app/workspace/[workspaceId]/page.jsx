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

const Workspace = () => {
  // Router params
  const { workspaceId } = useParams();

  // State management
  const [selectedFile, setSelectedFile] = useState(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [membersCount, setMembersCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(true);

  // Fetch workspace data
  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!workspaceId) return;

      try {
        const workspaceRef = doc(db, "workspaces", workspaceId);
        const workspaceSnap = await getDoc(workspaceRef);

        if (workspaceSnap.exists()) {
          const workspaceData = workspaceSnap.data();
          setWorkspaceName(workspaceData.name);

          const membersRef = collection(db, `workspaces/${workspaceId}/members`);
          const membersSnap = await getDocs(membersRef);
          setMembersCount(membersSnap.size);
        } else {
          console.error("Workspace not found");
        }
      } catch (error) {
        console.error("Error fetching workspace:", error);
      }
    };

    fetchWorkspace();
  }, [workspaceId]);

  return (
    <div className="flex flex-col h-screen bg-black text-white min-w-[1024px] relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Header */}
      <div className="relative z-10">
        <Header workspaceId={workspaceId} />
      </div>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* File Panel Toggle Button */}
        <button
          className="absolute top-2 left-4 z-20 p-2 hover:bg-zinc-800/50 rounded-lg transition-colors"
          onClick={() => setIsNavOpen(!isNavOpen)}
          aria-label="Toggle file panel"
        >
          <PanelLeftOpen
            size={24}
            className="h-6 w-6 text-zinc-400 hover:text-white transition-colors"
          />
        </button>

        {/* Left Side - File & Folder Panel */}
        <nav
          className={`transition-all duration-300 ${isNavOpen ? "w-[20%]" : "w-0"
            } overflow-hidden bg-zinc-900/50 backdrop-blur-sm border-r border-white/10 flex flex-col h-full`}
        >
          {isNavOpen && (
            <NavPanel workspaceId={workspaceId} openFile={setSelectedFile} />
          )}
        </nav>

        {/* Main - Editor Content */}
        <main className="flex-1 h-full flex flex-col py-2 overflow-auto">
          {/* Workspace Header */}
          <div className="flex h-[6%] gap-12 items-center justify-between px-6">
            <h1 className="text-xl w-[80%] text-center font-medium text-zinc-300">
              Workspace: <span className="text-white font-semibold">{workspaceName}</span>
            </h1>

            <div className="flex items-center gap-4">
              {/* Search Bar - Hidden for now */}
              <div className="hidden items-start bg-zinc-800/40 ring-1 ring-white/20 px-4 py-1 rounded-lg gap-2">
                <SearchBar workspaceId={workspaceId} />
              </div>

              {/* Members Count - Hidden for now */}
              <span className="hidden text-sm text-zinc-200 bg-zinc-800/50 px-4 py-2 rounded-full items-center justify-center gap-3 border border-white/10">
                <ShowMembers workspaceId={workspaceId} />
              </span>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor file={selectedFile} />
          </div>
        </main>
      </div>

      {/* Chat Panel (Overlapping from Bottom) */}
      <aside
        className={`fixed bottom-0 right-0 transition-all duration-300 shadow-2xl ${isChatOpen ? "h-[82%]" : "h-0"
          } overflow-hidden w-[45%] border-l border-t border-white/10 bg-zinc-900/95 backdrop-blur-xl z-40`}
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
          className="fixed bottom-6 right-10 z-30 py-3 font-medium px-5 flex items-center gap-2 text-base bg-white text-black hover:bg-zinc-200 rounded-full shadow-2xl transition-all hover:scale-105"
          onClick={() => setIsChatOpen(!isChatOpen)}
          aria-label="Open AI Chat"
        >
          <MessageCircle className="h-5 w-5" />
          AI Chat
        </button>
      )}

      {/* Live Cursor */}
      <div className="relative z-50">
        <LiveCursor workspaceId={workspaceId} />
      </div>
    </div>
  );
};

export default Workspace;
