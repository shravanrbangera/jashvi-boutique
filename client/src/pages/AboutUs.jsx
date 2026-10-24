import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Sparkles,
  Scissors,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Navigation,
} from 'lucide-react';

export default function AboutUs() {
  return (
    <div style={{ backgroundColor: '#FDFBF9', paddingBottom: '3rem' }}>
      {/* Top Section: Boutique Details & Atelier Contact Cards */}
      <section id="visit" style={{ padding: '4rem 0 4rem', backgroundColor: '#FDFBF9' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C98491', fontWeight: 700 }}>
              Visit & Connect
            </span>
            <h2 style={{ fontSize: '2.4rem', marginTop: '0.35rem', color: '#1A1716' }}>
              Visit Our Boutique & Atelier
            </h2>
            <p style={{ maxWidth: '640px', margin: '0.5rem auto 0', color: '#5C5552', fontSize: '1rem', lineHeight: 1.6 }}>
              Whether you are looking for ready-to-wear kurtis, bridal attire consultations, or personalized in-store tailoring, we warmly welcome you to our Attavara studio.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {/* Address Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #EAE7E4',
                padding: '2rem 1.5rem',
                boxShadow: '0 4px 15px rgba(38, 35, 34, 0.05)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(201, 132, 145, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <MapPin size={24} color="#A84A5D" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#1A1716' }}>Boutique Address</h3>
              <p style={{ color: '#5C5552', fontSize: '0.95rem', lineHeight: 1.65, flex: 1, marginBottom: '1.25rem' }}>
                #G1, Ground Floor, Bloom Residency,<br />
                Victor Bishop Road, Attavara,<br />
                Mangalore, Karnataka 575001, India
              </p>
              <a
                href="https://maps.google.com/?q=Bloom+Residency+Victor+Bishop+Road+Attavara+Mangalore"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'center', gap: '0.4rem', fontWeight: 600 }}
              >
                <Navigation size={15} color="#A84A5D" /> Open in Google Maps
              </a>
            </div>

            {/* Timings Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #EAE7E4',
                padding: '2rem 1.5rem',
                boxShadow: '0 4px 15px rgba(38, 35, 34, 0.05)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(201, 132, 145, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Clock size={24} color="#A84A5D" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#1A1716' }}>Store & Atelier Timings</h3>
              <div style={{ color: '#5C5552', fontSize: '0.95rem', lineHeight: 1.7, flex: 1, marginBottom: '1.25rem' }}>
                <p>Monday – Saturday:</p>
                <p style={{ fontWeight: 700, color: '#1A1716', fontSize: '1.05rem' }}>10:00 AM – 8:30 PM</p>
                <p style={{ marginTop: '0.5rem' }}>Sunday:</p>
                <p style={{ fontWeight: 700, color: '#D32F2F' }}>Closed (Family Day)</p>
              </div>
              <span style={{ fontSize: '0.82rem', color: '#8A817D', fontStyle: 'italic' }}>
                * Walk-ins welcome for custom measurements & ready-to-wear shopping.
              </span>
            </div>

            {/* Telephone & WhatsApp Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #EAE7E4',
                padding: '2rem 1.5rem',
                boxShadow: '0 4px 15px rgba(38, 35, 34, 0.05)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(201, 132, 145, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Phone size={24} color="#A84A5D" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#1A1716' }}>Call & WhatsApp</h3>
              <p style={{ color: '#5C5552', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                Direct Boutique Line:
              </p>
              <a
                href="tel:8050853393"
                style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A1716', display: 'block', marginBottom: '1.25rem' }}
              >
                +91 8050853393
              </a>
              <a
                href="https://wa.me/918050853393?text=Hello%20Jashvi%20Boutique"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-sm"
                style={{
                  backgroundColor: '#25D366',
                  borderColor: '#25D366',
                  color: '#FFFFFF',
                  width: '100%',
                  justifyContent: 'center',
                  fontWeight: 600,
                  gap: '0.4rem',
                }}
              >
                <MessageCircle size={16} /> Chat on WhatsApp
              </a>
            </div>

            {/* Email & Inquiries Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #EAE7E4',
                padding: '2rem 1.5rem',
                boxShadow: '0 4px 15px rgba(38, 35, 34, 0.05)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(201, 132, 145, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Mail size={24} color="#A84A5D" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#1A1716' }}>Email Inquiries</h3>
              <p style={{ color: '#5C5552', fontSize: '0.95rem', lineHeight: 1.6, flex: 1, marginBottom: '1.25rem' }}>
                For bridal consultations, bulk orders, or order assistance:
                <br />
                <a
                  href="mailto:contact@jashviboutique.com"
                  style={{ color: '#A84A5D', fontWeight: 700, fontSize: '1rem', display: 'inline-block', marginTop: '0.4rem' }}
                >
                  contact@jashviboutique.com
                </a>
              </p>
              <Link
                to="/tailoring"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'center', fontWeight: 600, gap: '0.4rem' }}
              >
                <Scissors size={15} color="#A84A5D" /> View Tailoring Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Followed by: Our Story Grid */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#FFFFFF', borderTop: '1px solid #EAE7E4' }}>
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

      {/* 4. Followed by: The Jashvi Standard Values */}
      <section style={{ backgroundColor: '#FDFBF9', padding: '4rem 0', borderTop: '1px solid #EAE7E4' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C98491', fontWeight: 700 }}>
              The Jashvi Standard
            </span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>Why Our Customers Trust Us</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #EAE7E4' }}>
              <ShieldCheck size={32} color="#C98491" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>100% Quality Inspected</h3>
              <p style={{ color: '#5C5552', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Every garment undergoes strict pre-dispatch inspection for fabric strength, stitching integrity, and embellishment finish.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #EAE7E4' }}>
              <Scissors size={32} color="#C98491" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Custom Alterations</h3>
              <p style={{ color: '#5C5552', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Need sleeves adjusted or waist tapered? Our in-store boutique tailoring studio provides personalized fitting alterations.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #EAE7E4' }}>
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
