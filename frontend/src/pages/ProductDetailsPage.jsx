import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Maximize2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import NotFoundPage from './NotFoundPage';
import { updatePageMeta } from '../utils/seo';
import { formatINR, createSvgFallbackDataUri } from '../utils/fallbackData';

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const {
    products,
    wishlist,
    toggleWishlist,
    recentlyViewed,
    addRecentlyViewed,
    handleWhatsAppEnquiry,
  } = useStore();

  const product = products.find((p) => p.slug === slug);

  const orderedImages = useMemo(() => {
    if (!product?.images?.length) return [];
    const copy = [...product.images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const mainIdx = copy.findIndex((img) => img.isMain);
    if (mainIdx > 0) {
      const [mainItem] = copy.splice(mainIdx, 1);
      copy.unshift(mainItem);
    }
    return copy;
  }, [product]);

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [moreSpecsOpen, setMoreSpecsOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setActiveImgIdx(0);
    setMoreSpecsOpen(false);
    setLightboxOpen(false);
    if (product) {
      addRecentlyViewed(product);
      updatePageMeta({
        title: `${product.name} | AARANYA`,
        description: `${product.name} — SKU ${product.sku}, ${product.purity}, priced at ${formatINR(
          product.price
        )}.`,
        image: orderedImages[0]?.url,
        type: 'product',
      });
    }
  }, [slug, product?._id]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (orderedImages.length > 1) {
        if (e.key === 'ArrowRight') {
          setActiveImgIdx((prev) => (prev + 1) % orderedImages.length);
        } else if (e.key === 'ArrowLeft') {
          setActiveImgIdx((prev) => (prev - 1 + orderedImages.length) % orderedImages.length);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, orderedImages.length]);

  if (!product) {
    return <NotFoundPage />;
  }

  const activeImg = orderedImages[activeImgIdx] || orderedImages[0] || {};
  const categoryName =
    typeof product.category === 'object' ? product.category?.name : product.category;
  const isWishlisted = wishlist.some((item) => item._id === product._id);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  const similarProducts = products
    .filter((p) => {
      const pCat = typeof p.category === 'object' ? p.category?.name : p.category;
      return p._id !== product._id && (pCat === categoryName || p.metalType === product.metalType);
    })
    .slice(0, 4);

  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    toast.success('Product link copied to clipboard');
  };

  const handlePrevImage = () => {
    if (orderedImages.length <= 1) return;
    setActiveImgIdx((prev) => (prev - 1 + orderedImages.length) % orderedImages.length);
  };

  const handleNextImage = () => {
    if (orderedImages.length <= 1) return;
    setActiveImgIdx((prev) => (prev + 1) % orderedImages.length);
  };

  const primaryDetails = [
    product.metalType ? { label: 'Metal', value: product.metalType } : null,
    product.purity ? { label: 'Purity', value: product.purity } : null,
    product.weightGrams ? { label: 'Weight', value: `${product.weightGrams} g` } : null,
    product.stoneDetails && product.stoneDetails !== 'None'
      ? { label: 'Stones', value: product.stoneDetails }
      : null,
    product.availability ? { label: 'Availability', value: product.availability } : null,
  ].filter(Boolean);

  const hasAdditionalDetails =
    (product.specifications && product.specifications.length > 0) ||
    (product.sizes && product.sizes.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28 sm:pb-16">
      {/* Compact Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-xs text-[#695B4E] mb-6"
      >
        <Link to="/" className="hover:text-[#34241D] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/collections" className="hover:text-[#34241D] transition-colors">
          Collections
        </Link>
        {categoryName && (
          <>
            <span>/</span>
            <Link
              to={`/collections?category=${encodeURIComponent(categoryName)}`}
              className="hover:text-[#34241D] transition-colors"
            >
              {categoryName}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-[#34241D] font-medium truncate max-w-[240px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Multi-Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#F2E9DC]/75 border border-[#E6DBC9] p-6 flex items-center justify-center group">
            <img
              src={
                activeImg.url ||
                createSvgFallbackDataUri(product.name, product.purity, product.sku)
              }
              alt={activeImg.alt || product.name}
              width="900"
              height="1125"
              onClick={() => setLightboxOpen(true)}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = createSvgFallbackDataUri(
                  product.name,
                  product.purity,
                  product.sku
                );
              }}
              className="w-full h-full object-contain cursor-zoom-in"
            />

            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label="Open full-screen image view"
              className="absolute top-3.5 right-3.5 p-2 rounded-full bg-[#FAF8F4]/90 border border-[#E6DBC9] text-[#34241D] hover:border-[#B88A4A] transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {orderedImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous product image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#FAF8F4]/90 border border-[#E6DBC9] flex items-center justify-center text-[#34241D] hover:border-[#B88A4A] transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next product image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#FAF8F4]/90 border border-[#E6DBC9] flex items-center justify-center text-[#34241D] hover:border-[#B88A4A] transition-colors shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="absolute bottom-3.5 right-3.5 px-2.5 py-1 rounded-md bg-[#34241D]/85 text-[#FAF8F4] text-xs font-medium">
                  {activeImgIdx + 1} / {orderedImages.length}
                </span>
              </>
            )}

            {product.isDemoProduct && (
              <div className="absolute bottom-3.5 left-3.5 max-w-[75%] bg-[#FAF8F4]/95 border border-[#C89B5C]/60 rounded-lg px-3 py-1.5 text-[11px] text-[#34241D]">
                <span className="font-medium text-[#8C6239]">Reference photo: </span>
                <span className="text-[#695B4E]">
                  {activeImg.licenseSource || 'Licensed archival reference'}.
                </span>
              </div>
            )}
          </div>

          {orderedImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {orderedImages.map((img, idx) => (
                <button
                  key={img._id || img.publicId || idx}
                  type="button"
                  onClick={() => setActiveImgIdx(idx)}
                  aria-label={`View image ${idx + 1} of ${orderedImages.length}`}
                  aria-current={idx === activeImgIdx ? 'true' : undefined}
                  className={`w-20 h-24 rounded-xl overflow-hidden border bg-[#F2E9DC]/60 p-1.5 shrink-0 transition-all ${
                    idx === activeImgIdx
                      ? 'border-[#B88A4A] ring-2 ring-[#B88A4A]/25 opacity-100'
                      : 'border-[#E6DBC9] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={
                      img.url ||
                      createSvgFallbackDataUri(product.name, product.purity, product.sku)
                    }
                    alt={img.alt || `${product.name} thumbnail ${idx + 1}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = createSvgFallbackDataUri(
                        product.name,
                        product.purity,
                        product.sku
                      );
                    }}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Information */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header Info */}
          <div className="space-y-2 border-b border-[#E6DBC9] pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#695B4E]">
              <span>
                {[categoryName, product.occasion].filter(Boolean).join(' • ')}
              </span>
              {product.sku && (
                <span className="font-mono">
                  SKU: <strong className="font-medium text-[#34241D]">{product.sku}</strong>
                </span>
              )}
            </div>

            <h1 className="font-sans text-3xl sm:text-4xl font-semibold text-[#34241D] leading-snug">
              {product.name}
            </h1>

            <div className="pt-2 space-y-1.5">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-sans text-3xl sm:text-4xl font-semibold text-[#34241D]">
                  {formatINR(product.price)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-sm text-[#695B4E] line-through">
                      {formatINR(product.originalPrice)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#F2E9DC] border border-[#D8B982] text-[#34241D] text-xs font-medium">
                      Save {formatINR(product.originalPrice - product.price)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Key Facts List */}
          {primaryDetails.length > 0 && (
            <div className="bg-[#FBF7F0] border border-[#E6DBC9] rounded-xl p-4 sm:p-5">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {primaryDetails.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-baseline justify-between sm:justify-start gap-2 border-b border-[#E6DBC9]/60 pb-2 last:border-none sm:last:border-b sm: last:pb-2"
                  >
                    <dt className="text-xs text-[#695B4E] min-w-[85px]">{item.label}</dt>
                    <dd className="font-medium text-[#34241D] text-right sm:text-left">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Primary & Secondary Actions */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleWhatsAppEnquiry(product, 'product_page')}
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#34241D] hover:bg-[#2E1F18] text-[#FAF8F4] text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4 text-[#D8B982]" />
                <span>Enquire on WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className="py-3.5 px-5 rounded-xl border border-[#C89B5C] bg-[#FAF8F4] hover:bg-[#F2E9DC] text-[#34241D] text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted ? 'fill-[#B88A4A] text-[#B88A4A]' : 'text-[#34241D]'
                  }`}
                />
                <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>

            <div className="flex items-center gap-4 pt-1 text-xs text-[#695B4E]">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-[#F2E9DC] text-[#34241D] transition-colors font-medium"
              >
                <Share2 className="w-3.5 h-3.5 text-[#B88A4A]" />
                <span>Share product</span>
              </button>

              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-[#F2E9DC] text-[#34241D] transition-colors font-medium"
              >
                <MapPin className="w-3.5 h-3.5 text-[#B88A4A]" />
                <span>Visit showroom</span>
              </Link>
            </div>
          </div>

          {/* Disclosure for Additional Specifications */}
          {hasAdditionalDetails && (
            <div className="border-t border-[#E6DBC9] pt-4">
              <button
                type="button"
                onClick={() => setMoreSpecsOpen((prev) => !prev)}
                aria-expanded={moreSpecsOpen}
                aria-controls="more-product-details-panel"
                className="w-full py-2.5 flex items-center justify-between text-left font-serif text-xl font-medium text-[#34241D] hover:text-[#B88A4A] transition-colors"
              >
                <span>More product details</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#695B4E] transition-transform duration-200 ${
                    moreSpecsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {moreSpecsOpen && (
                <div
                  id="more-product-details-panel"
                  className="mt-3 rounded-xl border border-[#E6DBC9] bg-[#FBF7F0] p-4 space-y-3 text-xs"
                >
                  {product.sizes?.length > 0 && (
                    <div className="flex justify-between py-1.5 border-b border-[#E6DBC9]/70">
                      <span className="text-[#695B4E]">Available sizes / fit</span>
                      <span className="font-medium text-[#34241D]">
                        {product.sizes.join(', ')}
                      </span>
                    </div>
                  )}
                  {product.specifications?.map((spec, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between py-1.5 border-b border-[#E6DBC9]/70 last:border-none"
                    >
                      <span className="text-[#695B4E]">{spec.label}</span>
                      <span className="font-medium text-[#34241D] text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-[#E6DBC9]">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#34241D] mb-6">
            Similar pieces
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewed.filter((p) => p._id !== product._id).length > 0 && (
        <section className="mt-14 pt-10 border-t border-[#E6DBC9]">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#34241D] mb-6">
            Recently viewed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewed
              .filter((p) => p._id !== product._id)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
          </div>
        </section>
      )}

      {/* Accessible Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} image gallery`}
          className="fixed inset-0 z-50 bg-[#2E1F18]/90 flex flex-col items-center justify-center p-4"
        >
          <div className="w-full max-w-4xl flex items-center justify-between text-[#FAF8F4] mb-3">
            <span className="text-sm font-serif">
              {product.name}{' '}
              {orderedImages.length > 1
                ? `(${activeImgIdx + 1} of ${orderedImages.length})`
                : ''}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close image preview"
              className="p-2 rounded-full bg-[#3C2B20] text-[#FAF8F4] hover:bg-[#B88A4A] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative w-full max-w-4xl h-[75vh] bg-[#FAF8F4] rounded-2xl p-6 flex items-center justify-center">
            <img
              src={
                activeImg.url ||
                createSvgFallbackDataUri(product.name, product.purity, product.sku)
              }
              alt={activeImg.alt || product.name}
              className="max-w-full max-h-full object-contain"
            />
            {orderedImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#34241D] text-[#FAF8F4] flex items-center justify-center hover:bg-[#B88A4A] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#34241D] text-[#FAF8F4] flex items-center justify-center hover:bg-[#B88A4A] transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sticky Mobile WhatsApp Enquiry Action */}
      <div className="fixed bottom-0 inset-x-0 z-30 sm:hidden bg-[#FAF8F4]/95 backdrop-blur border-t border-[#E6DBC9] px-4 py-3 shadow-lg flex items-center gap-3">
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className="px-3.5 py-2.5 rounded-xl border border-[#C89B5C] bg-[#FBF7F0] text-[#34241D] text-xs font-medium flex items-center justify-center gap-1.5"
        >
          <Heart
            className={`w-4 h-4 ${
              isWishlisted ? 'fill-[#B88A4A] text-[#B88A4A]' : 'text-[#34241D]'
            }`}
          />
          <span>Wishlist</span>
        </button>
        <button
          type="button"
          onClick={() => handleWhatsAppEnquiry(product, 'sticky_mobile_cta')}
          className="flex-1 py-2.5 px-4 rounded-xl bg-[#34241D] text-[#FAF8F4] text-xs font-medium flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4 text-[#D8B982]" />
          <span>Enquire on WhatsApp</span>
        </button>
      </div>
    </div>
  );
}
