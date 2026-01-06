import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col pt-20 md:pt-24">
            <Navbar />
            <main className="flex-1 w-full relative z-0">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
