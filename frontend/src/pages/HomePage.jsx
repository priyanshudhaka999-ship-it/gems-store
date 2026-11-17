import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, Navigation } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { updatePageMeta } from '../utils/seo';
import { createSvgFallbackDataUri } from '../utils/fallbackData';

function JewelleryCategoryIcon({ name }) {
  const category = name.toLowerCase();
  let iconType = 'gem';

  if (category.includes('ring')) iconType = 'ring';
  else if (
    category.includes('necklace') ||
    category.includes('haar') ||
    category.includes('mangalsutra')
  ) {
    iconType = 'necklace';
  } else if (category.includes('earring') || category.includes('jhumka')) {
    iconType = 'earrings';
  } else if (category.includes('bangle') || category.includes('kada')) {
    iconType = 'bangles';
  } else if (
    category.includes('bracelet') ||
    category.includes('armlet') ||
    category.includes('hathphool')
  ) {
    iconType = 'bracelet';
  } else if (category.includes('pendant') || category.includes('tikka')) {
    iconType = 'pendant';
  } else if (category.includes('nose') || category.includes('nath')) {
    iconType = 'nose';
  } else if (category.includes('temple')) {
    iconType = 'temple';
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-8 w-8"
    >
      {iconType === 'ring' && (
        <>
          <ellipse cx="12" cy="16" rx="7.5" ry="4.5" />
          <path d="m9.5 9.5 2.5-3 2.5 3-2.5 2.5-2.5-2.5Z" />
          <path d="M9.5 9.5h5" />
        </>
      )}
      {iconType === 'necklace' && (
        <>
          <path d="M4 5c.6 8 3.3 13 8 17 4.7-4 7.4-9 8-17" />
          <path d="M12 18v-3" />
          <path d="m9.5 12.5 2.5-2.5 2.5 2.5L12 15l-2.5-2.5Z" />
        </>
      )}
      {iconType === 'earrings' && (
        <>
          <path d="M7 5a2 2 0 1 0-2 2" />
          <path d="M17 5a2 2 0 1 1 2 2" />
          <path d="M5 7v4l2 3 2-3V7" />
          <path d="M15 7v4l2 3 2-3V7" />
          <path d="m7 14-1.5 2L7 18l1.5-2L7 14Zm10 0-1.5 2 1.5 2 1.5-2-1.5-2Z" />
        </>
      )}
      {iconType === 'bangles' && (
        <>
          <ellipse cx="12" cy="12" rx="5" ry="8" />
          <ellipse cx="12" cy="12" rx="8" ry="8" />
          <path d="M7 5.8a9.5 9.5 0 0 1 10 0M7 18.2a9.5 9.5 0 0 0 10 0" />
        </>
      )}
      {iconType === 'bracelet' && (
        <>
          <path d="M4 12a8 8 0 0 1 16 0" />
          <path d="M4 12a8 8 0 0 0 16 0" />
          <path d="M8 5.1 7 3.5m9.2 1.6 1-1.6M12 4V2.5" />
          <circle cx="12" cy="20" r="1.1" />
        </>
      )}
      {iconType === 'pendant' && (
        <>
          <path d="M5 4c1 5 3.3 8 7 10 3.7-2 6-5 7-10" />
          <path d="m12 13 4 4-4 5-4-5 4-4Z" />
          <path d="m8 17 8 0m-4-4v9" />
        </>
      )}
      {iconType === 'nose' && (
        <>
          <path d="M5 5c5 1 9 5 9 10a4 4 0 0 1-8 0" />
          <circle cx="7" cy="15" r="2.5" />
          <path d="m7 12.5 1.2-1.5 1.2 1.5" />
        </>
      )}
      {iconType === 'temple' && (
        <>
          <path d="M5 20V9l7-5 7 5v11" />
          <path d="M8 20v-6a4 4 0 0 1 8 0v6M3 20h18M12 4V2" />
          <path d="m10.5 10 1.5-1.5 1.5 1.5L12 12l-1.5-2Z" />
        </>
      )}
      {iconType === 'gem' && (
        <>
          <path d="m12 3 8 7-8 11-8-11 8-7Z" />
          <path d="M4 10h16M9 4.5 7.5 10 12 21l4.5-11L15 4.5" />
        </>
      )}
    </svg>
  );
}

export default function HomePage() {
  const { products, categories, collections, testimonials, settings } = useStore();
  const homepageRef = useRef(null);
  const categoryScrollerRef = useRef(null);

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

      {/* SHOP BY CATEGORY */}
      <section className="border-y border-[#E6DBC9] bg-[#FBF7F0] py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-medium tracking-[0.12em] text-[#8C6239] uppercase">
                Curated Silversmith &amp; Goldsmith Lineages
              </p>
              <h2 className="font-serif text-3xl font-semibold text-[#34241D] sm:text-4xl">
                Shop by Jewellery Category
              </h2>
            </div>
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/collections"
                className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-[#8C6239] transition-colors hover:text-[#34241D]"
              >
                <span>View All {categories.length} Categories</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-2 sm:hidden">
                <button
                  type="button"
                  aria-label="Scroll categories left"
                  onClick={() =>
                    categoryScrollerRef.current?.scrollBy({ left: -224, behavior: 'smooth' })
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#C89B5C] bg-[#FAF8F4] text-[#34241D] transition-colors hover:bg-[#F2E9DC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B88A4A]"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Scroll categories right"
                  onClick={() =>
                    categoryScrollerRef.current?.scrollBy({ left: 224, behavior: 'smooth' })
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#C89B5C] bg-[#FAF8F4] text-[#34241D] transition-colors hover:bg-[#F2E9DC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B88A4A]"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={categoryScrollerRef}
            className="-mx-4 overflow-x-auto overscroll-x-contain no-scrollbar sm:mx-0 sm:overflow-visible"
          >
            <div className="flex w-max min-w-full gap-3 px-4 pb-2 sm:grid sm:w-full sm:grid-cols-4 sm:gap-4 sm:px-0 sm:pb-0 lg:grid-cols-7">
              {categories.map((cat, index) => (
                <Link
                  key={cat._id || cat.slug}
                  to={`/collections?category=${encodeURIComponent(cat.name)}`}
                  data-category-card
                  style={{
                    '--category-card-delay': `${index * 45}ms`,
                    '--category-card-delay-mobile': `${index * 25}ms`,
                  }}
                  className="group flex w-[112px] shrink-0 flex-col items-center gap-3 rounded-2xl border border-transparent bg-[#FAF8F4] px-3 py-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#D8B982] hover:bg-white hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B88A4A] sm:w-auto sm:shrink"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#E6DBC9] bg-[#F7F2EA] text-[#8C6239] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#C89B5C] group-hover:bg-[#F2E9DC] group-hover:text-[#34241D]">
                    <JewelleryCategoryIcon name={cat.name} />
                  </span>
                  <span className="text-sm font-medium leading-snug text-[#34241D] transition-colors group-hover:text-[#8C6239]">
                    {cat.name}
                  </span>
                </Link>
              ))}
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
