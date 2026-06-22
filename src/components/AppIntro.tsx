import React, { useEffect, useState } from 'react';

export default function AppIntro({ onComplete }: { onComplete: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Epic intro duration before starting fade
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 1000); // 1 second after fade out begins
    }, 4500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) {
    return (
      <div 
        className="fixed inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden transition-opacity duration-1000 opacity-0 pointer-events-none"
        style={{ zIndex: 2147483647 }} 
      />
    );
  }

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden intro-container"
      style={{ zIndex: 2147483647 }}
    >
      {/* Background glow */}
      <div className="absolute w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] background-pulse" />

      <div className="relative flex flex-col items-center logo-container">
        {/* The Logo */}
        <div className="relative flex items-center justify-center mb-10 logo-box">
          {/* Spinning star burst or aura */}
          <div className="absolute inset-0 scale-150 border-[1px] border-orange-500/20 rounded-full border-dashed spin-slow" />
          <div className="absolute inset-0 scale-[1.75] border-[1px] border-blue-500/20 rounded-full border-dotted spin-reverse" />
          
          <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center shadow-[0_0_100px_rgba(249,115,22,0.8)] box-inner">
            <div className="w-full h-full border-[5px] border-white/30 rounded-3xl absolute" />
            <span className="text-white text-[5.5rem] font-black leading-none tracking-tighter filter drop-shadow-xl icon-text" style={{ fontFamily: '"Inter", sans-serif' }}>
              R
            </span>
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center text-container">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tracking-[0.3em] uppercase mb-2 drop-shadow-2xl font-sans title-text" style={{ fontFamily: '"Space Grotesk", "Inter", sans-serif' }}>
            Shady Studios
          </h1>
          
          {/* Epic sub-line sweep */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent w-full mt-4 line-sweep" />
        </div>
      </div>

      {/* Cinematic Flash / Impact effect */}
      <div className="absolute inset-0 bg-white pointer-events-none flash-bang" />

      <style dangerouslySetInnerHTML={{ __html: `
        .intro-container {
          animation: fade-in-intro 0.5s ease-out;
        }

        .logo-container {
          animation: logo-reveal 3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: scale(0.8) translateY(30px);
        }

        .logo-box {
          animation: float 4s ease-in-out infinite;
        }

        .box-inner {
          animation: box-rotate 3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .icon-text {
          animation: icon-glow 2s ease-out forwards;
          transform: rotate(-3deg);
        }

        .title-text {
          animation: text-reveal 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 1.2s;
          opacity: 0;
          transform: translateY(20px);
          filter: blur(10px);
        }

        .line-sweep {
          animation: line-expand 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 1.5s;
          transform: scaleX(0);
          opacity: 0;
        }

        .background-pulse {
          animation: pulse-bg 4s ease-in-out infinite;
        }

        .flash-bang {
          opacity: 0;
          animation: flash-effect 5s ease-out forwards;
        }

        .spin-slow {
          animation: spin 20s linear infinite;
        }
        
        .spin-reverse {
          animation: spin 25s linear infinite reverse;
        }

        /* Keyframes */
        @keyframes fade-in-intro {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes logo-reveal {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(50px);
            filter: blur(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0);
          }
        }

        @keyframes box-rotate {
          0% { transform: rotate(-45deg) scale(0.5); }
          100% { transform: rotate(3deg) scale(1); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }

        @keyframes text-reveal {
          0% {
            opacity: 0;
            transform: translateY(20px);
            filter: blur(15px);
            letter-spacing: 0.1em;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
            letter-spacing: 0.3em;
          }
        }

        @keyframes line-expand {
          0% {
            transform: scaleX(0);
            opacity: 0;
            filter: blur(4px);
          }
          100% {
            transform: scaleX(1);
            opacity: 1;
            filter: blur(0px);
          }
        }

        @keyframes flash-effect {
          0%, 20% { opacity: 0; }
          25% { opacity: 0.3; } /* Epic flash sync with title impact */
          35%, 100% { opacity: 0; }
        }

        @keyframes pulse-bg {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.3); opacity: 0.6; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}

