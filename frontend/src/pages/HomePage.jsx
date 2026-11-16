import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Navigation } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { updatePageMeta } from '../utils/seo';
import { createSvgFallbackDataUri } from '../utils/fallbackData';

export default function HomePage() {
  const { products, categories, collections, testimonials, settings } = useStore();
  const homepageRef = useRef(null);

  useEffect(() => {
    updatePageMeta({
      title: 'AARANYA | Indian Jewellery — 22K Gold, Kundan, Polki & Bridal Showroom',
      description:
        'Explore AARANYA Timeless Indian Jewellery. BIS 916 Hallmarked 22K gold, Bikaneri Kundan, uncut Polki, diamond solitaires, and temple jewellery with direct WhatsApp concierge.',
    });
  }, []);

  useLayoutEffect(() => {
    const homepage = homepageRef.current;
    if (
      !homepage ||
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    const sections = Array.from(homepage.children).filter(
      (child) => child.tagName.toLowerCase() === 'section'
    );
    if (!sections.length) return undefined;
    const categoryCards = homepage.querySelectorAll('[data-category-card]');

    homepage.dataset.scrollRevealReady = 'true';
    sections.forEach((section, index) => {
      section.dataset.scrollReveal = index % 2 === 0 ? 'left' : 'right';
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target.hasAttribute('data-category-card')) {
            entry.target.dataset.categoryVisible = 'true';
          } else {
            entry.target.dataset.scrollVisible = 'true';
          }
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -48px 0px' }
    );

    sections.forEach((section) => observer.observe(section));
    categoryCards.forEach((card) => observer.observe(card));

    return () => {
      observer.disconnect();
      delete homepage.dataset.scrollRevealReady;
      sections.forEach((section) => {
        delete section.dataset.scrollReveal;
        delete section.dataset.scrollVisible;
      });
      categoryCards.forEach((card) => {
        delete card.dataset.categoryVisible;
      });
    };
  }, []);

  useLayoutEffect(() => {
    const homepage = homepageRef.current;
    if (
      !homepage ||
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    const productCards = homepage.querySelectorAll(
      '[data-home-product-card]:not([data-home-product-visible="true"])'
    );
    if (!productCards.length) return undefined;

    homepage.dataset.productRevealReady = 'true';
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.dataset.homeProductVisible = 'true';
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );

    productCards.forEach((card) => observer.observe(card));
    return () => {
      observer.disconnect();
      delete homepage.dataset.productRevealReady;
    };
  }, [products]);

  const activeProducts = products.filter((p) => p.isActive !== false);
  const newArrivals = activeProducts.filter((p) => p.isNewArrival).slice(0, 4);
  const bestsellers = activeProducts.filter((p) => p.isBestseller).slice(0, 4);
  const aboutContent = settings?.aboutUsContent || {};

  return (
    <div ref={homepageRef} className="home-page space-y-16">
      {/* HERO BANNER WITH ABOVE-THE-FOLD CTAs */}
      <section className="bg-[#F2E9DC] border-b border-[#E6DBC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F4] border border-[#C89B5C] text-xs font-medium text-[#34241D]">
                <span className="w-2 h-2 rounded-full bg-[#B88A4A]" />
                <span>BIS 916 Hallmarked • Heritage Karigari</span>
              </div>

              <h1 className="hero-entrance hero-entrance--heading font-serif text-4xl sm:text-6xl lg:text-[64px] font-semibold text-[#34241D] leading-[1.08]">
                Timeless Indian Jewellery
              </h1>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/collections"
                  className="hero-entrance hero-entrance--cta-one px-7 py-3.5 rounded-xl bg-[#34241D] hover:bg-[#2E1F18] text-[#FAF8F4] text-sm font-medium inline-flex items-center gap-2 transition-colors shadow-sm"
                >
                  <span>Explore Collections</span>
                  <ArrowRight className="w-4 h-4 text-[#D8B982]" />
                </Link>
                <Link
                  to="/collections?category=Bridal+Jewellery"
                  className="hero-entrance hero-entrance--cta-two px-6 py-3.5 rounded-xl border border-[#B88A4A] bg-[#FAF8F4] hover:bg-[#FBF7F0] text-[#34241D] text-sm font-medium transition-colors"
                >
                  Discover Bridal Trousseau
                </Link>
                <Link
                  to="/contact"
                  className="hero-entrance hero-entrance--cta-three px-6 py-3.5 rounded-xl border border-[#E6DBC9] bg-[#FBF7F0] hover:border-[#B88A4A] text-sm font-medium text-[#34241D] inline-flex items-center gap-2 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-[#B88A4A]" />
                  <span>Visit Our Store</span>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E6DBC9] max-w-xl">
                <div>
                  <p className="font-serif text-2xl font-semibold text-[#34241D]">BIS 916</p>
                  <p className="text-xs text-[#695B4E]">HUID Hallmarked Gold</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-semibold text-[#34241D]">24K Foil</p>
                  <p className="text-xs text-[#695B4E]">Authentic Jadau Kundan</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-semibold text-[#34241D]">Direct</p>
                  <p className="text-xs text-[#695B4E]">WhatsApp &amp; Store Viewing</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-[#D8B982] bg-[#FBF7F0] shadow-lg aspect-[4/5]">
                <img
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/British_Museum_The_Islamic_world_Necklace_Kundan_India_21022019_7703.jpg?width=1200"
                  alt="Royal Kundan necklace with pearls, rubies, diamonds and emerald"
                  width="900"
                  height="1125"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = createSvgFallbackDataUri(
                      'Timeless Indian Jewellery',
                      'AARANYA Bridal Kundan Showcase',
                      'HERO-01'
                    );
                  }}
                  className="hero-entrance hero-entrance--image w-full h-full object-cover"
                />
                <div className="absolute bottom-4 inset-x-4 bg-[#FAF8F4]/95 backdrop-blur border border-[#E6DBC9] rounded-xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#8C6239] font-medium">
                      Featured Archive Piece
                    </p>
                    <p className="font-serif text-lg font-semibold text-[#34241D]">
                      Maharani Bikaneri Kundan Choker
                    </p>
                  </div>
                  <Link
                    to="/product/maharani-bikaneri-jadau-kundan-emerald-choker"
                    className="px-3.5 py-2 rounded-lg bg-[#34241D] hover:bg-[#2E1F18] text-[#FAF8F4] text-xs font-medium shrink-0 transition-colors"
                  >
                    View Piece
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs text-[#8C6239] font-medium mb-1">
              Fresh from the Karigar Karkhana
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#34241D]">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/collections"
            className="px-4 py-2 rounded-lg border border-[#C89B5C] bg-[#FBF7F0] text-xs font-medium text-[#34241D] hover:bg-[#F2E9DC] transition-colors w-fit"
          >
            Browse Full Catalogue
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              mobileRevealDirection={index % 2 === 0 ? 'left' : 'right'}
            />
          ))}
        </div>
      </section>

      {/* FEATURED COLLECTIONS */}
      <section className="bg-[#F2E9DC]/70 border-y border-[#E6DBC9] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <div className="max-w-2xl mb-10">
              <p className="text-xs text-[#8C6239] font-medium mb-1">Signature Archives</p>
              <h2 className="font-sans text-3xl sm:text-4xl font-semibold text-[#34241D]">
                Featured Collections
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {collections.map((col) => (
                <div
                  key={col._id || col.slug}
                  className="bg-[#FAF8F4] border border-[#E6DBC9] rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  <div className="aspect-[16/10] bg-[#F2E9DC] overflow-hidden">
                    <img
                      src={col.bannerImage?.url}
                      alt={col.bannerImage?.alt || col.name}
                      width="800"
                      height="500"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = createSvgFallbackDataUri(
                          col.name,
                          col.subtitle,
                          'COLLECTION'
                        );
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-[#8C6239] font-medium">{col.subtitle}</p>
                      <h3 className="font-sans text-2xl font-semibold text-[#34241D] mt-1">
                        {col.name}
                      </h3>
                      <p className="text-xs text-[#695B4E] leading-relaxed mt-2">
                        {col.description}
                      </p>
                    </div>
                    <Link
                      to={`/collections?collection=${encodeURIComponent(col.name)}`}
                      className="w-full py-2.5 px-4 rounded-lg border border-[#C89B5C] bg-[#FBF7F0] hover:bg-[#34241D] hover:text-[#FAF8F4] hover:border-[#34241D] text-xs font-medium text-[#34241D] transition-colors text-center block mt-4"
                    >
                      Explore {col.name}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs text-[#8C6239] font-medium mb-1">
              Most Enquired Showroom Creations
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#34241D]">
              Bestsellers
            </h2>
          </div>
          <Link
            to="/collections"
            className="text-xs font-medium text-[#8C6239] hover:text-[#34241D]"
          >
            Explore All Pieces &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              mobileRevealDirection={
                (newArrivals.length + index) % 2 === 0 ? 'left' : 'right'
              }
            />
          ))}
        </div>
      </section>

      {/* SHOP BY CATEGORY (All 13 Categories) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs text-[#8C6239] font-medium mb-1">
              Curated Silversmith &amp; Goldsmith Lineages
            </p>
            <h2 className="font-sans text-3xl sm:text-4xl font-semibold text-[#34241D]">
              Shop by Jewellery Category
            </h2>
          </div>
          <Link
            to="/collections"
            className="text-xs font-medium text-[#8C6239] hover:text-[#34241D] inline-flex items-center gap-1.5"
          >
            <span>View All 13 Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {categories.map((cat, index) => (
            <Link
              key={cat._id || cat.slug}
              to={`/collections?category=${encodeURIComponent(cat.name)}`}
              data-category-card
              style={{
                '--category-card-delay': `${index * 45}ms`,
                '--category-card-delay-mobile': `${index * 25}ms`,
              }}
              className="bg-[#FBF7F0] border border-[#E6DBC9] hover:border-[#B88A4A] rounded-xl p-4 flex flex-col justify-between transition-colors group"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="w-7 h-7 rounded-full bg-[#FAF8F4] border border-[#E6DBC9] flex items-center justify-center font-serif text-sm font-semibold text-[#8C6239] group-hover:bg-[#34241D] group-hover:text-[#FAF8F4] transition-colors">
                  {cat.name.charAt(0)}
                </span>
                <span className="text-[11px] text-[#695B4E]">Explore &rarr;</span>
              </div>
              <div>
                <h3 className="font-sans text-lg font-medium text-[#34241D] group-hover:text-[#B88A4A] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-[#695B4E] line-clamp-1 mt-0.5">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BLOCK 2: CLIENT TESTIMONIALS (Separate Warm Champagne Section) */}
      {testimonials && testimonials.length > 0 && (
        <section className="bg-[#F2E9DC] border-y border-[#E6DBC9] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs text-[#8C6239] font-medium">Client Reflections</p>
              <h2 className="font-sans text-3xl sm:text-4xl font-semibold text-[#34241D]">
                Experiences from Our Showroom Guests
              </h2>
              <p className="text-sm text-[#695B4E] leading-relaxed">
                Notes shared by families and collectors who explored our catalogue and visited the AARANYA showroom.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => {
                const metaParts = [t.occasionPurchased, t.customerLocation].filter(Boolean);
                return (
                  <article
                    key={t._id || t.customerName}
                    className="bg-[#FAF8F4] border border-[#E6DBC9] rounded-xl p-6 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {t.rating && (
                        <div
                          aria-label={`${t.rating} out of 5 stars`}
                          className="text-[#8C6239] text-sm tracking-wider"
                        >
                          {'★'.repeat(Math.min(5, Math.max(1, Number(t.rating))))}
                        </div>
                      )}
                      {t.comment && (
                        <p className="text-sm text-[#2E1F18] leading-relaxed">
                          {t.comment}
                        </p>
                      )}
                    </div>
                    <div className="pt-3 border-t border-[#E6DBC9]">
                      {t.customerName && (
                        <p className="font-serif text-lg font-semibold text-[#2E1F18]">
                          {t.customerName}
                        </p>
                      )}
                      {metaParts.length > 0 && (
                        <p className="text-xs text-[#4A3A2D] mt-0.5">
                          {metaParts.join(' • ')}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* STORE LOCATION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="bg-[#FBF7F0] border border-[#E6DBC9] rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2.5 max-w-xl">
            <span className="text-xs text-[#8C6239] font-medium">
              Flagship Showroom
            </span>
            <h2 className="font-sans text-3xl font-semibold text-[#34241D]">
              Visit Our Physical Jewellery Showroom
            </h2>
            {settings?.storeAddress && (
              <p className="text-sm text-[#695B4E] leading-relaxed">
                {settings.storeAddress}
              </p>
            )}
            <p className="text-xs text-[#34241D]">
              {settings?.businessHours && (
                <>
                  <strong>Hours:</strong> {settings.businessHours}
                </>
              )}
              {settings?.businessHours && settings?.phoneNumber ? ' • ' : ''}
              {settings?.phoneNumber && (
                <>
                  <strong>Phone:</strong> {settings.phoneNumber}
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <a
              href={settings?.googleMapsLink || 'https://maps.google.com/?q=28.6506,77.2303'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-[#34241D] hover:bg-[#2E1F18] text-[#FAF8F4] text-xs font-medium inline-flex items-center gap-2 transition-colors"
            >
              <Navigation className="w-4 h-4 text-[#D8B982]" />
              <span>Get Directions</span>
            </a>
            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl border border-[#C89B5C] bg-[#FAF8F4] hover:bg-[#F2E9DC] text-[#34241D] text-xs font-medium transition-colors"
            >
              Contact Showroom
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
