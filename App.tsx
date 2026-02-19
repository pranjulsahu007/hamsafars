import React, { useState, useEffect } from 'react';
import { Heart, LogOut, Sparkles, Lock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { loginUser, saveChoices, findMatches, seedDemoData } from './services/storage';
import { generateIcebreaker } from './services/gemini';
import { Input } from './components/Input';
import { UserProfile, ScreenState } from './types';

// Initialize mock data only once
seedDemoData();

// Mock data for the landing page background
const BACKGROUND_COLUMNS = [
  [
    { name: 'Rashi', age: 21, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&q=80' },
    { name: 'Aditya', age: 22, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&q=80' },
    { name: 'Ayesha', age: 20, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&q=80' },
  ],
  [
    { name: 'Viren', age: 22, img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&q=80' },
    { name: 'Prachi', age: 23, img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&q=80' },
    { name: 'Kabir', age: 21, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&q=80' },
  ],
  [
    { name: 'Sana', age: 19, img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&q=80' },
    { name: 'Rohan', age: 22, img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop&q=80' },
    { name: 'Eshna', age: 20, img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&q=80' },
  ],
  [
    { name: 'Arjun', age: 24, img: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&q=80' },
    { name: 'Meera', age: 21, img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&q=80' },
    { name: 'Dev', age: 23, img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop&q=80' },
  ]
];

const App: React.FC = () => {
  // State
  const [screen, setScreen] = useState<ScreenState>('LOGIN');
  const [currentRoll, setCurrentRoll] = useState('');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // Login State
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard State
  const [choice1, setChoice1] = useState('');
  const [choice2, setChoice2] = useState('');
  const [choice3, setChoice3] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [matches, setMatches] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [icebreakers, setIcebreakers] = useState<Record<string, string>>({});
  const [loadingIcebreaker, setLoadingIcebreaker] = useState<string | null>(null);

  // --- Handlers ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim()) {
      setLoginError('Please enter a valid roll number.');
      return;
    }
    const user = loginUser(loginInput.trim());
    setCurrentRoll(user.rollNumber);
    setCurrentUser(user);
    
    // Pre-fill choices if they exist
    if (user.choices.length > 0) {
      setChoice1(user.choices[0] || '');
      setChoice2(user.choices[1] || '');
      setChoice3(user.choices[2] || '');
      setIsSaved(true);
    } else {
      setChoice1('');
      setChoice2('');
      setChoice3('');
      setIsSaved(false);
    }
    
    setScreen('DASHBOARD');
    setLoginInput('');
    setLoginError('');
  };

  const handleLogout = () => {
    setCurrentRoll('');
    setCurrentUser(null);
    setMatches([]);
    setIcebreakers({});
    setScreen('LOGIN');
    setIsSaved(false);
    setSubmitError('');
  };

  const handleSubmitChoices = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const choices = [choice1, choice2, choice3].map(c => c.trim()).filter(c => c !== '');

    // Validation Rules
    if (choices.length !== 3) {
      setSubmitError('You must enter exactly 3 unique roll numbers.');
      return;
    }
    
    // Check duplicates in input
    const uniqueChoices = new Set(choices);
    if (uniqueChoices.size !== 3) {
      setSubmitError('Please enter 3 different roll numbers. No duplicates allowed.');
      return;
    }

    if (uniqueChoices.has(currentRoll)) {
        setSubmitError("You cannot match with yourself!");
        return;
    }

    // Save
    const updatedUser = saveChoices(currentRoll, choices);
    setCurrentUser(updatedUser);
    setIsSaved(true);
    
    // Refresh matches
    const foundMatches = findMatches(currentRoll);
    setMatches(foundMatches);
  };

  const handleGenerateIcebreaker = async (targetRoll: string) => {
    if (loadingIcebreaker) return;
    setLoadingIcebreaker(targetRoll);
    const text = await generateIcebreaker(currentRoll, targetRoll);
    setIcebreakers(prev => ({ ...prev, [targetRoll]: text }));
    setLoadingIcebreaker(null);
  };

  // Check for matches on mount of dashboard if already saved
  useEffect(() => {
    if (screen === 'DASHBOARD' && currentRoll && isSaved) {
        const found = findMatches(currentRoll);
        setMatches(found);
    }
  }, [screen, currentRoll, isSaved]);


  // --- Render ---

  if (screen === 'LOGIN') {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-black flex flex-col items-center justify-center">
        
        {/* Background Grid */}
        <div className="absolute inset-0 flex justify-center items-center gap-6 opacity-40 scale-110 -rotate-12 pointer-events-none select-none">
          {BACKGROUND_COLUMNS.map((col, colIndex) => (
            <div key={colIndex} className={`flex flex-col gap-6 ${colIndex % 2 === 0 ? '-mt-20' : 'mt-20'}`}>
              {col.map((profile, i) => (
                <div key={i} className="w-56 h-80 relative rounded-xl overflow-hidden shadow-2xl bg-slate-800">
                  <img src={profile.img} alt={profile.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-lg">{profile.name}</span>
                      <span className="text-lg">{profile.age}</span>
                      <CheckCircle2 className="w-4 h-4 text-blue-400 fill-current" />
                    </div>
                  </div>
                  {/* Decorative action buttons on card */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                     <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                        <Heart className="w-4 h-4 text-rose-500 fill-current" />
                     </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Dark Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-xl px-6 text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight drop-shadow-lg">
              Start something <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-500">epic.</span>
            </h1>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input 
                  placeholder="Enter your Roll Number"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  className="bg-black/40 border-white/20 text-white placeholder:text-white/50 focus:ring-rose-500 focus:border-rose-500 text-lg py-3 text-center"
                />
                
                {loginError && (
                  <p className="text-rose-400 text-sm font-medium">{loginError}</p>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-600 hover:to-orange-700 text-white font-bold text-lg py-3.5 px-6 rounded-full transition-all transform hover:scale-[1.02] shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2"
                >
                  Create Account / Login
                </button>
              </form>
              
              <p className="text-white/60 text-xs mt-4">
                By tapping Create Account, you agree to our Terms. Learn how we process your data in our Privacy Policy and Cookies Policy.
              </p>
            </div>
        </div>
        
        {/* Footer Brand */}
        <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2 text-white/80">
            <div className="w-8 h-8 bg-white text-rose-500 rounded-full flex items-center justify-center font-bold">
               <Heart className="w-5 h-5 fill-current" />
            </div>
            <span className="font-bold text-xl tracking-wide">Hamsafar</span>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md shadow-rose-200">
               <Heart className="w-4 h-4 text-white fill-current" />
            </div>
            <span className="font-bold text-slate-800 text-xl tracking-tight">Hamsafar</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 font-medium hidden sm:block px-3 py-1 bg-slate-100 rounded-full">
              {currentRoll}
            </span>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        
        {/* Intro Banner */}
        {!isSaved && (
           <div className="bg-gradient-to-r from-rose-500 to-orange-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
             <div className="relative z-10">
               <h2 className="text-3xl font-bold mb-3">Find your match</h2>
               <p className="text-white/90 text-lg max-w-lg">
                 Enter the roll numbers of 3 people you're interested in. It's completely anonymous until they pick you too!
               </p>
             </div>
             <Heart className="absolute -bottom-10 -right-10 w-64 h-64 text-white/10 rotate-12 fill-current" />
           </div>
        )}

        {/* Input Section */}
        <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Your Top 3 Picks</h3>
            {isSaved && <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Saved</span>}
          </div>

          <form onSubmit={handleSubmitChoices} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Roll Number 1"
                value={choice1}
                onChange={(e) => { setIsSaved(false); setChoice1(e.target.value); }}
                disabled={isSaved} 
                className="bg-slate-50 border-slate-200 focus:ring-rose-500 focus:border-rose-500"
              />
              <Input
                placeholder="Roll Number 2"
                value={choice2}
                onChange={(e) => { setIsSaved(false); setChoice2(e.target.value); }}
                 className="bg-slate-50 border-slate-200 focus:ring-rose-500 focus:border-rose-500"
              />
              <Input
                placeholder="Roll Number 3"
                value={choice3}
                onChange={(e) => { setIsSaved(false); setChoice3(e.target.value); }}
                 className="bg-slate-50 border-slate-200 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            {submitError && (
              <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-3 border border-red-100">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                {submitError}
              </div>
            )}

            <div className="flex justify-end">
                <button
                type="submit"
                className={`px-8 py-3 rounded-full font-bold text-sm transition-all transform active:scale-95 ${
                    isSaved 
                    ? 'bg-slate-100 text-slate-400 hover:bg-slate-200' 
                    : 'bg-gradient-to-r from-rose-500 to-orange-600 text-white hover:shadow-lg hover:shadow-rose-500/30'
                }`}
                >
                {isSaved ? 'Update Choices' : 'Submit Picks'}
                </button>
            </div>
          </form>
        </section>

        {/* Matches Section */}
        {isSaved && (
          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              Your Matches 
              <span className="text-xs font-bold bg-rose-100 text-rose-600 px-2.5 py-0.5 rounded-full border border-rose-200">
                {matches.length}
              </span>
            </h3>

            {matches.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
                <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-slate-900 font-bold text-lg">No matches yet</h4>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                  Matches only appear when the feeling is mutual. We'll let you know when someone picks you back!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {matches.map((matchRoll) => (
                  <div key={matchRoll} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-lg hover:border-rose-100 group">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-200 text-white font-bold text-xl transform group-hover:scale-105 transition-transform">
                        {matchRoll.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-2xl">{matchRoll}</h4>
                        <p className="text-sm text-rose-500 font-bold flex items-center gap-1.5 mt-1">
                          <Heart className="w-4 h-4 fill-current" />
                          It's a Match!
                        </p>
                      </div>
                    </div>

                    {/* Gemini Action */}
                    <div className="md:text-right w-full md:w-auto">
                        {!icebreakers[matchRoll] ? (
                            <button 
                                onClick={() => handleGenerateIcebreaker(matchRoll)}
                                disabled={loadingIcebreaker === matchRoll}
                                className="w-full md:w-auto text-sm px-6 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:from-indigo-100 hover:to-purple-100 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group border border-indigo-100"
                            >
                                {loadingIcebreaker === matchRoll ? (
                                    <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform text-indigo-500" />
                                )}
                                Break the Ice
                            </button>
                        ) : (
                            <div className="mt-2 md:mt-0 p-4 bg-slate-50 rounded-xl border border-slate-100 max-w-md ml-auto relative">
                                <div className="absolute -top-2 -left-2 bg-white rounded-full p-1 shadow-sm border border-slate-100">
                                    <Sparkles className="w-3 h-3 text-indigo-500 fill-current" />
                                </div>
                                <p className="text-slate-700 font-medium italic">
                                    "{icebreakers[matchRoll]}"
                                </p>
                            </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default App;