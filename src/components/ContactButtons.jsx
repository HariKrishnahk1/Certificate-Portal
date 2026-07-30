import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Instagram } from 'lucide-react';

export default function ContactButtons() {
  const socialLinks = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/harikrishnahk0221/?utm_source=chatgpt.com',
      icon: <Linkedin className="w-5 h-5" />,
      colorClass: 'hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5',
      glowColor: 'rgba(59, 130, 246, 0.2)'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/harikrishnakuppusamy_official?utm_source=chatgpt.com',
      icon: <Instagram className="w-5 h-5" />,
      colorClass: 'hover:text-pink-400 hover:border-pink-500/30 hover:bg-pink-500/5',
      glowColor: 'rgba(236, 72, 153, 0.2)'
    }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      {socialLinks.map((link) => (
        <motion.a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ 
            scale: 1.05,
            boxShadow: `0 0 20px ${link.glowColor}`
          }}
          whileTap={{ scale: 0.98 }}
          className={`w-full sm:w-44 py-3.5 px-6 rounded-2xl bg-slate-950/60 border border-slate-850 text-slate-350 font-medium transition-all duration-300 flex items-center justify-center gap-2.5 ${link.colorClass}`}
        >
          {link.icon}
          <span>{link.name}</span>
        </motion.a>
      ))}
    </div>
  );
}
