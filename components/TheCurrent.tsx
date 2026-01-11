import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface Props {
  user: User;
  friends: User[];
  onJoin: (intention: string, verification: string) => void;
  onLeave: () => void;
}

export const TheCurrent: React.FC<Props> = ({ user, friends, onJoin, onLeave }) => {
  const [seconds, setSeconds] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [intention, setIntention] = useState('');
  const [verification, setVerification] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Removed triggerHum to protect deep work focus
  
  const activeFriends = friends.filter(f => f.focusSession.isActive);
  const totalActive = activeFriends.length + (user.focusSession.isActive ? 1 : 0);
  const isActive = user.focusSession.isActive;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
        // Haptic hum removed per "Zero Noise" feedback
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isJoining) {
    return (
      <div className="fixed inset-0 bg-void/95 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-12 border border-white/10 p-10">
          <div className="text-center space-y-3">
            <h3 className="text-xl tracking-[0.4em] font-light">ENTER THE CURRENT</h3>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Shared Deep Focus Ritual</p>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 block">Intention</label>
              <input 
                type="text" 
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                placeholder="..."
                className="w-full bg-transparent border-b border-zinc-800 py-3 text-sm focus:outline-none focus:border-white transition-all placeholder-zinc-800"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 block">Verifiability</label>
              <input 
                type="text" 
                value={verification}
                onChange={(e) => setVerification(e.target.value)}
                placeholder="..."
                className="w-full bg-transparent border-b border-zinc-800 py-3 text-sm focus:outline-none focus:border-white transition-all placeholder-zinc-800"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={() => setIsJoining(false)} className="flex-1 py-4 text-[10px] tracking-widest text-zinc-600 hover:text-white transition-colors">CANCEL</button>
            <button 
              onClick={() => { if(intention && verification) onJoin(intention, verification); setIsJoining(false); }}
              disabled={!intention || !verification}
              className="flex-1 py-4 text-[10px] tracking-widest bg-white text-black hover:bg-zinc-200 transition-all disabled:opacity-20"
            >
              BEGIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border-t border-white/10 p-6 flex flex-col items-center justify-center space-y-4 bg-void z-40 relative">
      
      {isExpanded && isActive && (
        <div className="fixed bottom-[140px] left-6 right-6 md:left-auto md:right-6 md:w-80 bg-zinc-900 border border-white/10 p-6 shadow-2xl z-[60] animate-fade-in">
          <h4 className="text-[9px] uppercase tracking-[0.3em] text-zinc-600 mb-6 text-center">Sync Matrix</h4>
          <div className="space-y-5">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] tracking-widest">
                <span className="text-white">YOU</span>
                <span className="text-zinc-600">{formatTime(seconds)}</span>
              </div>
              <div className="text-[10px] italic text-zinc-500 border-l border-zinc-700 pl-3 py-1">{user.focusSession.intention}</div>
            </div>
            {activeFriends.map(f => (
              <div key={f.id} className="flex flex-col gap-1 border-t border-white/5 pt-4">
                <div className="flex justify-between items-center text-[10px] tracking-widest">
                  <span className="text-zinc-400">{f.name}</span>
                  <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                </div>
                <div className="text-[10px] italic text-zinc-600 border-l border-zinc-800 pl-3 py-1">{f.focusSession.intention}</div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setIsExpanded(false)}
            className="w-full text-center mt-8 text-[9px] tracking-widest text-zinc-600 hover:text-white uppercase transition-colors"
          >
            Close Stream
          </button>
        </div>
      )}

      <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-600">
        The Current
      </div>
      
      <button 
        onClick={isActive ? () => setIsExpanded(!isExpanded) : () => setIsJoining(true)}
        className={`
          w-24 h-24 rounded-full border flex flex-col items-center justify-center transition-all duration-1000 relative
          ${isActive 
            ? 'border-white bg-white/5 animate-pulse-slow shadow-[0_0_40px_rgba(255,255,255,0.05)]' 
            : 'border-zinc-900 text-zinc-700 hover:border-zinc-700 hover:text-zinc-500'
          }
        `}
      >
        {isActive ? (
          <>
            <span className="font-mono text-xl tracking-tighter">{formatTime(seconds)}</span>
            <span className="text-[8px] tracking-[0.2em] mt-2 opacity-40 uppercase">Details</span>
          </>
        ) : (
          <span className="text-[10px] tracking-[0.4em] uppercase">Join</span>
        )}
      </button>

      <div className="h-4 text-[10px] font-mono flex items-center justify-center w-full text-zinc-600 tracking-widest">
         {isActive ? (
             <div className="flex items-center space-x-6">
                 <div className="flex items-center space-x-2">
                    <span className="w-1 h-1 bg-white rounded-full animate-ping"></span>
                    <span>{totalActive} SYNCED</span>
                 </div>
                 <button onClick={onLeave} className="text-[9px] border-b border-zinc-800 hover:text-white hover:border-white transition-all uppercase">
                     LEAVE
                 </button>
             </div>
         ) : (
            <span className="opacity-40 uppercase">{totalActive > 0 ? `${totalActive} In Flow` : 'Quiet'}</span>
         )}
      </div>
    </div>
  );
};