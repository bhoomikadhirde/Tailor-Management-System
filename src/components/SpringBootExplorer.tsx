import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Database, 
  FileCode, 
  Copy, 
  Check, 
  Layers, 
  HelpCircle, 
  Server, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { springBootData } from '../springbootData';
import { SpringBootFile } from '../types';

export default function SpringBootExplorer() {
  const [selectedFile, setSelectedFile] = useState<SpringBootFile>(springBootData[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileIcon = (file: SpringBootFile) => {
    switch (file.type) {
      case 'SQL':
        return 'text-natural-accent bg-natural-panel';
      case 'PROPERTIES':
        return 'text-natural-muted bg-natural-panel';
      case 'CONTROLLER':
        return 'text-[#9A9B7C] bg-[#9A9B7C]/10';
      case 'MODEL':
        return 'text-natural-accent bg-natural-bg';
      case 'CONFIG':
        return 'text-natural-muted bg-natural-panel';
      default:
        return 'text-natural-muted bg-natural-panel';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-natural-text tracking-tight">Spring Boot & MySQL Code Export</h2>
        <p className="text-natural-muted text-xs mt-0.5">Explore compile-ready REST API files constructed with JPA annotations and stateless Spring Security rules.</p>
      </div>

      <div className="bg-[#4A3E31] p-8 rounded-3xl border border-[#3D3328] text-[#FAF9F6] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm relative overflow-hidden">
        
        {/* Abstract pattern lines background */}
        <div className="absolute inset-0 bg-grid opacity-10" />

        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[#FAF9F6] font-mono text-[10px] uppercase font-bold tracking-wider">
            <Server className="h-3 w-3 text-[#9A9B7C]" />
            <span>Target Platform: Spring Boot 3.x + MySQL</span>
          </div>
          <h3 className="font-serif font-bold text-white text-lg">Production-Grade Enterprise Architecture</h3>
          <p className="text-[#FAF9F6]/80 text-xs leading-relaxed">
            The files shown here are physically mirrored inside the workspace folder (under <code className="text-[#FAF9F6]">/springboot-backend/</code>). Build your database with the SQL script and hook up these Spring beans on your local workspace instantly.
          </p>
        </div>

        <div className="flex gap-4 relative z-10 shrink-0">
          <div className="text-center bg-white/10 border border-white/10 p-4 rounded-2xl min-w-[100px]">
            <span className="font-mono text-[10px] text-[#FAF9F6]/70 block uppercase font-bold">Port Bound</span>
            <span className="font-serif text-lg font-bold text-[#E8E2D9]">8080</span>
          </div>
          <div className="text-center bg-white/10 border border-white/10 p-4 rounded-2xl min-w-[100px]">
            <span className="font-mono text-[10px] text-[#FAF9F6]/70 block uppercase font-bold">SQL Driver</span>
            <span className="font-serif text-lg font-bold text-[#E8E2D9]">MySQL8+</span>
          </div>
        </div>
      </div>

      {/* Code explorer structure splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Folder listings */}
        <div className="lg:col-span-4 bg-white border border-natural-border rounded-2xl p-5 space-y-4">
          <p className="font-mono text-[10px] font-bold text-natural-muted uppercase tracking-widest px-2">Spring Project Tree</p>
          
          <div className="space-y-1.5">
            {springBootData.map((file) => (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file)}
                className={`w-full flex items-start gap-3 p-3.5 rounded-xl transition-all text-left border cursor-pointer ${
                  selectedFile.name === file.name
                    ? 'bg-natural-accent/10 border-natural-accent text-[#4A3E31] shadow-xs'
                    : 'bg-white border-transparent text-natural-text hover:bg-natural-panel'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${getFileIcon(file)}`}>
                  <FileCode className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-mono text-xs font-bold leading-tight truncate">{file.name}</h4>
                  <p className="text-[10px] font-mono text-natural-muted truncate mt-1">{file.path}</p>
                </div>
                <ChevronRight className={`h-4 w-4 self-center text-natural-muted shrink-0 opacity-40 transition-transform ${selectedFile.name === file.name ? 'translate-x-0.5 opacity-100 text-natural-accent font-bold' : ''}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Code and detailed viewer pane */}
        <div className="lg:col-span-8 bg-[#4A3E31] rounded-2xl border border-[#3D3328] flex flex-col justify-between overflow-hidden">
          
          {/* Viewer pane Header bar */}
          <div className="px-6 py-4 border-b border-white/10 bg-[#3D3328] flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="inline-block px-2 py-0.5 bg-[#4A3E31] border border-white/20 text-[#FAF9F6] rounded text-[9px] font-mono font-semibold uppercase tracking-wider mb-1">
                {selectedFile.type} Script
              </span>
              <p className="font-mono text-xs text-[#FAF9F6] truncate">{selectedFile.path}</p>
            </div>

            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-[#3D3328] hover:bg-[#4A3E31] text-[#FAF9F6] rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-[#9A9B7C]" />
                  <span className="text-[#9A9B7C]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy source</span>
                </>
              )}
            </button>
          </div>

          {/* Description Block */}
          <div className="px-6 py-4 bg-[#3D3328]/60 border-b border-white/10 flex gap-3 text-xs text-[#FAF9F6]/80 max-w-none shadow-inner">
            <Info className="h-4.5 w-4.5 text-[#9A9B7C] shrink-0 mt-0.5" />
            <p className="font-sans leading-relaxed">{selectedFile.description}</p>
          </div>

          {/* Source block */}
          <div className="p-6 bg-[#362D24] overflow-auto font-mono text-xs text-[#FAF9F6]/90 leading-relaxed custom-scrollbar h-[380px]">
            <pre className="font-mono bg-transparent m-0 whitespace-pre">
              <code>{selectedFile.content}</code>
            </pre>
          </div>

          {/* Footer Guide block */}
          <div className="px-6 py-4 bg-[#3D3328]/35 border-t border-white/10 text-[#FAF9F6]/50 font-mono text-[10px] text-center">
            Files compliant with Java 17+, Hibernate 5.6+, and MySQL Dialect 8+
          </div>

        </div>

      </div>
    </div>
  );
}
