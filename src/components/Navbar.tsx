import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CloudSun, Menu, X, Home, Satellite, BrainCircuit, Zap } from 'lucide-react';

const Navbar: React.FC = () => {
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { path: '/', label: 'หน้าหลัก', icon: <Home size={18} /> },
        { path: '/satellite', label: 'ภาพดาวเทียม', icon: <Satellite size={18} /> },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/5 ${scrolled || mobileMenuOpen
                    ? 'bg-slate-900/80 backdrop-blur-xl py-3 shadow-lg shadow-purple-900/10'
                    : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
                {/* Logo Area */}
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-purple-500/20">
                        <CloudSun className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-white text-lg tracking-tight leading-none">Weather Project App</h1>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 relative group overflow-hidden ${isActive
                                        ? 'text-white shadow-lg shadow-blue-900/40'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-100 rounded-xl -z-10 animate-in fade-in duration-300" />
                                )}
                                <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>
                                <span className="font-medium text-sm">{item.label}</span>
                            </NavLink>
                        );
                    })}
                </div>

                {/* Right Side Status */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span>SYSTEM ONLINE</span>
                    </div>

                    <button
                        className="md:hidden p-2 text-white/80 hover:bg-white/10 rounded-xl transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 p-4 animate-in slide-in-from-top-5 duration-200">
                    <div className="flex flex-col gap-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center gap-4 p-4 rounded-xl transition-all ${isActive
                                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                                        : 'text-slate-400 hover:bg-white/5'
                                    }
                                `}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
