import React from 'react';
import { Home, GraduationCap, ShoppingCart, User, Settings } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSettings: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, openSettings }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'lessons', label: 'Lessons', icon: GraduationCap },
    { id: 'shop', label: 'Shop', icon: ShoppingCart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:relative md:top-0 md:h-screen md:w-64 bg-[#0a1122] border-t md:border-t-0 md:border-r border-slate-800/80 px-4 py-2 md:py-6 flex md:flex-col justify-around md:justify-start gap-4 z-40 shadow-xl" id="app-nav">
      {/* Desktop Logo */}
      <div className="hidden md:flex items-center gap-3 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-orange-500/20">
          Py
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">PyCircuit</h1>
          <span className="text-[10px] text-orange-400 font-semibold uppercase tracking-wider">Advanced Simulator</span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex md:flex-col justify-around md:justify-start w-full gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 w-full text-sm font-medium ${
                isActive
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className="md:inline hidden">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop Settings Button */}
      <div className="hidden md:block mt-auto w-full">
        <button
          id="nav-settings-desktop"
          onClick={openSettings}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 w-full text-sm font-medium text-slate-400 hover:bg-slate-800/40 hover:text-white`}
        >
          <Settings className="w-5 h-5" />
          <span>Impostazioni</span>
        </button>
      </div>
    </nav>
  );
};
