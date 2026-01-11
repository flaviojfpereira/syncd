import { useState } from 'react';
import { User, Habit } from './types';
import { getIdentityLabel, getStageLabel } from './utils/identity';
import { useHaptics } from './components/HapticEngine';
import { TheCurrent } from './components/TheCurrent';

// Mock Data updated to include 'status'
const MOCK_FRIENDS: User[] = [
  { 
    id: '2', 
    name: 'Alex', 
    habits: [
        { id: 'h1', name: 'Write', identityName: 'Writer', streakDays: 4, lastLogged: new Date(), status: 'ACTIVE' }
    ],
    focusSession: { isActive: true, intention: 'Drafting Chapter 4' },
    lastActive: new Date(),
    dailyWin: 'Finished the climax of the novel.'
  },
  { 
    id: '3', 
    name: 'Jordan', 
    habits: [
        { id: 'h2', name: 'Fast', identityName: 'Stoic', streakDays: 72, lastLogged: null, status: 'ACTIVE' },
        { id: 'h3', name: 'Read', identityName: 'Scholar', streakDays: 12, lastLogged: new Date(), status: 'ACTIVE' }
    ],
    focusSession: { isActive: true, intention: 'Reading Stoicism' },
    lastActive: new Date() 
  },
  { 
    id: '4', 
    name: 'Casey', 
    habits: [
        { id: 'h4', name: 'Build', identityName: 'Founder', streakDays: 14, lastLogged: new Date(), status: 'ACTIVE' }
    ],
    focusSession: { isActive: false },
    lastActive: new Date(),
    dailyWin: 'Closed our first enterprise lead.'
  },
];

const INITIAL_USER: User = {
  id: '1',
  name: 'You',
  habits: [
      { id: 'u1', name: 'Running', identityName: 'Fighter', streakDays: 6, lastLogged: null, status: 'ACTIVE' },
      { id: 'u2', name: 'Meditation', identityName: 'Monk', streakDays: 21, lastLogged: null, status: 'STASIS' } // Example of a habit in Recovery Mode
  ],
  focusSession: { isActive: false },
  lastActive: new Date(),
};

const SYNC_HOUR = 21;

export default function App() {
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [friends] = useState<User[]>(MOCK_FRIENDS);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isSimulatedShake, setIsSimulatedShake] = useState(false);
  
  const [reflectionTargetId, setReflectionTargetId] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  
  const [isVictoryRitual, setIsVictoryRitual] = useState(false);
  const [winText, setWinText] = useState('');

  const { triggerJolt, triggerSuccess } = useHaptics();

  const currentHour = currentTime.getHours();
  const isSyncTimePassed = currentHour >= SYNC_HOUR;
  
  const isHabitDoneToday = (habit: Habit) => {
      if (!habit.lastLogged) return false;
      return currentTime.toDateString() === habit.lastLogged.toDateString();
  };

  const hasUserLoggedAny = user.habits.some(h => isHabitDoneToday(h));
  const isMatrixUnlocked = isSyncTimePassed && hasUserLoggedAny && !!user.dailyWin;

  const initiateLogHabit = (habitId: string) => setReflectionTargetId(habitId);

  const confirmLogHabit = () => {
    if (!reflectionTargetId) return;
    triggerSuccess();
    
    setUser(prev => ({
      ...prev,
      habits: prev.habits.map(h => {
        if (h.id === reflectionTargetId) {
          const newStreak = h.status === 'ACTIVE' ? h.streakDays + 1 : h.streakDays;
          
          return { 
            ...h, 
            streakDays: newStreak,
            lastLogged: new Date(currentTime),
            status: 'ACTIVE'
          };
        }
        return h;
      })
    }));
    setReflectionTargetId(null);
    setReflectionText('');
  };

  const confirmVictory = () => {
    triggerSuccess();
    setUser(prev => ({ ...prev, dailyWin: winText }));
    setIsVictoryRitual(false);
    setWinText('');
  };

  const handleJoinCurrent = (intention: string, verification: string) => {
    triggerSuccess();
    setUser(prev => ({ ...prev, focusSession: { isActive: true, startTime: new Date(currentTime), intention, verification } }));
  };

  const toggleTime = () => {
    const newTime = new Date(currentTime);
    newTime.setHours(newTime.getHours() < SYNC_HOUR ? 21 : 10, 30);
    setCurrentTime(newTime);
  };

  return (
    <div className={`min-h-screen bg-void text-white font-mono flex flex-col relative overflow-hidden ${isSimulatedShake ? 'animate-jolt' : ''}`}>
      <header className="p-6 flex justify-between items-center border-b border-white/5 z-20 bg-void/80 backdrop-blur-md sticky top-0">
        <h1 className="text-lg tracking-[0.5em] font-bold">SYNCD</h1>
        <div className="text-[10px] text-zinc-600 tracking-widest uppercase">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </header>

      <main className="flex-1 flex flex-col relative overflow-y-auto pb-20">
        <section className="p-8 border-b border-white/5 flex flex-col items-center min-h-[45vh] space-y-12">
          <div className="text-zinc-600 text-[9px] tracking-[0.4em] uppercase">The Mirror</div>
          <div className="w-full max-w-md space-y-12">
            {user.habits.map(habit => {
              const isDone = isHabitDoneToday(habit);
              const isStasis = habit.status === 'STASIS';
              
              return (
                <div key={habit.id} className="flex flex-col items-center space-y-5">
                  <div className="text-center space-y-2">
                    <h2 className={`text-2xl md:text-3xl font-light tracking-tight transition-all duration-700 
                      ${isDone ? 'opacity-100 text-white' : ''}
                      ${!isDone && isStasis ? 'opacity-40 text-red-300 decoration-red-900/50' : ''}
                      ${!isDone && !isStasis ? 'opacity-30 grayscale' : ''}
                    `}>
                      {getIdentityLabel(habit.streakDays, habit.name, habit.identityName)}
                    </h2>
                    
                    <div className="flex items-center justify-center gap-2">
                      {isStasis && <span className="text-[8px] bg-red-900/20 text-red-500 border border-red-900/30 px-2 py-0.5 uppercase tracking-widest">At Risk</span>}
                      <p className="text-[9px] tracking-[0.3em] text-zinc-700 uppercase">
                        {habit.name} • {getStageLabel(habit.streakDays)} • Day {habit.streakDays}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 w-full max-w-[180px] h-[1px]">
                    {[1, 8, 22, 67].map(threshold => (
                      <div key={threshold} className={`flex-1 transition-colors duration-1000 ${habit.streakDays >= threshold ? (isStasis ? 'bg-red-900/50' : 'bg-zinc-400') : 'bg-zinc-900'}`}></div>
                    ))}
                  </div>

                  {!isDone && (
                    <button 
                      onClick={() => initiateLogHabit(habit.id)} 
                      className={`
                        px-10 py-2 text-[9px] transition-all tracking-[0.4em] uppercase
                        ${isStasis 
                          ? 'border border-red-900/40 text-red-500 hover:bg-red-900/10 hover:border-red-500' 
                          : 'border border-white/10 text-white hover:border-white'
                        }
                      `}
                    >
                      {isStasis ? 'Re-Ignite' : 'Complete'}
                    </button>
                  )}
                </div>
              );
            })}
            
            {user.dailyWin && (
              <div className="text-center pt-8 border-t border-white/5">
                <div className="text-[8px] tracking-[0.5em] text-zinc-600 uppercase mb-4">Daily Victory</div>
                <div className="text-sm italic text-zinc-400 font-light">&ldquo;{user.dailyWin}&rdquo;</div>
              </div>
            )}
          </div>
        </section>

        <section className="flex-1 relative p-8 pb-32">
          <div className="flex justify-between items-center mb-12">
            <div className="text-zinc-600 text-[9px] tracking-[0.4em] uppercase">The Tribe</div>
            {!isSyncTimePassed && <div className="text-zinc-800 text-[9px] border border-zinc-900 px-3 py-1 uppercase tracking-widest">Locked</div>}
          </div>

          <div className="grid grid-cols-1 gap-12 relative z-0">
            {friends.map(friend => {
              const hasIncomplete = friend.habits.some(h => !isHabitDoneToday(h));
              return (
                <div key={friend.id} className="group border-b border-white/5 pb-10 last:border-0 relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-xs tracking-[0.4em] uppercase font-bold text-zinc-400 group-hover:text-white transition-colors">
                      {friend.name}
                    </div>
                    {isMatrixUnlocked && hasIncomplete && (
                      <button 
                        onClick={() => triggerJolt()} 
                        className="text-[8px] text-red-500 border border-red-500/20 px-3 py-1.5 hover:bg-red-500/10 hover:border-red-500/40 transition-all tracking-widest uppercase"
                      >
                        Jolt
                      </button>
                    )}
                  </div>
                  <div className="space-y-5">
                    {friend.habits.map(habit => (
                      <div key={habit.id} className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[10px] tracking-widest uppercase font-mono">
                          <span className={isMatrixUnlocked ? 'text-zinc-500' : 'text-zinc-900'}>
                            {isMatrixUnlocked 
                              ? `${habit.name} — ${getStageLabel(habit.streakDays)}` 
                              : '••••••••'}
                          </span>
                          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-1000 ${isMatrixUnlocked && isHabitDoneToday(habit) ? 'bg-white shadow-[0_0_8px_white]' : 'bg-zinc-900'}`}></div>
                        </div>
                      </div>
                    ))}
                    {isMatrixUnlocked && friend.dailyWin && (
                      <div className="mt-4 text-[11px] italic text-zinc-500 border-l border-zinc-800 pl-6 py-3 leading-relaxed font-light bg-zinc-900/10">
                        &ldquo;{friend.dailyWin}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {!isMatrixUnlocked && (
              <div className="absolute inset-0 bg-void/80 backdrop-blur-2xl flex flex-col items-center justify-center z-10 border border-white/5 -m-2 min-h-[400px]">
                <div className="text-center space-y-8 p-10 max-w-xs">
                  <div className="w-5 h-5 border border-zinc-800 mx-auto rotate-45 animate-pulse"></div>
                  {!isSyncTimePassed ? (
                    <p className="text-[10px] tracking-[0.5em] text-zinc-700 uppercase leading-loose">Wait for Sync<br/>@ 21:00</p>
                  ) : !hasUserLoggedAny ? (
                    <p className="text-[10px] tracking-[0.5em] text-zinc-600 uppercase">Action required<br/>to reveal tribe</p>
                  ) : (
                    <div className="space-y-8">
                       <p className="text-[10px] tracking-[0.4em] text-zinc-400 uppercase leading-loose">Final ritual<br/>remains</p>
                       <button 
                        onClick={() => setIsVictoryRitual(true)} 
                        className="w-full px-8 py-4 bg-white text-black text-[9px] tracking-[0.5em] uppercase hover:bg-zinc-200 transition-all shadow-2xl"
                       >
                         Declare Victory
                       </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* RITUAL MODALS */}
      {reflectionTargetId && (
        <div className="fixed inset-0 z-[100] bg-void/98 backdrop-blur-3xl flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-12">
            <h3 className="text-center text-[9px] tracking-[0.5em] text-zinc-700 uppercase">
              {user.habits.find(h => h.id === reflectionTargetId)?.status === 'STASIS' ? 'THE RECOVERY' : 'PRIVATE AUDIT'}
            </h3>
            
            <p className="text-xl text-center font-light leading-relaxed text-zinc-400">
              {user.habits.find(h => h.id === reflectionTargetId)?.status === 'STASIS' 
                ? "Acknowledge the slip. Resume the path." 
                : "Why did I do this for myself today?"}
            </p>
            
            <textarea 
              value={reflectionText} 
              onChange={(e) => setReflectionText(e.target.value)} 
              className="w-full bg-transparent border-b border-zinc-900 p-4 text-sm focus:outline-none focus:border-zinc-500 transition-all min-h-[100px] text-white placeholder-zinc-800" 
              placeholder="(Optional) Note..." 
              autoFocus 
            />
            
            <div className="flex gap-8">
              <button onClick={() => setReflectionTargetId(null)} className="flex-1 py-4 text-[9px] tracking-widest text-zinc-700 hover:text-white uppercase transition-colors">Discard</button>
              <button 
                onClick={confirmLogHabit} 
                className={`flex-1 py-4 text-[9px] tracking-widest uppercase transition-all
                  ${user.habits.find(h => h.id === reflectionTargetId)?.status === 'STASIS' 
                    ? 'bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40' 
                    : 'bg-white text-black hover:bg-zinc-200'
                  }
                `}
              >
                {user.habits.find(h => h.id === reflectionTargetId)?.status === 'STASIS' ? 'Ignite' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isVictoryRitual && (
        <div className="fixed inset-0 z-[110] bg-void/98 backdrop-blur-3xl flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-12">
            <h3 className="text-center text-[9px] tracking-[0.5em] text-zinc-700 uppercase">The Altar</h3>
            <p className="text-xl text-center font-light leading-relaxed text-zinc-400">What was your one true win today?</p>
            <input 
              type="text" 
              value={winText} 
              onChange={(e) => setWinText(e.target.value)} 
              className="w-full bg-transparent border-b border-zinc-900 p-4 text-sm focus:outline-none focus:border-zinc-500 transition-all text-white placeholder-zinc-900" 
              placeholder="Declare your victory..." 
              autoFocus 
            />
            <div className="flex gap-8">
              <button onClick={() => setIsVictoryRitual(false)} className="flex-1 py-4 text-[9px] tracking-widest text-zinc-700 hover:text-white uppercase transition-colors">Wait</button>
              <button onClick={confirmVictory} disabled={winText.length < 3} className="flex-1 py-4 text-[9px] tracking-widest bg-white text-black hover:bg-zinc-200 disabled:opacity-10 transition-all uppercase">Seal Ritual</button>
            </div>
          </div>
        </div>
      )}

      <TheCurrent 
        user={user} 
        friends={friends} 
        onJoin={handleJoinCurrent} 
        onLeave={() => setUser(p=>({...p, focusSession:{isActive:false}}))} 
      />

      {/* DEBUG PANEL - ALWAYS VISIBLE */}
      <div className="fixed bottom-4 left-4 flex flex-col gap-2 z-[70]">
        <button 
          onClick={toggleTime} 
          className="bg-zinc-900/40 border border-zinc-800/40 text-[8px] p-2 text-zinc-500 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest"
        >
          After/Before 9pm
        </button>
        <button 
          onClick={() => { triggerJolt(); setIsSimulatedShake(true); setTimeout(() => setIsSimulatedShake(false), 500); }} 
          className="bg-zinc-900/40 border border-zinc-800/40 text-[8px] p-2 text-zinc-500 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest"
        >
          Feel Jolt
        </button>
      </div>
    </div>
  );
}