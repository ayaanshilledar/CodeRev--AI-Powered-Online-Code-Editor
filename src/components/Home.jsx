"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Terminal,
  Menu,
  X,
  Code2,
  Mic,
  Users,
  Play,
  Sparkles,
  ArrowRight,
  Check,
  Github,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

// ---------------- NAVBAR ----------------
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/90 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-white flex items-center justify-center text-black font-bold text-sm rounded-md group-hover:scale-105 transition-transform">
            C
          </div>
          <span className="text-base font-semibold text-white">CodeRev</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "Pricing", "Docs"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login">
            <span className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer">
              Log in
            </span>
          </Link>
          <Link href="/register">
            <Button className="h-9 px-5 bg-white text-black hover:bg-zinc-200 text-sm font-semibold transition-all hover:scale-105">
              Get Started
            </Button>
          </Link>
        </div>

        <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 p-6 flex flex-col gap-4">
          {["Features", "Pricing", "Docs"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm text-zinc-300 hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <div className="flex flex-col gap-3 mt-2">
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full h-10 border border-white/20 text-white bg-transparent hover:bg-white/5">
                Log in
              </Button>
            </Link>
            <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full h-10 bg-white text-black">Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

// ---------------- CODE EDITOR PREVIEW ----------------
const CodeEditorPreview = () => {
  const [activeTab, setActiveTab] = useState("main.py");
  const [typedCode, setTypedCode] = useState("");

  const codeSnippets = {
    "main.py": `# AI-powered code completion
def fibonacci(n: int) -> int:
    """Calculate fibonacci number"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# CodeRev suggests optimization
@cache
def fibonacci_optimized(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci_optimized(n-1) + fibonacci_optimized(n-2)

print(fibonacci_optimized(40))  # Instant result!`,
    "app.js": `// Real-time collaboration enabled
import { createServer } from 'node:http';

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from CodeRev! 🚀');
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});`,
    "Main.java": `// Execute Java directly in browser
public class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to CodeRev!");
        
        int[] nums = {1, 2, 3, 4, 5};
        int sum = Arrays.stream(nums).sum();
        
        System.out.println("Sum: " + sum);
    }
}`,
  };

  useEffect(() => {
    const code = codeSnippets[activeTab];
    let index = 0;
    setTypedCode("");

    const interval = setInterval(() => {
      if (index < code.length) {
        setTypedCode(code.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="relative rounded-xl border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl shadow-black/50">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-zinc-900/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs">
            <Mic className="w-3 h-3" />
            Voice Chat
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-zinc-900/30">
        {Object.keys(codeSnippets).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab ? "text-white bg-zinc-800/50 border-b-2 border-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Code */}
      <div className="relative p-4 font-mono text-sm min-h-[320px]">
        <div className="flex">
          {/* Line numbers */}
          <div className="text-zinc-600 text-right pr-4 select-none leading-6">
            {typedCode.split("\n").map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Code */}
          <pre className="text-zinc-300 leading-6 overflow-hidden">
            <code>
              {typedCode}
              <span className="inline-block w-2 h-5 bg-white/80 animate-pulse ml-0.5" />
            </code>
          </pre>
        </div>

        {/* AI Suggestion */}
        <div className="absolute bottom-4 right-4 bg-zinc-800/90 backdrop-blur border border-white/10 rounded-lg p-3 max-w-[280px]">
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            AI Suggestion
          </div>
          <p className="text-xs text-zinc-300">Add @cache decorator for 1000x performance boost</p>
          <div className="flex gap-2 mt-2">
            <button className="text-xs px-2 py-1 bg-white text-black rounded font-medium">Accept</button>
            <button className="text-xs px-2 py-1 text-zinc-400 hover:text-white">Dismiss</button>
          </div>
        </div>
      </div>

      {/* Terminal */}
      <div className="border-t border-white/10 bg-zinc-900/30 p-3">
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
          <Terminal className="w-3.5 h-3.5" />
          Output
        </div>
        <div className="font-mono text-xs text-green-400">
          <span className="text-zinc-500">{">"}</span> Execution complete (0.23s)
          <br />
          <span className="text-white">102334155</span>
        </div>
      </div>
    </div>
  );
};

// ---------------- FEATURE CARD ----------------
const FeatureCard = ({ icon: Icon, title, description, gradient }) => {
  return (
    <div className="group relative p-6 rounded-2xl border border-white/10 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-white/20 transition-all">
      <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center mb-4 group-hover:scale-110`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
};

// ---------------- PAGE ----------------
export default function HomePage() {
  const features = [
    { icon: Code2, title: "Monaco Editor", description: "Industry-standard code editor with IntelliSense, syntax highlighting, and multi-cursor support.", gradient: "bg-gradient-to-br from-blue-500 to-blue-600" },
    { icon: Sparkles, title: "AI Code Review", description: "Get intelligent suggestions, bug detection, and performance optimizations powered by Gemini AI.", gradient: "bg-gradient-to-br from-yellow-500 to-orange-500" },
    { icon: Mic, title: "Voice Chat", description: "Discuss code with teammates in real-time.", gradient: "bg-gradient-to-br from-green-500 to-emerald-500" },
    { icon: Play, title: "Instant Execution", description: "Run Python, JS, Java, C++, and more instantly.", gradient: "bg-gradient-to-br from-red-500 to-pink-500" },
    { icon: Users, title: "Real-time Collab", description: "True multiplayer coding with live cursors.", gradient: "bg-gradient-to-br from-indigo-500 to-blue-500" },
    { icon: MessageSquare, title: "AI Chat Assistant", description: "Get explanations & generate code easily.", gradient: "bg-gradient-to-br from-zinc-500 to-zinc-600" },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-r from-blue-500/10 via-zinc-500/5 to-green-500/10 rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-6xl sm:text-7xl font-bold leading-tight">
            Code Smarter,
            <br />
            <span className="bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
              Ship Faster
            </span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mt-6">
            The AI-powered code editor with{" "}
            <span className="text-white font-medium">voice chat</span>, realtime collaboration and instant execution.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button className="h-14 px-8 bg-white text-black font-semibold">
              Start Coding Free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>

            <Button className="h-14 px-8 border border-white/20 bg-white/5 text-white hover:bg-white/10">
              <Github className="mr-2 w-4 h-4" /> View on GitHub
            </Button>
          </div>

          <div className="mt-20 max-w-4xl mx-auto">
            <CodeEditorPreview />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-zinc-500 tracking-wider uppercase">Features</p>
            <h2 className="text-5xl font-bold">Everything you need to code</h2>
            <p className="text-lg text-zinc-400 mt-4 max-w-xl mx-auto">
              AI, multiplayer collaboration, instant execution— all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-6 border-t border-white/5 text-center text-zinc-500">
        © 2025 CodeRev
      </footer>
    </div>
  );
}
