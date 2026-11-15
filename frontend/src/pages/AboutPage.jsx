import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { updatePageMeta } from '../utils/seo';

export default function AboutPage() {
  const { settings } = useStore();
  const revealRef = useRef(null);

  useEffect(() => {
    updatePageMeta({
      title: 'Our Heritage, Craftsmanship & Quality Philosophy | AARANYA',
      description:
        'Learn about AARANYA’s Indian goldsmithing heritage, Bikaneri Kundan karigari, and BIS 916 hallmark quality standards.',
    });
  }, []);

  useLayoutEffect(() => {
    const page = revealRef.current;
    if (
      !page ||
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    page.dataset.contentRevealReady = 'true';
    const targets = page.querySelectorAll(
      '[data-content-reveal]:not([data-content-reveal-visible="true"])'
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.dataset.contentRevealVisible = 'true';
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  const about = settings?.aboutUsContent || {};

  return (
    <div ref={revealRef} className="space-y-16 pb-8">
      {/* Editorial Introduction */}
      <section className="bg-[#F2E9DC] border-b border-[#E6DBC9] py-14 sm:py-20">
        <div
          data-content-reveal="left"
          className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5"
        >
          <p className="text-xs text-[#8C6239] font-medium">
            Our Story &amp; Philosophy
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#34241D] leading-tight">
            {about.storyHeading ||
              'Rooted in Royal Karigari, Crafted for Modern Heirloom Keepers'}
          </h1>
          {about.storyBody && (
            <p className="text-base sm:text-lg text-[#695B4E] leading-relaxed max-w-3xl mx-auto">
              {about.storyBody}
            </p>
          )}
        </div>
      </section>

      {/* Heritage & Craftsmanship — Editorial Two-Column Narrative */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {about.heritageText && (
            <div
              data-content-reveal="left"
              className="lg:col-span-6 space-y-3 border-l-2 border-[#B88A4A] pl-6 py-1"
            >
              <span className="text-xs font-medium text-[#8C6239]">
                01 • Jewellery Heritage
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#34241D]">
                Preserving Classical Indian Lineages
              </h2>
              <p className="text-sm sm:text-base text-[#695B4E] leading-relaxed">
                {about.heritageText}
              </p>
            </div>
          )}

          {about.craftsmanshipText && (
            <div
              data-content-reveal="right"
              className="lg:col-span-6 bg-[#FBF7F0] border border-[#E6DBC9] rounded-2xl p-7 sm:p-8 space-y-3"
            >
              <span className="text-xs font-medium text-[#8C6239]">
                02 • Karigar Craftsmanship
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#34241D]">
                Hand-Forged Masterworks
              </h2>
              <p className="text-sm sm:text-base text-[#695B4E] leading-relaxed">
                {about.craftsmanshipText}
              </p>
            </div>
          )}
        </div>

        {/* Contrasting Deep Espresso Panel for Quality Philosophy */}
        {about.qualityPhilosophy && (
          <div
            data-content-reveal="left"
            className="rounded-2xl bg-[#2E1F18] text-[#FAF8F4] p-8 sm:p-12 border border-[#C89B5C]/30"
          >
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-medium text-[#D8B982]">
                03 • Quality Philosophy
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#FAF8F4]">
                Verified Purity &amp; Weight
              </h2>
              <p className="text-sm sm:text-base text-[#E6DBC9] leading-relaxed">
                {about.qualityPhilosophy}
              </p>
            </div>
          </div>
        )}

        {/* Showroom Consultation CTA */}
        <div className="bg-[#F2E9DC] border border-[#D8B982] rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div data-content-reveal="left" className="space-y-2 max-w-xl">
            <p className="text-xs text-[#8C6239] font-medium">
              Private Showroom Consultations
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#34241D]">
              Experience Our Bridal &amp; Heritage Archives in Person
            </h3>
            <p className="text-sm text-[#695B4E] leading-relaxed">
              Book an unhurried showroom appointment with our jewellery specialists.
            </p>
          </div>
          <div
            data-content-reveal="right"
            className="flex flex-wrap items-center gap-3 shrink-0"
          >
            <Link
              to="/contact"
              className="px-6 py-3.5 rounded-xl bg-[#34241D] hover:bg-[#2E1F18] text-[#FAF8F4] text-xs font-medium inline-flex items-center gap-2 transition-colors"
            >
              <MapPin className="w-4 h-4 text-[#D8B982]" />
              <span>Schedule a Showroom Visit</span>
            </Link>
            <Link
              to="/collections"
              className="px-5 py-3.5 rounded-xl border border-[#C89B5C] bg-[#FAF8F4] hover:bg-[#FBF7F0] text-[#34241D] text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Browse Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
