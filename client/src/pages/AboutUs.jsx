import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Scissors, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';

export default function AboutUs() {
  return (
    <div style={{ backgroundColor: '#FDFBF9', paddingBottom: '5rem' }}>
      {/* Header */}
      <section
        style={{
          background: 'linear-gradient(135deg, #FBF8F5 0%, #F5ECEE 100%)',
          padding: '4.5rem 0',
          textAlign: 'center',
          borderBottom: '1px solid #EAE7E4',
        }}
      >
        <div className="container" style={{ maxWidth: '780px' }}>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C98491', fontWeight: 700 }}>
            Our Heritage & Passion
          </span>
          <h1 style={{ fontSize: '2.8rem', marginTop: '0.5rem', marginBottom: '1.25rem', lineHeight: 1.2 }}>
            About Jashvi Boutique
          </h1>
          <p style={{ color: '#5C5552', fontSize: '1.1rem', lineHeight: 1.7 }}>
            Rooted in Attavara, Mangalore — celebrating timeless Indian grace, handcrafted textiles, and personalized bespoke tailoring.
          </p>
        </div>
      </section>

      {/* Story Grid */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 0.9fr',
              gap: '4rem',
              alignItems: 'center',
            }}
            className="about-grid"
          >
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C98491', fontWeight: 700 }}>
                Our Story
              </span>
              <h2 style={{ fontSize: '2.2rem', margin: '0.4rem 0 1.25rem' }}>
                Handcrafted Clothing with Heart & Heritage
              </h2>
              <p style={{ color: '#5C5552', lineHeight: 1.8, marginBottom: '1.25rem', fontSize: '1rem' }}>
                Jashvi Boutique was born with a simple yet passionate vision: to provide women in Mangalore and across India with access to authentic, premium-quality ethnic fashion without the impersonal feel of mass-produced factory garments.
              </p>
              <p style={{ color: '#5C5552', lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '1rem' }}>
                Located at Bloom Residency on Victor Bishop Road in Attavara, our boutique is both a vibrant shopping haven and an active tailoring atelier. From breezy pure cotton everyday kurtis to royal zardozi-embroidered bridal lehengas, every piece in our boutique is chosen for fabric integrity, vibrant colorfastness, and flattering drape.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '2rem' }}>
                <div style={{ borderLeft: '3px solid #C98491', paddingLeft: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Curated Textiles</h3>
                  <p style={{ fontSize: '0.85rem', color: '#5C5552' }}>Chanderi silk, cotton cambric, Banarasi brocades & soft linens.</p>
                </div>
                <div style={{ borderLeft: '3px solid #C98491', paddingLeft: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>In-House Atelier</h3>
                  <p style={{ fontSize: '0.85rem', color: '#5C5552' }}>Master tailors offering personalized fittings and custom designer blouses.</p>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <img
                src="/assets/images/emerald-green-anarkali.jpg"
                alt="Jashvi Boutique Regal Anarkali Suit"
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
                  bottom: '-20px',
                  left: '-20px',
                  backgroundColor: '#FFFFFF',
                  padding: '1.25rem 1.5rem',
                  borderRadius: '10px',
                  border: '1px solid #EAE7E4',
                  boxShadow: 'var(--shadow-md)',
                  maxWidth: '260px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#C98491', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Sparkles size={16} /> Mangalore Heritage
                </div>
                <p style={{ fontSize: '0.8rem', color: '#5C5552', marginTop: '4px' }}>
                  Serving coastal Karnataka with grace, warmth, and bespoke tailoring.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '4rem 0', borderTop: '1px solid #EAE7E4' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C98491', fontWeight: 700 }}>
              The Jashvi Standard
            </span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>Why Our Customers Trust Us</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#FDFBF9', borderRadius: '10px', border: '1px solid #EAE7E4' }}>
              <ShieldCheck size={32} color="#C98491" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>100% Quality Inspected</h3>
              <p style={{ color: '#5C5552', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Every garment undergoes strict pre-dispatch inspection for fabric strength, stitching integrity, and embellishment finish.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#FDFBF9', borderRadius: '10px', border: '1px solid #EAE7E4' }}>
              <Scissors size={32} color="#C98491" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Custom Alterations</h3>
              <p style={{ color: '#5C5552', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Need sleeves adjusted or waist tapered? Our in-store boutique tailoring studio provides personalized fitting alterations.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#FDFBF9', borderRadius: '10px', border: '1px solid #EAE7E4' }}>
              <Heart size={32} color="#C98491" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Customer Care</h3>
              <p style={{ color: '#5C5552', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Personalized support on WhatsApp and phone. We believe every customer deserves warm, respectful, and attentive service.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
