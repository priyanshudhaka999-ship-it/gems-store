import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const { settings } = useStore();

  const socialLinks = [
    settings?.socialLinks?.instagram
      ? { label: 'Instagram', href: settings.socialLinks.instagram }
      : null,
    settings?.socialLinks?.facebook
      ? { label: 'Facebook', href: settings.socialLinks.facebook }
      : null,
    settings?.socialLinks?.youtube
      ? { label: 'YouTube', href: settings.socialLinks.youtube }
      : null,
  ].filter(Boolean);

  return (
    <footer className="bg-[#F2E9DC] border-t border-[#E6DBC9] text-[#34241D] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Summary */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-[#B88A4A] bg-[#FAF8F4] flex items-center justify-center font-serif text-lg font-semibold text-[#34241D]">
                N
              </div>
              <span className="font-serif text-2xl tracking-[0.08em] font-semibold text-[#34241D]">
                New Nanda Jwellers
              </span>
            </Link>
            <p className="text-sm text-[#695B4E] leading-relaxed max-w-sm">
              Handcrafted BIS 916 hallmarked 22K gold, Bikaneri Kundan, uncut Polki, and temple jewellery.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-medium text-[#8C6239]">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#34241D] underline underline-offset-4 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Explore & Help Links */}
          <div className="md:col-span-4 grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-serif text-lg font-semibold mb-3 text-[#34241D]">
                Explore
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-[#695B4E]">
                <li>
                  <Link to="/collections" className="hover:text-[#34241D] transition-colors">
                    All Collections
                  </Link>
                </li>
                <li>
                  <Link
                    to="/collections?category=Bridal+Jewellery"
                    className="hover:text-[#34241D] transition-colors"
                  >
                    Bridal Jewellery
                  </Link>
                </li>
                <li>
                  <Link
                    to="/collections?category=Kundan+Jewellery"
                    className="hover:text-[#34241D] transition-colors"
                  >
                    Kundan &amp; Polki
                  </Link>
                </li>
                <li>
                  <Link
                    to="/collections?category=Temple+Jewellery"
                    className="hover:text-[#34241D] transition-colors"
                  >
                    Temple Jewellery
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-[#34241D] transition-colors">
                    About &amp; Heritage
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold mb-3 text-[#34241D]">
                Help &amp; Policies
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-[#695B4E]">
                <li>
                  <Link to="/faq" className="hover:text-[#34241D] transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-[#34241D] transition-colors">
                    Visit Showroom
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="hover:text-[#34241D] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms-and-conditions"
                    className="hover:text-[#34241D] transition-colors"
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/return-and-exchange-policy"
                    className="hover:text-[#34241D] transition-colors"
                  >
                    Return &amp; Exchange
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pricing-disclaimer"
                    className="hover:text-[#34241D] transition-colors"
                  >
                    Pricing Disclaimer
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="md:col-span-4 space-y-2 text-xs sm:text-sm text-[#695B4E]">
            <h3 className="font-serif text-lg font-semibold mb-3 text-[#34241D]">
              Contact &amp; Showroom
            </h3>
            {settings?.storeAddress && (
              <p className="leading-relaxed">{settings.storeAddress}</p>
            )}
            {settings?.phoneNumber && (
              <p>
                <strong className="font-medium text-[#34241D]">Phone:</strong>{' '}
                {settings.phoneNumber}
              </p>
            )}
            {settings?.whatsappNumber && (
              <p>
                <strong className="font-medium text-[#34241D]">WhatsApp:</strong> +
                {settings.whatsappNumber}
              </p>
            )}
            {settings?.email && (
              <p>
                <strong className="font-medium text-[#34241D]">Email:</strong>{' '}
                {settings.email}
              </p>
            )}
            {settings?.businessHours && (
              <p>
                <strong className="font-medium text-[#34241D]">Hours:</strong>{' '}
                {settings.businessHours}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Copyright & Required Pricing Disclaimer */}
        <div className="mt-10 pt-6 border-t border-[#E6DBC9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#695B4E]">
          <p>
            {settings?.footerContent?.copyrightText ||
              '© 2026 AARANYA Fine Indian Jewellery. All Rights Reserved.'}
          </p>
          <p className="max-w-xl sm:text-right leading-relaxed">
            {settings?.footerContent?.disclaimerNote ||
              'Catalogue prices are indicative in INR and subject to daily bullion rate adjustments and verified physical piece weight at our showroom.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
