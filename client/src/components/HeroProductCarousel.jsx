import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';
import '../styles/HeroProductCarousel.css';

export default function HeroProductCarousel({ products = [] }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Ensure at least 5 items for smooth 3D coverflow visual balance
  const carouselItems = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (products.length >= 5) return products;

    // Duplicate items if count is small so 3D carousel always has flanking cards
    const extended = [];
    while (extended.length < 5) {
      products.forEach((p) => {
        extended.push({ ...p, _displayKey: `${p._id}_ext_${extended.length}` });
      });
    }
    return extended;
  }, [products]);

  const totalItems = carouselItems.length;

  // Advance to next slide (moves left)
  const handleNext = useCallback(() => {
    if (totalItems <= 1) return;
    setActiveIndex((prev) => (prev + 1) % totalItems);
  }, [totalItems]);

  // Go to previous slide (moves right)
  const handlePrev = useCallback(() => {
    if (totalItems <= 1) return;
    setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
  }, [totalItems]);

  // Auto-advance every 2 seconds (2000ms)
  useEffect(() => {
    if (totalItems <= 1 || isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, 2000);

    return () => clearInterval(timer);
  }, [totalItems, isPaused, handleNext]);

  // Card click handler: navigates if center card; shifts to center if side card
  const handleCardClick = (product, index, isCenter) => {
    if (isCenter) {
      navigate(`/products/${product._id}`);
    } else {
      setActiveIndex(index);
    }
  };

  // Touch Swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 40) {
      // Swiped left -> move next
      handleNext();
    } else if (distance < -40) {
      // Swiped right -> move prev
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  // 3D positioning class calculation with circular wrapping
  const getCardPositionClass = (index) => {
    if (totalItems <= 1) return 'pos-active';
    let diff = index - activeIndex;

    // Wrap around for circular infinite flow
    if (diff > totalItems / 2) diff -= totalItems;
    if (diff < -totalItems / 2) diff += totalItems;

    if (diff === 0) return 'pos-active';
    if (diff === 1) return 'pos-next-1';
    if (diff === -1) return 'pos-prev-1';
    if (diff === 2) return 'pos-next-2';
    if (diff === -2) return 'pos-prev-2';
    if (diff > 2) return 'pos-hidden-right';
    return 'pos-hidden-left';
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section
      className="hero-showcase-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Newly Available Products 3D Carousel"
    >
      <div className="container">
        {/* 3D Perspective Stage */}
        <div
          className="showcase-stage-wrapper"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="showcase-stage">
            {carouselItems.map((product, idx) => {
              const posClass = getCardPositionClass(idx);
              const isCenter = posClass === 'pos-active';
              const hasSale = product.salePrice && product.salePrice < product.regularPrice;
              const currentPrice = hasSale ? product.salePrice : product.regularPrice;
              const discountPercent = hasSale
                ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
                : 0;

              const imageUrl =
                product.images && product.images.length > 0
                  ? product.images[0]
                  : '/assets/images/purple-embroidered-kurti.jpg';

              return (
                <div
                  key={product._displayKey || product._id || idx}
                  className={`showcase-card ${posClass}`}
                  onClick={() => handleCardClick(product, idx, isCenter)}
                  role="button"
                  tabIndex={isCenter ? 0 : -1}
                  aria-label={`${product.name} - ${formatINR(currentPrice)}`}
                >
                  <div className="showcase-image-container">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="showcase-image"
                      decoding="sync"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/images/purple-embroidered-kurti.jpg';
                      }}
                    />

                    {/* Top Badges */}
                    <div className="showcase-badges">
                      <span className="badge-arrival">
                        <Flame size={12} color="#D4AF37" /> New Arrival
                      </span>
                      {hasSale && <span className="badge-sale">{discountPercent}% OFF</span>}
                    </div>

                    {/* Bottom Floating Details Card */}
                    <div className="showcase-details-card">
                      <span className="showcase-card-category">
                        {product.category?.name || product.productType || 'Ethnic Boutique'}
                      </span>

                      <h2 className="showcase-card-title">{product.name}</h2>

                      <div className="showcase-card-footer">
                        <div className="showcase-card-price-wrap">
                          <span className="showcase-card-price">{formatINR(currentPrice)}</span>
                          {hasSale && (
                            <span className="showcase-card-regular-price">
                              {formatINR(product.regularPrice)}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="showcase-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/products/${product._id}`);
                          }}
                        >
                          Explore Piece <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Minimal Navigation Controls: Previous, Dots, Next */}
        <div className="showcase-controls">
          <div className="showcase-nav-row">
            <button
              type="button"
              className="showcase-nav-btn"
              onClick={handlePrev}
              aria-label="Previous product"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Pagination Dots */}
            <div className="showcase-dots">
              {carouselItems.slice(0, Math.min(totalItems, 10)).map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  className={`showcase-dot ${activeIndex % Math.min(totalItems, 10) === dotIdx ? 'active' : ''}`}
                  onClick={() => {
                    setActiveIndex(dotIdx);
                  }}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              className="showcase-nav-btn"
              onClick={handleNext}
              aria-label="Next product"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
