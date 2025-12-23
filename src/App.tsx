import { useState, useEffect } from "react";
import { Sparkles, Shield, Lock, Users } from "lucide-react";
import { GeneratorPanel } from "./components/GeneratorPanel";
import { ValidationPanel } from "./components/ValidationPanel";
import { CipherPanel } from "./components/CipherPanel";
import { TeamPanel } from "./components/TeamPanel";
import { Footer } from "./components/Footer";
import { ParticleField } from "./components/ParticleField";
import { apiEndpoints } from "./utils/api";
import logoUnnes from "./img/logounnes.png";

type TabType = "generator" | "validation" | "cipher" | "team";

export default function App() {
    const [activeTab, setActiveTab] = useState<TabType>("generator");
    const [activeSBox, setActiveSBox] = useState<number[] | null>(null);
    const [affineMatrix, setAffineMatrix] = useState<number[][] | null>(null);
    const [affineVector, setAffineVector] = useState<number[] | null>(null);
    const [backendMessage, setBackendMessage] = useState("");
    const [isBackendUp, setIsBackendUp] = useState<boolean | null>(null);

    // Fetch dari backend FastAPI
    useEffect(() => {
        fetch(apiEndpoints.status)
            .then((res) => {
                if (res.ok) {
                    return res.json().then((data) => {
                        setBackendMessage(data.message || "Backend aktif");
                        setIsBackendUp(true);
                    });
                } else {
                    setBackendMessage("Gagal terhubung ke backend");
                    setIsBackendUp(false);
                }
            })
            .catch(() => {
                setBackendMessage("Gagal terhubung ke backend");
                setIsBackendUp(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative flex flex-col">
            {/* Particle Background */}
            <ParticleField />

            {/* Cosmic Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(251,191,36,0.05)_0%,_transparent_50%)] pointer-events-none" />

            {/* Header with Navigation */}
            <header className="relative z-10 border-b border-amber-500/10 backdrop-blur-xl bg-slate-950/80">
                <div className="max-w-7xl mx-auto px-6 py-5">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-16 p-1 flex items-center justify-center overflow-hidden">
                                <img
                                    src={logoUnnes}
                                    alt="Logo UNNES"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-lg tracking-[0.3em]">
                                    <span className="text-slate-200">AES </span>
                                    <span className="text-amber-400">
                                        S-box Analyzer
                                    </span>
                                </h1>
                                <p className="text-[10px] text-slate-500 tracking-widest uppercase">
                                    AES S-box Analyzer
                                </p>
                                <p className="text-[10px] text-slate-500 tracking-widest uppercase">
                                    Universitas Negeri Semarang
                                </p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex gap-1">
                            {[
                                {
                                    id: "generator" as const,
                                    label: "Generator",
                                    icon: Sparkles,
                                },
                                {
                                    id: "validation" as const,
                                    label: "Validation",
                                    icon: Shield,
                                },
                                {
                                    id: "cipher" as const,
                                    label: "Cipher",
                                    icon: Lock,
                                },
                                {
                                    id: "team" as const,
                                    label: "Team",
                                    icon: Users,
                                },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-md transition-all duration-500 ${
                                        activeTab === item.id
                                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/5"
                                            : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/30"
                                    }`}
                                >
                                    <item.icon className="w-3.5 h-3.5" />
                                    <span className="text-xs tracking-wider hidden sm:inline">
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                            <div
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-md transition-all duration-500 ${
                                    isBackendUp === true
                                        ? "text-green-400"
                                        : "text-amber-400"
                                }`}
                            >
                                <span className="text-xs tracking-wider hidden sm:inline">
                                    {isBackendUp === true
                                        ? "Backend Active"
                                        : "Backend Inactive"}
                                </span>
                            </div>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/5 shadow-2xl p-10">
                        {activeTab === "generator" && (
                            <GeneratorPanel
                                activeSBox={activeSBox}
                                setActiveSBox={setActiveSBox}
                                matrix={affineMatrix}
                                setMatrix={setAffineMatrix}
                                vector={affineVector}
                                setVector={setAffineVector}
                            />
                        )}
                        {activeTab === "validation" && (
                            <ValidationPanel
                                activeSBox={activeSBox}
                                setActiveSBox={setActiveSBox}
                            />
                        )}
                        {activeTab === "cipher" && (
                            <CipherPanel activeSBox={activeSBox} />
                        )}
                        {activeTab === "team" && <TeamPanel />}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
