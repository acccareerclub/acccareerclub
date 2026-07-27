// app/components/layout/DashboardMenu.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaHome,
  FaUsers,
  FaBullhorn,
  FaBriefcase,
  FaBuilding,
  FaEnvelope,
  FaCog,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';

const DashboardMenu = () => {
  const pathname = usePathname();
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FaHome,
      href: '/dashboard',
    },
    {
      id: 'users',
      label: 'Users',
      icon: FaUsers,
      href: '/dashboard/users',
    },
    {
      id: 'notice',
      label: 'Notice',
      icon: FaBullhorn,
      href: '/dashboard/notice',
    },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: FaBriefcase,
      href: '/dashboard/jobs',
    },
    {
      id: 'companies',
      label: 'Companies',
      icon: FaBuilding,
      href: '/dashboard/companies',
    },
    {
      id: 'newsletter',
      label: 'Newsletter',
      icon: FaEnvelope,
      href: '/dashboard/newsletter',
    },
    {
      id: 'settings',
      label: 'App Settings',
      icon: FaCog,
      href: '/dashboard/settings',
    },
  ];

  // Check if a path is active
  const isActive = (href) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  // Handle scroll
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      checkScroll();
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      const newScrollLeft = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-r-lg shadow-lg transition-all duration-200 hover:shadow-xl border-r border-gray-200"
          aria-label="Scroll left"
        >
          <FaChevronLeft className="text-[#994D35] text-sm" />
        </button>
      )}

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-l-lg shadow-lg transition-all duration-200 hover:shadow-xl border-l border-gray-200"
          aria-label="Scroll right"
        >
          <FaChevronRight className="text-[#994D35] text-sm" />
        </button>
      )}

      {/* Scrollable Menu */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide py-3 px-4 gap-1 scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                flex items-center gap-2 px-2 md:px-4 py-1.25 md:py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
                ${active
                  ? 'bg-[#994D35] text-white shadow-md'
                  : 'text-[#3D444C] hover:bg-[#E7E3D8] hover:text-[#994D35]'
                }
              `}
            >
              <Icon className={`text-base ${active ? 'text-white' : 'text-[#994D35]'}`} />
              <span>{item.label}</span>
              {active && (
                <span className="w-1.5 h-1.5 bg-white rounded-full ml-1"></span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default DashboardMenu;