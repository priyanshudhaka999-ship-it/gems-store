import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, Menu, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Navbar() {
  const { settings, wishlist } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const isBridalActive =
    location.pathname === '/collections' &&
    new URLSearchParams(location.search).get('category') === 'Bridal Jewellery';

  const navItemClass = (active) =>
    `relative py-2 text-sm font-medium transition-colors duration-200 ${
      active
        ? 'text-[#FBF7F0] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-[#C89B5C]'
        : 'text-[#E6DBC9] hover:text-[#FBF7F0]'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-[#2E1F18] text-[#FAF8F4] border-b border-[#C89B5C]/30 shadow-sm">
      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3.5 group focus:outline-none">
          <div className="w-10 h-10 rounded-full border border-[#C89B5C] bg-[#3C2B20] flex items-center justify-center font-serif text-xl font-semibold text-[#FBF7F0] group-hover:border-[#D8B982] transition-colors">
            J
          </div>
          <div className="min-w-0">
            <span className="font-serif text-lg sm:text-[26px] tracking-[0.04em] sm:tracking-[0.12em] font-semibold text-[#FAF8F4] block leading-none">
              Jwellery
            </span>
            <span className="hidden sm:block text-[11px] tracking-[0.06em] text-[#D8B982] mt-1 font-normal">
              {settings?.tagline || 'Timeless Indian Jewellery'}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-8">
          <NavLink to="/" end className={({ isActive }) => navItemClass(isActive)}>
            Home
          </NavLink>
          <NavLink
            to="/collections"
            className={({ isActive }) => navItemClass(isActive && !isBridalActive)}
          >
            Collections
          </NavLink>
          <Link
            to="/collections?category=Bridal+Jewellery"
            className={navItemClass(isBridalActive)}
          >
            Bridal
          </Link>
          <NavLink to="/about" className={({ isActive }) => navItemClass(isActive)}>
            About &amp; Heritage
          </NavLink>
          <NavLink to="/faq" className={({ isActive }) => navItemClass(isActive)}>
            FAQ
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => navItemClass(isActive)}>
            Visit Store
          </NavLink>
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => navigate('/search')}
            aria-label="Search Jewellery Catalogue"
            className="p-2.5 rounded-full hover:bg-[#3C2B20] text-[#FAF8F4] transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          <Link
            to="/wishlist"
            aria-label={`View Saved Wishlist (${wishlist.length} items)`}
            className="relative p-2.5 rounded-full hover:bg-[#3C2B20] text-[#FAF8F4] transition-colors"
          >
            <Heart className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full bg-[#C89B5C] text-[#2E1F18] text-[11px] flex items-center justify-center font-semibold">
              {wishlist.length}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileOpen ? 'Close Mobile Menu' : 'Open Mobile Menu'}
            className="lg:hidden p-2 rounded-lg border border-[#C89B5C]/40 bg-[#3C2B20] text-[#FAF8F4] hover:border-[#C89B5C] transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <nav
          id="mobile-navigation-drawer"
          aria-label="Mobile Navigation"
          className="mobile-navigation-drawer fixed right-0 top-20 bottom-0 z-50 w-[min(20rem,85vw)] overflow-y-auto bg-[#2E1F18] border-l border-[#C89B5C]/25 px-4 pt-3 pb-6 space-y-1.5 text-sm font-medium shadow-xl lg:hidden"
        >
          <NavLink
            to="/"
            end
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `block px-3.5 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#3C2B20] text-[#FBF7F0] border-l-2 border-[#C89B5C]'
                  : 'text-[#E6DBC9] hover:bg-[#3C2B20]/70 hover:text-[#FAF8F4]'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/collections"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `block px-3.5 py-2.5 rounded-lg transition-colors ${
                isActive && !isBridalActive
                  ? 'bg-[#3C2B20] text-[#FBF7F0] border-l-2 border-[#C89B5C]'
                  : 'text-[#E6DBC9] hover:bg-[#3C2B20]/70 hover:text-[#FAF8F4]'
              }`
            }
          >
            Collections
          </NavLink>
          <Link
            to="/collections?category=Bridal+Jewellery"
            onClick={() => setMobileOpen(false)}
            className={`block px-3.5 py-2.5 rounded-lg transition-colors ${
              isBridalActive
                ? 'bg-[#3C2B20] text-[#FBF7F0] border-l-2 border-[#C89B5C]'
                : 'text-[#E6DBC9] hover:bg-[#3C2B20]/70 hover:text-[#FAF8F4]'
            }`}
          >
            Bridal Jewellery
          </Link>
          <NavLink
            to="/about"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `block px-3.5 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#3C2B20] text-[#FBF7F0] border-l-2 border-[#C89B5C]'
                  : 'text-[#E6DBC9] hover:bg-[#3C2B20]/70 hover:text-[#FAF8F4]'
              }`
            }
          >
            About &amp; Heritage
          </NavLink>
          <NavLink
            to="/faq"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `block px-3.5 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#3C2B20] text-[#FBF7F0] border-l-2 border-[#C89B5C]'
                  : 'text-[#E6DBC9] hover:bg-[#3C2B20]/70 hover:text-[#FAF8F4]'
              }`
            }
          >
            FAQ
          </NavLink>
          <NavLink
            to="/contact"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `block px-3.5 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#3C2B20] text-[#FBF7F0] border-l-2 border-[#C89B5C]'
                  : 'text-[#E6DBC9] hover:bg-[#3C2B20]/70 hover:text-[#FAF8F4]'
              }`
            }
          >
            Visit Store
          </NavLink>
          <div className="pt-2 mt-2 border-t border-[#C89B5C]/20 grid grid-cols-2 gap-2">
            <Link
              to="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="px-3.5 py-2.5 rounded-lg bg-[#3C2B20] text-[#FAF8F4] text-center text-xs font-medium hover:bg-[#4a3628] transition-colors"
            >
              Wishlist ({wishlist.length})
            </Link>
            <Link
              to="/search"
              onClick={() => setMobileOpen(false)}
              className="px-3.5 py-2.5 rounded-lg bg-[#3C2B20] text-[#FAF8F4] text-center text-xs font-medium hover:bg-[#4a3628] transition-colors"
            >
              Search Catalogue
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
