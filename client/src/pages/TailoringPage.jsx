import React from 'react';
import { Scissors, MapPin, Clock, Phone, Sparkles, Check, MessageSquare } from 'lucide-react';

export default function TailoringPage() {
  const services = [
    {
      title: 'Bespoke Designer Blouse Stitching',
      desc: 'Custom-tailored bridal and festive saree blouses with personalized necklines (sweetheart, boat neck, deep back), piping, and custom padding.',
    },
    {
      title: 'Salwar Suit & Kurti Customization',
      desc: 'Perfect-fit tailoring for unstitched dress materials, Chanderi suits, cotton cambric kurtas, and tailored cigarette trousers.',
    },
    {
      title: 'Lehenga Choli & Half-Saree Alterations',
      desc: 'Precision waist adjustments, can-can skirt flare installation, and blouse tapering for brides and festive celebrations.',
    },
    {
      title: 'Expert Garment Fitting & Alterations',
      desc: 'Hemming, sleeve shortening, body tapering, and custom darts on your favorite ready-made boutique garments.',
    },
  ];

  return (
    <div style={{ backgroundColor: '#FDFBF9', paddingBottom: '5rem' }}>
      {/* Atelier Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #262322 0%, #3D3734 100%)',
          color: '#FFFFFF',
          padding: '4.5rem 0',
          textAlign: 'center',
        }}
      >
        <div className="container" style={{ maxWidth: '780px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#C98491',
              fontFamily: 'var(--font-brand)',
              fontSize: '0.85rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            <Scissors size={18} /> In-Store Bespoke Atelier • Attavara
          </div>

          <h1 style={{ fontSize: '2.8rem', color: '#FFFFFF', marginBottom: '1.25rem', lineHeight: 1.2 }}>
            Master Ladies' Tailoring & Custom Fitting
          </h1>

          <p style={{ color: '#D5CFC9', fontSize: '1.05rem', lineHeight: 1.7, margin: '0 auto 2rem' }}>
            Experience bespoke craftsmanship in Mangalore. We transform exquisite unstitched fabrics into impeccably fitted designer silhouettes.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:8050853393" className="btn btn-primary" style={{ backgroundColor: '#C98491', borderColor: '#C98491' }}>
              <Phone size={18} /> Call Atelier: 8050853393
            </a>
            <a
              href="https://wa.me/918050853393?text=Hello%20Jashvi%20Boutique,%20I%20would%20like%20to%20inquire%20about%20in-store%20tailoring%20services"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              <MessageSquare size={18} /> Inquire via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Atelier Photography & Story */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 0.9fr',
              gap: '3.5rem',
              alignItems: 'center',
            }}
            className="tailoring-detail-grid"
          >
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C98491', fontWeight: 700 }}>
                Craftsmanship Process
              </span>
              <h2 style={{ fontSize: '2.2rem', margin: '0.4rem 0 1.25rem' }}>
                Every Stitch Crafted to Your Silhouette
              </h2>
              <p style={{ color: '#5C5552', lineHeight: 1.8, marginBottom: '1.25rem', fontSize: '1rem' }}>
                At Jashvi Boutique, custom tailoring is an art form. Our experienced in-house master cutters and artisans ensure that every blouse, kurti, and dress material set fits your measurements with comfort and precision.
              </p>
              <p style={{ color: '#5C5552', lineHeight: 1.8, marginBottom: '2rem', fontSize: '1rem' }}>
                To maintain the highest bespoke standards, <strong>tailoring measurements, design consultations, and quotes are provided in-person at our Attavara studio</strong>. Visit our boutique with your fabric or choose from our curated silk and cotton dress material collections.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {services.map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #EAE7E4',
                      borderRadius: '8px',
                      padding: '1.25rem',
                    }}
                  >
                    <h3 style={{ fontSize: '1.05rem', color: '#262322', marginBottom: '0.4rem' }}>{s.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#5C5552', lineHeight: 1.5 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <img
                src="/assets/images/tailoring-atelier.jpg"
                alt="Boutique Tailoring Studio Craftsmanship"
                style={{
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)',
                  width: '100%',
                  height: '480px',
                  objectFit: 'cover',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  left: '1.5rem',
                  right: '1.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(6px)',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  border: '1px solid #EAE7E4',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#C98491', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Sparkles size={16} /> In-Store Service Policy
                </div>
                <p style={{ fontSize: '0.85rem', color: '#5C5552', marginTop: '4px' }}>
                  Tailoring is exclusively an in-store service. Customers are kindly requested to visit the boutique for personal measurement consultation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Atelier Location & Visit Details */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '4rem 0', borderTop: '1px solid #EAE7E4' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          <div
            style={{
              backgroundColor: '#FDFBF9',
              border: '1px solid #EAE7E4',
              borderRadius: '12px',
              padding: '2.5rem',
              boxShadow: 'var(--shadow-sm)',
              textAlign: 'center',
            }}
          >
            <h2 style={{ fontSize: '1.85rem', marginBottom: '0.75rem' }}>
              Visit the Jashvi Boutique Atelier
            </h2>
            <p style={{ color: '#5C5552', maxWidth: '580px', margin: '0 auto 2rem' }}>
              Walk in anytime during our boutique hours for consultations, fabric selections, and personalized measurements.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.5rem',
                textAlign: 'left',
                marginBottom: '2rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <MapPin size={22} color="#C98491" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Atelier Address</h3>
                  <p style={{ fontSize: '0.85rem', color: '#5C5552', lineHeight: '1.5' }}>
                    #G1, Ground Floor, Bloom Residency,<br />
                    Victor Bishop Road, Attavara,<br />
                    Mangalore, Karnataka 575001
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Clock size={22} color="#C98491" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Opening Hours</h3>
                  <p style={{ fontSize: '0.85rem', color: '#5C5552', lineHeight: '1.5' }}>
                    10:00 AM – 8:30 PM<br />
                    Monday through Saturday<br />
                    <strong>Sunday Closed</strong>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Phone size={22} color="#C98491" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Direct Line</h3>
                  <p style={{ fontSize: '0.85rem', color: '#5C5552', lineHeight: '1.5' }}>
                    <strong>8050853393</strong><br />
                    Call or WhatsApp for fitting slots & bridal inquiries
                  </p>
                </div>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=Bloom+Residency+Victor+Bishop+Road+Attavara+Mangalore"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              Get Directions to Bloom Residency, Attavara
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
