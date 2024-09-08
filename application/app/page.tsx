'use client'

import { useState, useEffect, useRef } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Items from '@/app/libs/components/Items';
import { useAccount } from 'wagmi';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const connection = useAccount()
  const handleClickOutside = (event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="flex justify-between items-center p-4 bg-white shadow-md border-b border-gray-200">
        <div className="logo-container">
          <div className="icon"></div>
          <div className="logo-text">UnboundSign</div>
        </div>
        <button
          className="lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div className="hidden lg:block text-gray-800">
          <ConnectButton />
        </div>
      </header>

      {isMenuOpen && (
        <aside
          ref={sidebarRef}
          className="fixed top-0 left-0 w-full bg-white shadow-lg p-4 space-y-4 transform transition-transform duration-300 ease-out z-40 border-b border-gray-200"
          style={{ transform: isMenuOpen ? 'translateY(0)' : 'translateY(-100%)' }}
        >
          <div
            className={`font-bold text-gray-800 border-b pb-2 px-4 py-2 rounded-lg cursor-pointer ${selectedMenu === 'shops' ? 'bg-blue-100 text-blue-800 border border-blue-300' : ''}`}
            onClick={() => setSelectedMenu('shops')}
          >
            Shops
          </div>
          <div
            className={`font-bold text-gray-800 border-b pb-2 mt-2 px-4 py-2 rounded-lg cursor-pointer ${selectedMenu === 'ownedItems' ? 'bg-blue-100 text-blue-800 border border-blue-300' : ''}`}
            onClick={() => setSelectedMenu('ownedItems')}
          >
            Owned Items
          </div>
        </aside>
      )}

      <div className="flex flex-1">
        <aside className="hidden lg:block bg-white shadow-lg p-4 w-64 space-y-4 border-r border-gray-200">
          <div
            className={`font-bold text-gray-800 border-b pb-2 px-4 py-2 rounded-lg cursor-pointer ${selectedMenu === 'shops' ? 'bg-blue-100 text-blue-800 border border-blue-300' : ''}`}
            onClick={() => setSelectedMenu('shops')}
          >
            Shops
          </div>
          <div
            className={`font-bold text-gray-800 border-b pb-2 mt-2 px-4 py-2 rounded-lg cursor-pointer ${selectedMenu === 'ownedItems' ? 'bg-blue-100 text-blue-800 border border-blue-300' : ''}`}
            onClick={() => setSelectedMenu('ownedItems')}
          >
            Owned Items
          </div>
        </aside>

        {(connection.isConnected && connection.chainId) ?
          <Items initialChainId={connection.chainId.toString()} selectedMenu={selectedMenu} />
        : <div className="flex flex-1 justify-center items-center">Connect your wallet to view items</div>}  
      </div>
    </div>
  );
}