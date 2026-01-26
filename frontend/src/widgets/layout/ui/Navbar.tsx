'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useLogout } from '@/entities/auth';
import { Logo, Button, IconPlus, IconMenu, IconX } from '@/shared/ui';
import { cn } from '@/shared/lib';

interface NavbarProps {
  showNewFormButton?: boolean;
}

export function Navbar({ showNewFormButton = true }: NavbarProps) {
  const pathname = usePathname();
  const { admin, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="md" href="/admin" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated && (
              <>
                <Link
                  href="/admin"
                  className={cn(
                    'text-body-sm font-medium transition-colors',
                    pathname === '/admin'
                      ? 'text-ecx-blue'
                      : 'text-gray-600 hover:text-ecx-blue'
                  )}
                >
                  Dashboard
                </Link>
                
                <div className="flex items-center gap-4">
                  {showNewFormButton && (
                    <Link href="/admin/forms/new">
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<IconPlus size={18} />}
                      >
                        New Form
                      </Button>
                    </Link>
                  )}
                  
                  {/* User Menu */}
                  <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="text-right">
                      <p className="text-body-sm font-medium text-ecx-gray">
                        {admin?.name || 'Admin'}
                      </p>
                      <p className="text-caption text-gray-500">
                        {admin?.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      isLoading={logoutMutation.isPending}
                    >
                      Sign out
                    </Button>
                  </div>
                </div>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-ecx-blue hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <IconX size={24} /> : <IconMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-4">
              {isAuthenticated && (
                <>
                  {/* User Info */}
                  <div className="pb-4 border-b border-gray-100">
                    <p className="text-body-sm font-medium text-ecx-gray">
                      {admin?.name || 'Admin'}
                    </p>
                    <p className="text-caption text-gray-500">
                      {admin?.email}
                    </p>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-2">
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'block px-4 py-3 rounded-lg text-body font-medium transition-colors',
                        pathname === '/admin'
                          ? 'bg-ecx-blue-50 text-ecx-blue'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      Dashboard
                    </Link>
                    
                    {showNewFormButton && (
                      <Link
                        href="/admin/forms/new"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block"
                      >
                        <Button
                          variant="primary"
                          fullWidth
                          leftIcon={<IconPlus size={18} />}
                        >
                          Create New Form
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* Sign Out */}
                  <div className="pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={handleLogout}
                      isLoading={logoutMutation.isPending}
                    >
                      Sign out
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

