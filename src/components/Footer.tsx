import { Github, Mail, Sparkles, Instagram, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import logoUnnes from '../img/logounnes.png';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/5 backdrop-blur-xl bg-slate-950/80 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-12 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400/60" />
              <h3 className="text-sm tracking-wider text-slate-300/80 uppercase">
                About
              </h3>
            </div>
            <p className="text-sm text-slate-400/60 leading-relaxed">
              Advanced cryptographic research platform for S-Box generation, 
              validation, and AES-128 cipher testing.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm tracking-wider text-slate-300/80 uppercase mb-4">Research Tools</h3>
            <ul className="space-y-2.5 text-sm text-slate-400/60">
              <li className="flex items-start gap-2 hover:text-slate-300/80 transition-colors">
                <span className="text-amber-400/40 mt-1">—</span>
                <span>Affine transformation generation</span>
              </li>
              <li className="flex items-start gap-2 hover:text-slate-300/80 transition-colors">
                <span className="text-amber-400/40 mt-1">—</span>
                <span>Cryptographic strength metrics</span>
              </li>
              <li className="flex items-start gap-2 hover:text-slate-300/80 transition-colors">
                <span className="text-amber-400/40 mt-1">—</span>
                <span>Custom cipher implementation</span>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm tracking-wider text-slate-300/80 uppercase mb-4">Connect</h3>
            <div className="flex gap-3 mb-5">
              <motion.a
                href="https://www.instagram.com/fittracakomoli/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center
                  hover:bg-pink-500/10 hover:border-pink-500/30 transition-all duration-300"
              >
                <Instagram className="w-4 h-4 text-slate-300/60" />
              </motion.a>
              <motion.a
                href="https://wa.me/62895323040009"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center
                  hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4 text-slate-300/60" />
              </motion.a>
              <motion.a
                href="https://github.com/fittracakomoli"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center
                  hover:bg-amber-500/10 hover:border-amber-500/30 transition-all duration-300"
              >
                <Github className="w-4 h-4 text-slate-300/60" />
              </motion.a>
              <motion.a
                href="mailto:ihsanprt7@gmail.com"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center
                  hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300"
              >
                <Mail className="w-4 h-4 text-slate-300/60" />
              </motion.a>
            </div>
            <p className="text-xs text-slate-400/40 italic">
              Research & educational use only
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400/40">
            <div className="flex items-center gap-2">
              <div className="w-10 h-12 p-1 flex items-center justify-center overflow-hidden">
                <img src={logoUnnes} alt="Logo UNNES" className="w-full h-full object-contain" />
              </div>
              <p>
                © {currentYear} AES S-box Analyzer
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Universitas Negeri Semarang</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Crafted for cryptography research</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
