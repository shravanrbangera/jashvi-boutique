import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import {
  ArrowRight,
  Sparkles,
  Scissors,
  ShieldCheck,
  Truck,
  RotateCcw,
  MapPin,
  Clock,
  Phone,
} from 'lucide-react';

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedArrivalCategory, setSelectedArrivalCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?limit=24'),
          api.get('/products/categories'),
        ]);

        if (prodRes.data?.success) {
          setAllProducts(prodRes.data.products || []);
        }
        if (catRes.data?.success) {
          setCategories(catRes.data.categories || []);
        }
      } catch (err) {
        console.warn('Failed to load homepage data:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const displayedProducts =
    selectedArrivalCategory === 'all'
      ? allProducts
      : allProducts.filter((p) => {
          const slug = p.category?.slug || '';
          return slug === selectedArrivalCategory;
        });

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <div className="hero-tagline">
              <Sparkles size={16} />
              <span>Attavara, Mangalore • Est. Fashion Atelier</span>
            </div>

            <h1 className="hero-title">
              Graceful Ethnic Fashion, <br />
              <span style={{ color: 'var(--accent-rose-dark)' }}>Tailored with Elegance.</span>
            </h1>

            <p className="hero-description">
              Explore Jashvi Boutique's handcrafted collection of pure cotton kurtis, opulent festive lehengas, authentic Chanderi dress materials, and bespoke in-store tailoring.
            </p>

            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                Shop Collection <ArrowRight size={18} />
              </Link>
              <Link to="/tailoring" className="btn btn-secondary btn-lg">
                <Scissors size={18} color="#C98491" /> In-Store Tailoring
              </Link>
            </div>

            {/* Reassurance highlights */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                marginTop: '2.5rem',
                paddingTop: '2rem',
                borderTop: '1px solid var(--border-soft)',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>100% Authentic</p>
                <p style={{ fontSize: '0.8rem' }}>Curated Fabrics</p>
              </div>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Mangalore Express</p>
                <p style={{ fontSize: '0.8rem' }}>Complimentary over ₹1,999</p>
              </div>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Custom Fitting</p>
                <p style={{ fontSize: '0.8rem' }}>Attavara Atelier</p>
              </div>
            </div>
          </div>

          <div className="hero-image-wrap">
            <img
              src="/assets/images/purple-embroidered-kurti.jpg"
              alt="Jashvi Boutique Regal Purple Kurti"
            />
            <div
              style={{
                position: 'absolute',
                bottom: '1.25rem',
                left: '1.25rem',
                right: '1.25rem',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #EAE7E4',
              }}
            >
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C98491', fontWeight: 700 }}>
                Featured Arrival
              </span>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#262322', marginTop: '2px' }}>
                Royal Purple Hand-Embroidered Kurta Set
              </p>
              <p style={{ fontSize: '0.85rem', color: '#5C5552' }}>
                Pure Cotton Cambric with tailored cigarette pants
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 1. NEW BOUTIQUE ARRIVALS ON TOP WITH INTEGRATED CATEGORY TABS */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#F7F4F0', borderBottom: '1px solid #EAE7E4' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '1.75rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C98491', fontWeight: 700 }}>
                Latest In-Store & Ready-to-Wear
              </span>
              <h2 style={{ fontSize: '2.2rem', marginTop: '0.25rem', color: '#262322' }}>
                New Boutique Arrivals
              </h2>
              <p style={{ color: '#5C5552', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                Explore fresh arrivals in kurtas, bridal festive wear, and unstitched fabrics directly from our Attavara atelier.
              </p>
            </div>
            <Link to="/products" className="btn btn-outline btn-sm">
              View All Products ({allProducts.length}) <ArrowRight size={16} />
            </Link>
          </div>

          {/* Integrated Catalog Category Filter Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.6rem',
              overflowX: 'auto',
              paddingBottom: '1rem',
              marginBottom: '2rem',
            }}
          >
            <button
              onClick={() => setSelectedArrivalCategory('all')}
              className={`btn btn-sm ${selectedArrivalCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '25px', padding: '0.45rem 1.1rem' }}
            >
              All Arrivals
            </button>
            <button
              onClick={() => setSelectedArrivalCategory('kurtas-and-kurtis')}
              className={`btn btn-sm ${selectedArrivalCategory === 'kurtas-and-kurtis' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '25px', padding: '0.45rem 1.1rem', whiteSpace: 'nowrap' }}
            >
              Kurtas & Kurtis
            </button>
            <button
              onClick={() => setSelectedArrivalCategory('festive-and-bridal')}
              className={`btn btn-sm ${selectedArrivalCategory === 'festive-and-bridal' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '25px', padding: '0.45rem 1.1rem', whiteSpace: 'nowrap' }}
            >
              Festive & Bridal
            </button>
            <button
              onClick={() => setSelectedArrivalCategory('dress-materials')}
              className={`btn btn-sm ${selectedArrivalCategory === 'dress-materials' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '25px', padding: '0.45rem 1.1rem', whiteSpace: 'nowrap' }}
            >
              Dress Materials
            </button>
            <button
              onClick={() => setSelectedArrivalCategory('pants-and-palazzos')}
              className={`btn btn-sm ${selectedArrivalCategory === 'pants-and-palazzos' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '25px', padding: '0.45rem 1.1rem', whiteSpace: 'nowrap' }}
            >
              Pants & Palazzos
            </button>
            <button
              onClick={() => setSelectedArrivalCategory('nightwear-and-loungewear')}
              className={`btn btn-sm ${selectedArrivalCategory === 'nightwear-and-loungewear' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '25px', padding: '0.45rem 1.1rem', whiteSpace: 'nowrap' }}
            >
              Nightwear
            </button>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: '#6E6765' }}>Loading fresh boutique arrivals...</p>
          ) : displayedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#FFFFFF', borderRadius: '8px' }}>
              <p style={{ color: '#5C5552', fontSize: '1rem' }}>No products currently found in this category.</p>
              <button
                onClick={() => setSelectedArrivalCategory('all')}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '0.75rem' }}
              >
                View All Arrivals
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {displayedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. SHOP BY CATEGORY SECTION */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C98491', fontWeight: 700 }}>
              Curated Wardrobe
            </span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>Shop by Category</h2>
            <p style={{ maxWidth: '600px', margin: '0.5rem auto 0', color: '#5C5552' }}>
              Handpicked fabrics and contemporary silhouettes crafted for daily comfort and festive celebrations.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat.slug}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid #EAE7E4',
                  backgroundColor: '#FDFBF9',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
                className="card-hover"
              >
                <div style={{ height: '220px', overflow: 'hidden', backgroundColor: '#EAE7E4' }}>
                  <img
                    src={cat.image || '/assets/images/purple-embroidered-kurti.jpg'}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>{cat.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#8A817D' }}>{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* In-Store Bespoke Tailoring Atelier Showcase */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '3.5rem',
              alignItems: 'center',
            }}
            className="tailoring-grid"
          >
            <div style={{ position: 'relative' }}>
              <img
                src="/assets/images/tailoring-atelier.jpg"
                alt="Jashvi Boutique Tailoring Atelier"
                style={{
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)',
                  width: '100%',
                  height: '420px',
                  objectFit: 'cover',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '-15px',
                  backgroundColor: '#262322',
                  color: '#FFFFFF',
                  padding: '1rem 1.25rem',
                  borderRadius: '8px',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                  textAlign: 'center',
                }}
              >
                <Scissors size={20} color="#C98491" style={{ margin: '0 auto 4px' }} />
                <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  In-Store Atelier
                </p>
                <p style={{ fontSize: '0.75rem', color: '#D5CFC9' }}>Attavara, Mangalore</p>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C98491', fontWeight: 700 }}>
                Custom Craftsmanship
              </span>
              <h2 style={{ fontSize: '2.2rem', margin: '0.4rem 0 1rem', lineHeight: 1.25 }}>
                Bespoke Ladies' Tailoring & Alteration Studio
              </h2>
              <p style={{ color: '#5C5552', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                Beyond our ready-to-wear clothing, Jashvi Boutique houses a specialized tailoring atelier. Our master craftsmen create custom-fitted designer blouses, Anarkalis, lehenga cholis, salwar suits, and precision garment alterations.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <ShieldCheck size={18} color="#C98491" />
                  <span>Personalized body measurements & styling consultation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <ShieldCheck size={18} color="#C98491" />
                  <span>Bridal blouse zardozi embroidery & neck pattern customization</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <ShieldCheck size={18} color="#C98491" />
                  <span>Bring your own dress fabric or choose from our boutique collection</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/tailoring" className="btn btn-primary">
                  Learn About Tailoring <ArrowRight size={16} />
                </Link>
                <a href="tel:8050853393" className="btn btn-secondary">
                  <Phone size={16} color="#C98491" /> Call Atelier: 8050853393
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Boutique Store Visit & Location */}
      <section style={{ padding: '4rem 0', backgroundColor: '#FDFBF9', borderTop: '1px solid #EAE7E4' }}>
        <div className="container">
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #EAE7E4',
              borderRadius: '12px',
              padding: '2.5rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'grid',
              gridTemplateColumns: '1.2fr 0.8fr',
              gap: '2.5rem',
              alignItems: 'center',
            }}
            className="store-card"
          >
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C98491', fontWeight: 700 }}>
                Store Visit
              </span>
              <h3 style={{ fontSize: '1.75rem', margin: '0.4rem 0 1rem' }}>
                Visit Jashvi Boutique in Attavara
              </h3>
              <p style={{ color: '#5C5552', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Step into our warm boutique to experience fabrics firsthand, try on sizes in our private fitting room, and consult directly with our tailoring specialists.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', color: '#262322' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <MapPin size={20} color="#C98491" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Address:</strong><br />
                    #G1, Ground Floor, Bloom Residency, Victor Bishop Road,<br />
                    Attavara, Mangalore, Karnataka 575001, India
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Clock size={18} color="#C98491" />
                  <div>
                    <strong>Hours:</strong> 10:00 AM – 8:30 PM (Sunday Closed)
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Phone size={18} color="#C98491" />
                  <div>
                    <strong>Contact:</strong> 8050853393
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#F7F4F0',
                padding: '2rem',
                borderRadius: '8px',
                border: '1px solid #EAE7E4',
                textAlign: 'center',
              }}
            >
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Need Assistance?</h4>
              <p style={{ fontSize: '0.85rem', color: '#5C5552', marginBottom: '1.25rem' }}>
                Have questions about a kurti size, fabric availability, or custom tailoring? Contact our boutique team directly.
              </p>
              <a
                href="https://wa.me/918050853393?text=Hello%20Jashvi%20Boutique,%20I%20am%20interested%20in%20your%20clothing%20collection"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '0.75rem' }}
              >
                Chat on WhatsApp
              </a>
              <Link to="/contact" className="btn btn-secondary" style={{ width: '100%' }}>
                Store Contact & Directions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Highlights */}
      <section style={{ padding: '2.5rem 0', backgroundColor: '#FFFFFF', borderTop: '1px solid #EAE7E4' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '2rem',
              textAlign: 'center',
            }}
            className="trust-grid"
          >
            <div>
              <Truck size={24} color="#C98491" style={{ margin: '0 auto 0.5rem' }} />
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>Mangalore Delivery</h4>
              <p style={{ fontSize: '0.8rem', color: '#8A817D' }}>Complimentary over ₹1,999</p>
            </div>
            <div>
              <ShieldCheck size={24} color="#C98491" style={{ margin: '0 auto 0.5rem' }} />
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>100% Quality Checked</h4>
              <p style={{ fontSize: '0.8rem', color: '#8A817D' }}>Hand-inspected boutique pieces</p>
            </div>
            <div>
              <RotateCcw size={24} color="#C98491" style={{ margin: '0 auto 0.5rem' }} />
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>Easy Returns</h4>
              <p style={{ fontSize: '0.8rem', color: '#8A817D' }}>7-day policy for unworn items</p>
            </div>
            <div>
              <Scissors size={24} color="#C98491" style={{ margin: '0 auto 0.5rem' }} />
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>In-House Tailoring</h4>
              <p style={{ fontSize: '0.8rem', color: '#8A817D' }}>Custom fit in Attavara</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
