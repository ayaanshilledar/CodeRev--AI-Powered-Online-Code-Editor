"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { Globe, Lock, Loader2, PlusCircle, Trash2, Code2, Users } from "lucide-react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import ShowMembers from "@/components/Members";

const toastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

const Dashboard = () => {
  // Router
  const router = useRouter();
  const user = auth.currentUser;

  // State management
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [studioName, setStudioName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingStudioId, setDeletingStudioId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch studios on mount
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchStudios = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "workspaces"));

        const studioData = await Promise.all(
          querySnapshot.docs.map(async (studioDoc) => {
            const membersRef = collection(
              db,
              `workspaces/${studioDoc.id}/members`
            );
            const membersSnapshot = await getDocs(membersRef);

            const userMemberData = membersSnapshot.docs.find(
              (doc) => doc.data().userId === user.uid
            );

            if (!userMemberData) return null;

            return {
              id: studioDoc.id,
              ...studioDoc.data(),
              role: userMemberData.data().role || "Unknown",
              memberCount: membersSnapshot.size,
            };
          })
        );

        setStudios(studioData.filter(Boolean));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching studios:", error);
        setLoading(false);
      }
    };

    fetchStudios();
  }, [user, router]);

  // Create studio handler
  const handleCreateStudio = async () => {
    if (!studioName || isCreating) return;

    try {
      setIsCreating(true);
      const studioRef = await addDoc(collection(db, "workspaces"), {
        name: studioName,
        isPublic,
      });

      const membersRef = collection(db, `workspaces/${studioRef.id}/members`);
      await setDoc(doc(membersRef, user.uid), {
        userId: user.uid,
        role: "owner",
        displayName: user.displayName || "Unknown",
        photoURL: user.photoURL || "/robotic.png",
      });

      const cursorsRef = doc(db, `workspaces/${studioRef.id}`);
      await setDoc(cursorsRef, { cursors: {} }, { merge: true });

      setStudios([
        ...studios,
        { id: studioRef.id, name: studioName, isPublic, role: "owner", memberCount: 1 },
      ]);

      toast.success("Code Studio created successfully!", toastOptions);
      setIsOpen(false);
      setStudioName("");
    } catch (error) {
      toast.error("Failed to create studio.", toastOptions);
    } finally {
      setIsCreating(false);
    }
  };

  // Delete studio handler
  const deleteStudio = async (studioId) => {
    const confirmationToast = toast(
      <div className="flex justify-between items-center gap-4">
        <span>Are you sure you want to delete this studio?</span>
        <div className="flex space-x-2">
          <Button
            onClick={async () => {
              try {
                setDeletingStudioId(studioId);
                await deleteDoc(doc(db, `workspaces/${studioId}`));
                setStudios(studios.filter((s) => s.id !== studioId));
                toast.success("Code Studio deleted successfully!", toastOptions);
              } catch (error) {
                toast.error("Failed to delete studio.", toastOptions);
              } finally {
                setDeletingStudioId(null);
                toast.dismiss(confirmationToast);
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white h-8 px-3 rounded-lg"
            disabled={deletingStudioId === studioId}
          >
            {deletingStudioId === studioId ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
          <Button
            onClick={() => toast.dismiss(confirmationToast)}
            className="bg-zinc-700 hover:bg-zinc-600 text-white h-8 px-3 rounded-lg"
            disabled={deletingStudioId === studioId}
          >
            Cancel
          </Button>
        </div>
      </div>,
      {
        ...toastOptions,
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        hideProgressBar: true,
      }
    );
  };

  // Filter studios based on search
  const filteredStudios = studios.filter((studio) =>
    studio.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Gradient Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-r from-white/5 via-zinc-500/5 to-white/5 rounded-full blur-[120px]" />

      <ToastContainer theme="dark" />

      {/* Header */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* Page Header */}
      <div className="relative z-10 flex justify-between items-center px-8 py-4">
        <div>
          <h1 className="text-3xl font-bold text-white">

            Your Code Studios
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {studios.length} {studios.length === 1 ? "studio" : "studios"} ready to code
          </p>
        </div>

        <Button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-zinc-200 transition-all hover:scale-105"
          disabled={isCreating}
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <PlusCircle size={18} />
              <span>New Studio</span>
            </>
          )}
        </Button>
      </div>

      {/* Search Bar */}
      {studios.length > 0 && (
        <div className="relative z-10 px-8 pb-4">
          <Input
            placeholder="Search your studios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md bg-zinc-900/50 backdrop-blur-sm border border-white/10 text-white placeholder:text-zinc-500 h-10 rounded-lg focus:border-white/20 transition-colors"
          />
        </div>
      )}

      {/* Studios Grid */}
      <div className="relative z-10 flex-1 overflow-y-auto px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudios.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center h-64 text-center">
                {searchQuery ? (
                  <>
                    <Code2 className="w-16 h-16 text-zinc-600 mb-4" />
                    <p className="text-zinc-400 text-lg mb-2">No studios match "{searchQuery}"</p>
                    <p className="text-zinc-500 text-sm">Try a different search term</p>
                  </>
                ) : (
                  <>
                    <p className="text-zinc-400 text-lg mb-4">No studios found</p>
                    <Button
                      onClick={() => setIsOpen(true)}
                      className="bg-white text-black hover:bg-zinc-200 px-6 py-2 rounded-lg font-medium"
                    >
                      Create Your First Studio
                    </Button>
                  </>
                )}
              </div>
            ) : (
              filteredStudios.map((studio) => (
                <Card
                  key={studio.id}
                  className="relative group border border-white/10 bg-zinc-900/50 backdrop-blur-sm rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:shadow-2xl hover:shadow-white/5"
                >
                  <CardContent className="p-6 flex flex-col gap-4">
                    <Link href={`/workspace/${studio.id}`} className="block">
                      <div className="flex flex-col gap-3">
                        <h2 className="text-2xl font-bold text-white tracking-wide group-hover:text-zinc-200 transition-colors">
                          {studio.name}
                        </h2>

                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          {studio.isPublic ? (
                            <>
                              <Globe className="w-4 h-4" />
                              <span>Public Studio</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              <span>Private Studio</span>
                            </>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <Users className="w-4 h-4" />
                            <span>{studio.memberCount} {studio.memberCount === 1 ? "member" : "members"}</span>
                          </div>
                          <span className="text-xs px-2 py-1 bg-zinc-800/50 text-zinc-200 rounded-full border border-white/10 font-medium">
                            {studio.role}
                          </span>
                        </div>
                      </div>
                    </Link>

                    {studio.role === "owner" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 text-red-400 hover:text-red-500 hover:bg-red-500/10 hover:scale-110 transition-all duration-200 rounded-lg"
                        onClick={(e) => {
                          e.preventDefault();
                          deleteStudio(studio.id);
                        }}
                        disabled={deletingStudioId === studio.id}
                      >
                        {deletingStudioId === studio.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Studio Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild />
        <DialogContent className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
          <DialogTitle className="text-2xl font-bold text-white mb-2">
            Create Code Studio
          </DialogTitle>
          <DialogDescription className="text-zinc-400 mb-6">
            Enter the name of your studio and choose its visibility.
          </DialogDescription>

          <div className="space-y-6">
            {/* Studio Name Input */}
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 font-medium">Studio Name</label>
              <Input
                placeholder="My Awesome Project"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                className="bg-zinc-800/50 text-white border border-white/10 focus:border-white/30 placeholder:text-zinc-500 h-11 rounded-lg"
              />
            </div>

            {/* Visibility Toggle */}
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 font-medium">Visibility</label>
              <div className="flex gap-3">
                <Button
                  className={`flex-1 items-center gap-2 h-11 rounded-lg font-medium transition-all ${isPublic
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "bg-zinc-800/50 text-zinc-400 border border-white/10 hover:bg-zinc-800 hover:text-white"
                    }`}
                  onClick={() => setIsPublic(true)}
                >
                  <Globe className="w-4 h-4" />
                  Public
                </Button>

                <Button
                  className={`flex-1 items-center gap-2 h-11 rounded-lg font-medium transition-all ${!isPublic
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "bg-zinc-800/50 text-zinc-400 border border-white/10 hover:bg-zinc-800 hover:text-white"
                    }`}
                  onClick={() => setIsPublic(false)}
                >
                  <Lock className="w-4 h-4" />
                  Private
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => {
                  setIsOpen(false);
                  setStudioName("");
                }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white h-11 rounded-lg font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateStudio}
                className="flex-1 items-center gap-2 bg-white text-black hover:bg-zinc-200 h-11 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={isCreating || !studioName}
              >
                {isCreating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5" />
                    Create
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;