import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShoppingBag, 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  Sparkles, 
  ChevronRight, 
  User, 
  LogOut, 
  ShoppingBag as CartIcon,
  Briefcase,
  History,
  X
} from 'lucide-react';

interface NavbarProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onNavigate: (route: string) => void;
  activeRoute: string;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onSearchChange, 
  searchQuery, 
  onNavigate, 
  activeRoute 
}) => {
  const { 
    user, 
    cart, 
    darkMode, 
    toggleDarkMode, 
    logout, 
    notifications, 
    clearNotifications 
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Calculate distinct items in shopping bag
  const totalCartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      {/* Sleek Subheader Top Row */}
      <div className="hidden sm:block border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between text-[11px] text-slate-450 dark:text-slate-400 uppercase tracking-widest">
          <div className="flex gap-6 font-semibold">
            <span className="hover:text-orange-500 cursor-pointer transition-colors">Become a Seller</span>
            <span className="hover:text-orange-500 cursor-pointer transition-colors">Help & Support</span>
            <span className="hover:text-orange-500 cursor-pointer transition-colors">Daraz Affiliate Program</span>
          </div>
          <div className="flex gap-6 items-center">
            <span className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-350">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 
              SSLCommerz Secured Settlement
            </span>
            <span className="font-semibold text-slate-500">Save More on App</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
          >
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/15">
              <svg className="w-5.5 h-5.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
            <span className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white">
              DARAZ<span className="text-orange-500 font-bold">.BD</span>
            </span>
          </div>

          {/* Search box - strictly styled per Sleek design */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4 relative h-11 items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (activeRoute !== 'home') onNavigate('home');
              }}
              placeholder="Search in Daraz..."
              className="w-full h-11 bg-slate-100 dark:bg-slate-900 border-none rounded-l-lg pl-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/35 transition-all dark:text-white"
            />
            <button 
              type="button"
              className="absolute right-0 top-0 h-11 w-12 bg-orange-500 rounded-r-lg flex items-center justify-center text-white hover:bg-orange-600 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {/* Dark Mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Tracker status */}
            <button
              onClick={() => onNavigate('history')}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full transition-colors relative"
              title="Track Orders"
            >
              <History size={20} />
            </button>

            {/* Notification system with bell badge counts */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full transition-colors relative"
                title="Notifications panel"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full animate-ping" />
                )}
              </button>

              {/* Notification Drawer Popover */}
              {notifOpen && (
                <div className="absolute right-0 mt-3.5 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden z-50">
                  <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">System Live Status Tracking</span>
                    <button 
                      onClick={() => clearNotifications()}
                      className="text-[10px] text-blue-500 hover:underline hover:text-blue-600"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                        No activity tracking logs yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="p-3 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <div className="flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <div>
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                                {notif.title}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                {notif.desc}
                              </p>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block">
                                {notif.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Box bag toggle */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2 rounded-full cursor-pointer group bg-slate-100 hover:bg-orange-50 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors w-10 h-10 flex items-center justify-center shrink-0"
              title="Shopping Cart"
            >
              <svg className="w-5 h-5 text-slate-600 group-hover:text-orange-500 dark:text-slate-300" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-950 shadow-sm animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Profile Menu Toggle */}
            <div className="relative shrink-0">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 cursor-pointer group hover:opacity-90 text-left transition-opacity"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center group-hover:bg-orange-50 dark:group-hover:bg-slate-800 transition-colors">
                  <svg className="w-5 h-5 text-slate-600 group-hover:text-orange-500 dark:text-slate-300" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div className="hidden lg:flex flex-col">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest leading-none">
                    {user ? `Hi, ${user.name.split(' ')[0]}` : 'Hello, Guest'}
                  </span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1 leading-none">
                    {user ? 'My Profile' : 'Login / Sign Up'}
                  </span>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3.5 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden z-50">
                  {user ? (
                    <div className="p-3.5">
                      <div className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                        {user.isAdmin && (
                          <span className="inline-block px-1.5 py-0.5 mt-1.5 text-[9px] font-extrabold uppercase bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 rounded">
                            Market Coach Admin
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {user.isAdmin && (
                          <button
                            onClick={() => {
                              onNavigate('admin');
                              setProfileOpen(false);
                            }}
                            className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left text-xs text-slate-700 dark:text-slate-300 transition-colors"
                          >
                            <Briefcase size={14} className="text-slate-400" />
                            Admin Console
                          </button>
                        )}
                        <button
                          onClick={() => {
                            onNavigate('history');
                            setProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left text-xs text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <History size={14} className="text-slate-400" />
                          Order History
                        </button>
                        <button
                          onClick={() => {
                            logout();
                            setProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-2 p-2 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 rounded-lg text-left text-xs text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <LogOut size={14} className="text-slate-400 hover:text-rose-500" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 flex flex-col gap-2">
                      <p className="text-xs text-slate-400 text-center mb-1">Access secure marketplace checkout and tracking features</p>
                      <button
                        onClick={() => {
                          onNavigate('auth');
                          setProfileOpen(false);
                        }}
                        className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-xl shadow-sm transition-all text-center"
                      >
                        Sign In / Register
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Small screen Search Bar */}
        <div className="mt-3.5 md:hidden relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (activeRoute !== 'home') onNavigate('home');
            }}
            placeholder="Search in Daraz..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 rounded-xl text-xs transition-colors dark:text-white"
          />
        </div>
      </div>
    </header>
  );
};
