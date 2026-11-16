import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatINR, createSvgFallbackDataUri } from '../utils/fallbackData';

export default function ProductCard({ product, mobileRevealDirection }) {
  const { wishlist, toggleWishlist, handleWhatsAppEnquiry } = useStore();
  if (!product) return null;

  const sortedImages = [...(product.images || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const mainImage =
    sortedImages.find((img) => img.isMain) || sortedImages[0] || {};
  const isWishlisted = wishlist.some((item) => item._id === product._id);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <article
      data-home-product-card={mobileRevealDirection ? '' : undefined}
      data-home-product-direction={mobileRevealDirection}
      className="bg-[#FBF7F0] border border-[#E6DBC9] hover:border-[#C89B5C] rounded-xl overflow-hidden flex flex-col justify-between transition-colors duration-200 shadow-sm group"
    >
      <div>
        <div className="relative aspect-[4/5] bg-[#F2E9DC]/70 p-4 flex items-center justify-center overflow-hidden border-b border-[#E6DBC9]/60">
          <Link
            to={`/product/${product.slug}`}
            className="w-full h-full flex items-center justify-center focus:outline-none"
          >
            <img
              src={
                mainImage.url ||
                createSvgFallbackDataUri(product.name, '', '')
              }
              alt={mainImage.alt || product.name}
              width="800"
              height="1000"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = createSvgFallbackDataUri(
                  product.name,
                  '',
                  ''
                );
              }}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </Link>

          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
            {product.isDemoProduct && (
              <span className="px-2.5 py-0.5 rounded-md bg-[#FAF8F4]/95 border border-[#C89B5C]/60 text-[11px] font-medium text-[#34241D]">
                Reference photo
              </span>
            )}
            {hasDiscount && (
              <span className="px-2.5 py-0.5 rounded-md bg-[#34241D] text-[#FAF8F4] text-[11px] font-medium w-fit">
                {discountPct}% off
              </span>
            )}
            {product.isNewArrival && !hasDiscount && (
              <span className="px-2.5 py-0.5 rounded-md bg-[#6B705C] text-[#FAF8F4] text-[11px] font-medium w-fit">
                New arrival
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            aria-label={
              isWishlisted
                ? `Remove ${product.name} from Wishlist`
                : `Save ${product.name} to Wishlist`
            }
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#FAF8F4]/95 border border-[#E6DBC9] flex items-center justify-center hover:border-[#B88A4A] transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${
                isWishlisted ? 'fill-[#B88A4A] text-[#B88A4A]' : 'text-[#34241D]'
              }`}
            />
          </button>
        </div>

        <div className="p-5 space-y-2">
          <Link
            to={`/product/${product.slug}`}
            className="font-sans text-xl font-medium text-[#34241D] hover:text-[#B88A4A] transition-colors line-clamp-2 block leading-snug"
          >
            {product.name}
          </Link>

          <div className="pt-1 flex items-baseline gap-2.5">
            <span className="font-sans text-2xl font-semibold text-[#34241D]">
              {formatINR(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#695B4E] line-through">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>

          {product.weightGrams && (
            <div className="text-xs text-[#695B4E] flex flex-wrap items-center gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded bg-[#FAF8F4] border border-[#E6DBC9]">
                {product.weightGrams}g
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-5 pt-2 flex items-center gap-2.5">
        <Link
          to={`/product/${product.slug}`}
          className="flex-1 py-2.5 px-3 rounded-lg border border-[#E6DBC9] bg-[#FAF8F4] hover:border-[#B88A4A] text-xs font-medium text-[#34241D] transition-colors text-center"
        >
          View Piece
        </Link>
        <button
          type="button"
          onClick={() => handleWhatsAppEnquiry(product, 'quick_card')}
          className="py-2.5 px-3.5 rounded-lg bg-[#34241D] hover:bg-[#2E1F18] text-[#FAF8F4] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5 text-[#D8B982]" />
          <span>Enquire</span>
        </button>
      </div>
    </article>
  );
}
