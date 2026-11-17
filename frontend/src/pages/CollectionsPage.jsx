import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { updatePageMeta } from '../utils/seo';
import { formatINR } from '../utils/fallbackData';

const MAX_CATALOGUE_PRICE = 600000;
const GEMSTONE_FILTER_OPTIONS = [
  { name: 'Diamond', terms: ['diamond', 'solitaire'] },
  { name: 'Polki', terms: ['polki'] },
  { name: 'Ruby', terms: ['ruby', 'rubies'] },
  { name: 'Emerald', terms: ['emerald', 'emeralds'] },
  { name: 'Pearl', terms: ['pearl', 'pearls'] },
  { name: 'Sapphire', terms: ['sapphire', 'sapphires'] },
  { name: 'Lapis Lazuli', terms: ['lapis lazuli'] },
  { name: 'Onyx', terms: ['onyx'] },
  { name: 'Kundan', terms: ['kundan'] },
];

export default function CollectionsPage() {
  const { products, categories } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const collectionPageRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'All'
  );
  const [selectedCollection, setSelectedCollection] = useState(
    searchParams.get('collection') || 'All'
  );
  const [selectedMetals, setSelectedMetals] = useState([]);
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [selectedGemstones, setSelectedGemstones] = useState([]);
  const [maxPrice, setMaxPrice] = useState(MAX_CATALOGUE_PRICE);
  const [sortBy, setSortBy] = useState('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 6;

  useEffect(() => {
    const catParam = searchParams.get('category');
    const colParam = searchParams.get('collection');
    setSelectedCategory(catParam || 'All');
    setSelectedCollection(colParam || 'All');
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    updatePageMeta({
      title:
        selectedCategory !== 'All'
          ? `${selectedCategory} | AARANYA`
          : 'All Fine Jewellery Collections | AARANYA',
      description: `Browse AARANYA's ${
        selectedCategory !== 'All' ? selectedCategory : '13-category Indian jewellery'
      } catalogue with transparent INR prices, BIS 916 hallmark details, and WhatsApp enquiry.`,
    });
  }, [selectedCategory]);

  useEffect(() => {
    if (!filtersOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setFiltersOpen(false);
    };
    const closeOnDesktopResize = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) setFiltersOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnDesktopResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeOnDesktopResize);
    };
  }, [filtersOpen]);

  const availableMetals = useMemo(
    () => [...new Set(products.map((product) => product.metalType).filter(Boolean))].sort(),
    [products]
  );
  const availableOccasions = useMemo(
    () => [...new Set(products.map((product) => product.occasion).filter(Boolean))].sort(),
    [products]
  );
  const availableGemstones = useMemo(
    () =>
      GEMSTONE_FILTER_OPTIONS.filter((option) =>
        products.some((product) => {
          const details = (product.stoneDetails || '').toLowerCase();
          return option.terms.some((term) => details.includes(term));
        })
      ),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => p.isActive !== false);

    if (selectedCategory !== 'All') {
      list = list.filter((p) => {
        const catName =
          typeof p.category === 'object' ? p.category?.name : p.category;
        return (
          catName === selectedCategory ||
          (p.secondaryCategories || []).includes(selectedCategory)
        );
      });
    }

    if (selectedCollection !== 'All') {
      list = list.filter((p) => {
        const colName =
          typeof p.collectionRef === 'object' ? p.collectionRef?.name : p.collection;
        return colName === selectedCollection;
      });
    }

    if (selectedMetals.length > 0) {
      list = list.filter((product) => selectedMetals.includes(product.metalType));
    }

    if (selectedOccasions.length > 0) {
      list = list.filter((product) => selectedOccasions.includes(product.occasion));
    }

    if (selectedGemstones.length > 0) {
      list = list.filter((product) => {
        const details = (product.stoneDetails || '').toLowerCase();
        return selectedGemstones.some((gemstone) => {
          const option = GEMSTONE_FILTER_OPTIONS.find((item) => item.name === gemstone);
          return option?.terms.some((term) => details.includes(term));
        });
      });
    }

    if (maxPrice < MAX_CATALOGUE_PRICE) {
      list = list.filter((p) => Number(p.price) <= Number(maxPrice));
    }

    if (sortBy === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'popular')
      list.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));

    return list;
  }, [
    products,
    selectedCategory,
    selectedCollection,
    selectedMetals,
    selectedOccasions,
    selectedGemstones,
    maxPrice,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / limit));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  useLayoutEffect(() => {
    const root = collectionPageRef.current;
    if (
      !root ||
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    root.dataset.collectionRevealReady = 'true';
    const targets = root.querySelectorAll(
      '[data-collection-reveal]:not([data-collection-reveal-visible="true"])'
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.dataset.collectionRevealVisible = 'true';
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );

    targets.forEach((target) => observer.observe(target));
    return () => {
      observer.disconnect();
      delete root.dataset.collectionRevealReady;
      targets.forEach((target) => {
        delete target.dataset.collectionRevealVisible;
      });
    };
  }, []);

  useLayoutEffect(() => {
    const root = collectionPageRef.current;
    if (
      !root ||
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    const cards = root.querySelectorAll(
      '[data-collection-card]:not([data-collection-card-visible="true"])'
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.dataset.collectionCardVisible = 'true';
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [filteredProducts, currentPage]);

  const selectCategory = (catName) => {
    setSelectedCategory(catName);
    setPage(1);
    const nextParams = new URLSearchParams(searchParams);
    if (catName === 'All') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', catName);
    }
    setSearchParams(nextParams);
  };

  const clearCollection = () => {
    setSelectedCollection('All');
    setPage(1);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('collection');
    setSearchParams(nextParams);
  };

  const handleReset = () => {
    setSelectedCategory('All');
    setSelectedCollection('All');
    setSelectedMetals([]);
    setSelectedOccasions([]);
    setSelectedGemstones([]);
    setMaxPrice(MAX_CATALOGUE_PRICE);
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
  };

  const activeFilters = [
    selectedCategory !== 'All'
      ? {
          key: 'category',
          label: `Category: ${selectedCategory}`,
          onRemove: () => selectCategory('All'),
        }
      : null,
    selectedCollection !== 'All'
      ? {
          key: 'collection',
          label: `Collection: ${selectedCollection}`,
          onRemove: clearCollection,
        }
      : null,
    ...selectedMetals.map((metal) => ({
      key: `metal-${metal}`,
      label: `Metal: ${metal}`,
      onRemove: () => {
        setSelectedMetals((current) => current.filter((value) => value !== metal));
        setPage(1);
      },
    })),
    ...selectedOccasions.map((occasion) => ({
      key: `occasion-${occasion}`,
      label: `Occasion: ${occasion}`,
      onRemove: () => {
        setSelectedOccasions((current) => current.filter((value) => value !== occasion));
        setPage(1);
      },
    })),
    ...selectedGemstones.map((gemstone) => ({
      key: `gemstone-${gemstone}`,
      label: `Gemstone: ${gemstone}`,
      onRemove: () => {
        setSelectedGemstones((current) => current.filter((value) => value !== gemstone));
        setPage(1);
      },
    })),
    maxPrice < MAX_CATALOGUE_PRICE
      ? {
          key: 'price',
          label: `Up to ${formatINR(maxPrice)}`,
          onRemove: () => {
            setMaxPrice(MAX_CATALOGUE_PRICE);
            setPage(1);
          },
        }
      : null,
  ].filter(Boolean);

  const toggleArrayFilter = (value, setValues) => {
    setValues((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
    setPage(1);
  };

  const renderCheckbox = (name, checked, onChange) => (
    <label key={name} className="flex items-center gap-2.5 py-1 text-xs text-[#4B3A2D] cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-[#CDBB9E] accent-[#34241D] focus:ring-[#C89B5C]"
      />
      <span>{name}</span>
    </label>
  );

  const renderFilterGroups = (idPrefix) => (
    <div className="divide-y divide-[#E6DBC9]">
      <details open className="group py-3 first:pt-1">
        <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-sm font-medium text-[#34241D]">
          Category
          <ChevronDown className="h-4 w-4 text-[#8C6239] transition-transform group-open:rotate-180" />
        </summary>
        <div className="pt-2">
          {renderCheckbox('All Categories', selectedCategory === 'All', () => selectCategory('All'))}
          {categories
            .filter(
              (category) =>
                !['Temple Jewellery', 'Polki Jewellery', 'Kundan Jewellery'].includes(
                  category.name
                )
            )
            .map((category) =>
              renderCheckbox(
                category.name,
                selectedCategory === category.name,
                () =>
                  selectCategory(
                    selectedCategory === category.name ? 'All' : category.name
                  )
              )
            )}
        </div>
      </details>

      <details open className="group py-3">
        <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-sm font-medium text-[#34241D]">
          Price Range
          <ChevronDown className="h-4 w-4 text-[#8C6239] transition-transform group-open:rotate-180" />
        </summary>
        <div className="pt-3">
          <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
            <span className="text-[#695B4E]">Up to</span>
            <span className="font-semibold text-[#8C6239]">
              {maxPrice >= MAX_CATALOGUE_PRICE ? 'Any price' : formatINR(maxPrice)}
            </span>
          </div>
          <input
            id={`${idPrefix}-price-range`}
            type="range"
            min="25000"
            max={MAX_CATALOGUE_PRICE}
            step="5000"
            value={maxPrice}
            onChange={(event) => {
              setMaxPrice(Number(event.target.value));
              setPage(1);
            }}
            className="w-full accent-[#34241D]"
          />
        </div>
      </details>

      <details className="group py-3">
        <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-sm font-medium text-[#34241D]">
          Metal
          <ChevronDown className="h-4 w-4 text-[#8C6239] transition-transform group-open:rotate-180" />
        </summary>
        <div className="pt-2">
          {availableMetals.length > 0
            ? availableMetals.map((metal) =>
                renderCheckbox(
                  metal,
                  selectedMetals.includes(metal),
                  () => toggleArrayFilter(metal, setSelectedMetals)
                )
              )
            : <p className="py-1 text-xs text-[#695B4E]">No metal options available.</p>}
        </div>
      </details>

      <details className="group py-3">
        <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-sm font-medium text-[#34241D]">
          Occasion
          <ChevronDown className="h-4 w-4 text-[#8C6239] transition-transform group-open:rotate-180" />
        </summary>
        <div className="pt-2">
          {availableOccasions.length > 0
            ? availableOccasions.map((occasion) =>
                renderCheckbox(
                  occasion,
                  selectedOccasions.includes(occasion),
                  () => toggleArrayFilter(occasion, setSelectedOccasions)
                )
              )
            : <p className="py-1 text-xs text-[#695B4E]">No occasion options available.</p>}
        </div>
      </details>

      <details className="group py-3 last:pb-1">
        <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-sm font-medium text-[#34241D]">
          Gemstone
          <ChevronDown className="h-4 w-4 text-[#8C6239] transition-transform group-open:rotate-180" />
        </summary>
        <div className="pt-2">
          {availableGemstones.length > 0
            ? availableGemstones.map(({ name }) =>
                renderCheckbox(
                  name,
                  selectedGemstones.includes(name),
                  () => toggleArrayFilter(name, setSelectedGemstones)
                )
              )
            : <p className="py-1 text-xs text-[#695B4E]">No gemstone options available.</p>}
        </div>
      </details>
    </div>
  );

  return (
    <div ref={collectionPageRef} className="collection-page">
      {/* Header Banner */}
      <section className="bg-[#F2E9DC] border-b border-[#E6DBC9] py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-[#8C6239] font-medium mb-1.5">
            AARANYA Catalogue • 13 Jewellery Lineages
          </p>
          <h1
            data-collection-reveal
            className="font-serif text-3xl sm:text-5xl font-semibold text-[#34241D]"
          >
            {selectedCategory === 'All'
              ? 'All Fine Jewellery Collections'
              : selectedCategory}
          </h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile and tablet filter control */}
        <div className="mb-6 flex lg:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            aria-label="Open catalogue filters"
            className="inline-flex items-center gap-2 rounded-xl border border-[#C89B5C] bg-[#FBF7F0] px-4 py-2.5 text-xs font-medium text-[#34241D] shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4 text-[#B88A4A]" />
            <span>Filters {activeFilters.length > 0 ? `(${activeFilters.length})` : ''}</span>
          </button>
        </div>

        {/* Desktop sorting */}
        <div className="mb-6 hidden justify-end lg:flex">
          <label className="flex w-56 shrink-0 items-center gap-3 text-xs font-medium text-[#34241D]">
            <span>Sort by</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-[#E6DBC9] bg-[#FBF7F0] px-3 py-3 text-xs text-[#34241D]"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </label>
        </div>

        <div className="lg:flex lg:items-start lg:gap-8">
          {/* Desktop filter sidebar */}
          <aside
            data-collection-reveal
            className="mb-8 hidden w-[260px] shrink-0 lg:mb-0 lg:block"
          >
            <div className="rounded-2xl border border-[#E6DBC9] bg-[#FBF7F0] p-5">
              <div className="mb-1 flex items-center justify-between gap-3 border-b border-[#E6DBC9] pb-4">
                <div>
                  <h2 className="text-[11px] font-semibold tracking-[0.18em] text-[#34241D]">
                    FILTERS
                  </h2>
                  <p className="mt-1 text-[11px] text-[#695B4E]">
                    {activeFilters.length} active
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-medium text-[#8C6239] underline underline-offset-4 hover:text-[#34241D]"
                >
                  Clear All
                </button>
              </div>
              {renderFilterGroups('desktop')}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {/* Results summary and removable active filters */}
            <div
              data-collection-reveal
              className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[#695B4E]"
            >
              <p>
                Showing <strong className="text-[#34241D]">{paginatedProducts.length}</strong> of{' '}
                <strong className="text-[#34241D]">{filteredProducts.length}</strong> matching pieces
              </p>

              {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {activeFilters.map((filter) => (
                    <span
                      key={filter.key}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#D8B982] bg-[#F2E9DC] px-3 py-1 font-medium text-[#34241D]"
                    >
                      <span>{filter.label}</span>
                      <button
                        type="button"
                        onClick={filter.onRemove}
                        aria-label={`Remove ${filter.label} filter`}
                        className="hover:text-[#9E5A47]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="ml-1 font-medium text-[#8C6239] underline underline-offset-4 hover:text-[#34241D]"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Product Grid */}
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-3">
                {paginatedProducts.map((product, index) => (
                  <div
                    key={product._id}
                    data-collection-card
                    data-collection-card-direction={index % 2 === 0 ? 'left' : 'right'}
                    className="h-full"
                    style={{ '--collection-card-delay': `${index * 55}ms` }}
                  >
                    <ProductCard product={product} compact />
                  </div>
                ))}
              </div>
            ) : (
              <div className="my-8 max-w-lg space-y-4 rounded-2xl border border-[#E6DBC9] bg-[#FBF7F0] p-12 text-center">
                <h3 className="font-serif text-3xl text-[#34241D]">
                  No Pieces Match Your Selected Filters
                </h3>
                <p className="text-xs leading-relaxed text-[#695B4E]">
                  Try raising the price ceiling or clearing one of your active filters to view more showroom pieces.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl bg-[#34241D] px-5 py-2.5 text-xs font-medium text-[#FAF8F4]"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => {
                      setPage(pageNumber);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`h-9 w-9 rounded-lg border text-xs font-medium transition-colors ${
                      pageNumber === currentPage
                        ? 'border-[#34241D] bg-[#34241D] text-[#FAF8F4]'
                        : 'border-[#E6DBC9] bg-[#FBF7F0] text-[#34241D] hover:border-[#B88A4A]'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile and tablet filter drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              aria-label="Close filters drawer"
              className="absolute inset-0 h-full w-full bg-[#2E1F18]/60"
            />
            <aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-filter-title"
              className="relative z-10 ml-auto flex h-full w-[min(92vw,26rem)] flex-col border-l border-[#E6DBC9] bg-[#FAF8F4] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#E6DBC9] px-5 py-4">
                <div>
                  <h2 id="mobile-filter-title" className="text-sm font-semibold tracking-[0.16em] text-[#34241D]">
                    FILTERS
                  </h2>
                  <p className="mt-1 text-xs text-[#695B4E]">{activeFilters.length} active</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-medium text-[#8C6239] underline underline-offset-4"
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    aria-label="Close filters"
                    className="rounded-full p-2 text-[#34241D] hover:bg-[#F2E9DC]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="no-scrollbar flex-1 overflow-y-auto p-5">
                <div className="rounded-2xl border border-[#E6DBC9] bg-[#FBF7F0] px-4">
                  {renderFilterGroups('mobile')}
                </div>
                <div className="mt-5">
                  <label className="mb-1.5 block text-xs font-medium text-[#34241D]">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="w-full rounded-xl border border-[#E6DBC9] bg-white px-3 py-2.5 text-xs text-[#34241D]"
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 border-t border-[#E6DBC9] bg-[#FAF8F4] p-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 rounded-xl border border-[#C89B5C] bg-white px-4 py-3 text-xs font-medium text-[#34241D]"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="flex-1 rounded-xl bg-[#34241D] px-4 py-3 text-xs font-medium text-[#FAF8F4]"
                >
                  Show results ({filteredProducts.length})
                </button>
              </div>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
