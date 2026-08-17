import React from 'react';
import { ShoppingBag, Box, Cpu, Zap, CreditCard, Check } from 'lucide-react';
import { shopItems } from '../data/curriculumData';

interface ShopViewProps {
  onBuyItem: (itemId: string, itemName: string) => void;
  purchasedItems: string[];
}

export const ShopView: React.FC<ShopViewProps> = ({ onBuyItem, purchasedItems }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'box':
        return Box;
      case 'cpu':
        return Cpu;
      default:
        return Zap;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8 pb-24 space-y-8" id="shop-view-container">
      {/* Shop Header Banner */}
      <div className="bg-gradient-to-r from-amber-600/25 to-orange-600/15 border border-amber-500/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-xl">
        <div className="space-y-2 relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-orange-400" />
            <span>Hardware Shop</span>
          </h2>
          <p className="text-sm text-slate-300 max-w-md">
            Acquista componenti fisici ufficiali per portare i tuoi progetti simulati nel mondo reale con Raspberry Pi.
          </p>
        </div>

        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Grid of items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="shop-items-grid">
        {shopItems.map((item) => {
          const Icon = getIcon(item.icon);
          const isPurchased = purchasedItems.includes(item.id);

          return (
            <div
              key={item.id}
              className="bg-[#0a1122] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-5 transition-all hover:border-slate-700 hover:scale-[1.01] shadow-lg"
              id={`shop-item-${item.id}`}
            >
              <div className="space-y-3.5">
                {/* Visual Circle Icon */}
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-orange-400">
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-extrabold text-sm text-white">{item.name}</h3>
                    <span className="text-sm font-black text-orange-400 font-mono shrink-0">{item.price}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>Consegna 48h</span>
                  <span className="text-amber-500/80">{item.count}</span>
                </div>

                <button
                  onClick={() => onBuyItem(item.id, item.name)}
                  disabled={isPurchased}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 ${
                    isPurchased
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg active:scale-95'
                  }`}
                  id={`btn-buy-${item.id}`}
                >
                  {isPurchased ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>In Possesso</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Acquista</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
