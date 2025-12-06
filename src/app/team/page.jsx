"use client";

import React, { useState, useEffect } from "react";
import {
    Menu,
    X,
    Github,
    Linkedin,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/ThemeToggle";

// Navbar (Consistent with Home)
const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { label: "Features", href: "/#features" },
        { label: "How It Works", href: "/#howitworks" },
        { label: "Testimonials", href: "/#testimonials" },
        { label: "Team", href: "/team" },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/5" : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <Image
                        src="/CodeRev_Logo.png"
                        alt="CodeRev Logo"
                        width={28}
                        height={28}
                        className="w-7 h-7 object-contain group-hover:scale-110 transition-all duration-300"
                    />
                    <span className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">CodeRev</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((item) => (
                        <Link key={item.label} href={item.href}>
                            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-3">
                    <ThemeToggle />
                    <Link href="/login">
                        <Button variant="ghost" className="h-9 px-4 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10">
                            Log in
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button className="h-9 px-4 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 font-medium rounded-lg text-sm transition-all shadow-sm">
                            Get Started
                        </Button>
                    </Link>
                </div>

                <button
                    className="md:hidden text-zinc-900 dark:text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-zinc-200 dark:border-white/5 p-6 flex flex-col gap-4 fixed w-full z-40">
                    {navLinks.map((item) => (
                        <Link key={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                            <span className="text-base font-medium text-zinc-600 dark:text-zinc-300">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                    <div className="h-px bg-zinc-200 dark:bg-white/10 my-2" />
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-500">Theme</span>
                        <ThemeToggle />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="outline" className="w-full h-10 border-zinc-200 dark:border-white/10">
                                Log in
                            </Button>
                        </Link>
                        <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full h-10 bg-zinc-900 dark:bg-white text-white dark:text-black">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

// Team Card
const TeamCard = ({ member }) => (
    <div className="group relative">
        <div className="relative h-64 w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-white/5 mb-4">
            {member.image ? (
                <Image
                    src={member.image}
                    alt={member.name}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            ) : (
                <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-zinc-300 dark:text-zinc-700">
                    {member.name.split(' ').map(n => n[0]).join('')}
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="flex gap-3">
                    {member.github && (
                        <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 transition-colors">
                            <Github className="w-5 h-5" />
                        </a>
                    )}
                    {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 transition-colors">
                            <Linkedin className="w-5 h-5" />
                        </a>
                    )}
                </div>
            </div>
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{member.name}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-2">{member.role}</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm">
            {member.bio}
        </p>
    </div>
);


export default function TeamPage() {
    const teamMembers = [
        {
            name: "Ayaan Shilledar",
            role: "Lead Developer & Architect",
            image: "/teams/ayan.jpg",
            bio: "Building the core infrastructure. Loves turning complex system problems into simple, scalable code.",
            github: "https://github.com/ayaanshilledar",
            linkedin: "https://linkedin.com/in/ayaan-shilledar"
        },
        {
            name: "Aniket Patil",
            role: "Frontend Developer",
            image: "/teams/aniket.jpg",
            bio: "Obsessed with pixel-perfect UI. Believes dev tools should feel as good to use as consumer apps.",
            github: "https://github.com/aniket",
            linkedin: "https://linkedin.com/in/aniket-patil"
        },
        {
            name: "Ayman Shilledar",
            role: "Backend Developer",
            image: "/teams/ayman.jpg",
            bio: "Ensuring real-time collaboration just works. The invisible hand making sure the server never sleeps.",
            github: "https://github.com/ayman",
            linkedin: "https://linkedin.com/in/ayman-shilledar"
        },
        {
            name: "Prashant Chavan",
            role: "AI Engineer",
            image: null,
            bio: "Teaching machines to teach students. Focused on AI that explains 'why', not just 'what'.",
            github: "https://github.com/prashant",
            linkedin: "https://linkedin.com/in/prashant-chavan"
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-sans selection:bg-purple-100 dark:selection:bg-purple-900/30">
            <Navbar />

            <main className="max-w-5xl mx-auto px-6 pt-32 pb-24">

                {/* Header */}
                <header className="text-center mb-24 max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
                        Meet the Builders
                    </h1>
                    <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        We're a team of students who got tired of the fractured learning experience. So we decided to fix it ourselves.
                    </p>
                </header>

                {/* Team Grid - Top Section */}
                <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-32">
                    {teamMembers.map((member, i) => (
                        <TeamCard key={i} member={member} />
                    ))}
                </section>

                <hr className="border-t border-zinc-100 dark:border-white/10 mb-20" />

                {/* Narrative Section - Text Only */}
                <div className="grid md:grid-cols-[1fr_2fr] gap-12 mb-20">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">The Why</h2>
                    </div>
                    <div className="prose prose-lg prose-zinc dark:prose-invert">
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Walk into any computer lab today and watch a student. You'll see a browser with 15 tabs open.
                            There's a compiler that takes forever to load. A ChatGPT tab for explanations. A PDF viewer for notes. Stack Overflow for errors.
                        </p>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mt-4">
                            It's fragmented. It's distracting. And worse, it encourages copy-pasting instead of understanding. We realized that if we wanted to learn deeply, we needed a place where thinking and coding happened together.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-[1fr_2fr] gap-12 mb-20">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">The How</h2>
                    </div>
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Contextual AI</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                Instead of giving you the answer, our AI explains the concept. It sees your error, understands your context, and nudges you in the right direction.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Instant Environment</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                No installing compilers. No configuring paths. Just hit a button and run code in 20+ languages instantly.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Real-time Sync</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                Collaborative coding that actually feels live. See cursors, voice chat, and debug together without screensharing lag.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-[1fr_2fr] gap-12 mb-20">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">What's Next</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="p-6 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/5">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400 font-bold">1</div>
                            <h3 className="font-bold text-zinc-900 dark:text-white mb-2">The "Google Docs" for Code</h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                We're moving beyond simple real-time editing. We're building state-aware collaborative debugging where two people can debug the same process on different breakpoints simultaneously.
                            </p>
                        </div>
                        <div className="p-6 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/5">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400 font-bold">2</div>
                            <h3 className="font-bold text-zinc-900 dark:text-white mb-2">Automated Peer Reviews</h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                Using LLMs to simulate a senior engineer reviewing your pull request. It won't just find bugs; it will suggest architectural improvements and design patterns before you merge.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="text-center pt-20 border-t border-zinc-100 dark:border-white/10">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                        Ready to learn better?
                    </h3>
                    <div className="flex items-center justify-center gap-4">
                        <Link href="/register">
                            <Button className="h-11 px-8 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 font-semibold rounded-xl transition-all">
                                Get Started
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button variant="outline" className="h-11 px-8 border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl transition-all">
                                Back Home
                            </Button>
                        </Link>
                    </div>
                </div>

            </main>
        </div>
    );
}
