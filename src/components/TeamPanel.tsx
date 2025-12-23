import { motion } from 'motion/react';
import { Users, Instagram, Github, Linkedin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import fathurImg from '../img/fathur.png';
import fittraImg from '../img/fittra.jpg';
import ihsanImg from '../img/ihsan.jpg';
import wisikImg from '../img/wisik.jpg';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
}

export function TeamPanel() {
  const team: TeamMember[] = [
    {
      name: 'Fathurrizqo',
      role: 'UI/UX Designer',
      image: fathurImg,
      instagram: 'https://www.instagram.com/fathurrizqo/',
      github: 'https://github.com/nerveign',
      linkedin: 'https://www.linkedin.com/in/fathurrizqo/'
    },
    {
      name: 'Fittra Marga Ardana',
      role: 'Backend',
      image: fittraImg,
      instagram: 'https://www.instagram.com/fittracakomoli/',
      github: 'https://github.com/fittracakomoli',
      linkedin: 'https://www.linkedin.com/in/fittra-marga-ardana/'
    },
    {
      name: 'Ihsan Pratama Putra',
      role: 'Frontend',
      image: ihsanImg,
      instagram: 'https://www.instagram.com/ihsnpp/',
      github: 'https://github.com/ihsan05-png',
      linkedin: 'https://www.linkedin.com/in/ihsan-pratama-942811286/'
    },
    {
      name: 'Wisik Adi Panuntun',
      role: 'Ui/UX Designer',
      image: wisikImg,
      instagram: 'https://www.instagram.com/wisikadipntn_/',
      github: 'https://github.com/Wisikadi16',
      linkedin: 'https://www.linkedin.com/in/wisikadip16/'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Users className="w-6 h-6 text-amber-400/70" />
          <h2 className="text-3xl tracking-[0.2em] text-slate-100">RESEARCH TEAM</h2>
        </div>
        <p className="text-slate-400/60 tracking-wide max-w-2xl mx-auto leading-relaxed">
          Meet the brilliant minds behind AES S-box Analyzer, dedicated to advancing 
          cryptographic research and security innovation.
        </p>
      </motion.div>

      {/* Team Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {team.map((member, index) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            className="group relative"
          >
            {/* Card */}
            <div className="relative bg-gradient-to-b from-slate-800/40 to-slate-900/40 rounded-xl overflow-hidden
              border border-slate-700/30 hover:border-amber-500/30 transition-all duration-500
              backdrop-blur-sm">
              
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden bg-slate-900/50">
                <ImageWithFallback
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-all duration-700 
                    group-hover:scale-110 group-hover:brightness-110"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-60" />
                
                {/* Social Links Overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-slate-900/90 
                  opacity-0 group-hover:opacity-100 transition-all duration-300">
                  {member.instagram && (
                    <motion.a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-full bg-slate-800/80 border border-pink-500/30 
                        flex items-center justify-center hover:bg-pink-500/20 transition-all"
                    >
                      <Instagram className="w-4 h-4 text-pink-400" />
                    </motion.a>
                  )}
                  
                  {member.github && (
                    <motion.a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-500/30 
                        flex items-center justify-center hover:bg-slate-700/50 transition-all"
                    >
                      <Github className="w-4 h-4 text-slate-300" />
                    </motion.a>
                  )}
                  
                  {member.linkedin && (
                    <motion.a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-full bg-slate-800/80 border border-blue-500/30 
                        flex items-center justify-center hover:bg-blue-500/20 transition-all"
                    >
                      <Linkedin className="w-4 h-4 text-blue-400" />
                    </motion.a>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <h3 className="text-lg text-slate-100 mb-1 tracking-wide">{member.name}</h3>
                <p className="text-xs text-amber-400/70 tracking-wider uppercase mb-3">{member.role}</p>
              </div>

              {/* Accent Line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent
                opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-16 text-center"
      >
        <div className="inline-block bg-slate-800/30 border border-slate-700/30 rounded-lg px-8 py-5 backdrop-blur-sm">
          <p className="text-sm text-slate-400/70 leading-relaxed">
            <span className="text-amber-400/60">Interested in joining our research?</span>
            <br />
            Contact us at <a href="mailto:ihsanprt7@gmail.com" className="text-amber-400/80 hover:text-amber-300 transition-colors underline decoration-amber-500/30">ihsanprt7@gmail.com</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
