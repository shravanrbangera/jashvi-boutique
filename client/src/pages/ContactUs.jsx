import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ContactUs() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'General Garment Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    addToast('Thank you! Your message has been received by our boutique team.', 'success');
  };

  return (
    <div style={{ backgroundColor: '#FDFBF9', paddingBottom: '5rem' }}>
      {/* Header */}
      <section
        style={{
          background: 'linear-gradient(135deg, #FBF8F5 0%, #F5ECEE 100%)',
          padding: '4rem 0',
          textAlign: 'center',
          borderBottom: '1px solid #EAE7E4',
        }}
      >
        <div className="container" style={{ maxWidth: '750px' }}>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C98491', fontWeight: 700 }}>
            Reach Out to Us
          </span>
          <h1 style={{ fontSize: '2.8rem', marginTop: '0.5rem', marginBottom: '1rem', lineHeight: 1.2 }}>
            Contact & Boutique Visit
          </h1>
          <p style={{ color: '#5C5552', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Have a question regarding sizes, online orders, bridal appointments, or in-store tailoring? We are here to assist you.
          </p>
        </div>
      </section>

      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 1.3fr',
              gap: '3.5rem',
              alignItems: 'flex-start',
            }}
            className="contact-layout"
          >
            {/* Left: Contact Info Card */}
            <div>
              <h2 style={{ fontSize: '1.85rem', marginBottom: '1.25rem' }}>Boutique Details</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#F1DFE2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={22} color="#C98491" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Boutique Address</h3>
                    <p style={{ color: '#5C5552', fontSize: '0.95rem', lineHeight: 1.6 }}>
                      #G1, Ground Floor, Bloom Residency,<br />
                      Victor Bishop Road, Attavara,<br />
                      Mangalore, Karnataka 575001, India
                    </p>
                    <a
                      href="https://maps.google.com/?q=Bloom+Residency+Victor+Bishop+Road+Attavara+Mangalore"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#C98491', fontSize: '0.85rem', fontWeight: 600, display: 'inline-block', marginTop: '4px' }}
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#F1DFE2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={22} color="#C98491" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Telephone & WhatsApp</h3>
                    <p style={{ color: '#5C5552', fontSize: '0.95rem' }}>
                      Primary: <a href="tel:8050853393" style={{ fontWeight: 600, color: '#262322' }}>+91 8050853393</a>
                    </p>
                    <a
                      href="https://wa.me/918050853393?text=Hello%20Jashvi%20Boutique"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#2E7D32', fontSize: '0.85rem', fontWeight: 600, display: 'inline-block', marginTop: '4px' }}
                    >
                      Chat on WhatsApp (+91 8050853393) →
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#F1DFE2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={22} color="#C98491" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Store Timings</h3>
                    <p style={{ color: '#5C5552', fontSize: '0.95rem', lineHeight: 1.6 }}>
                      Monday – Saturday: <strong>10:00 AM – 8:30 PM</strong><br />
                      Sunday: <strong style={{ color: '#D32F2F' }}>Closed</strong>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#F1DFE2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={22} color="#C98491" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Email Inquiries</h3>
                    <p style={{ color: '#5C5552', fontSize: '0.95rem' }}>
                      contact@jashviboutique.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact Form Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #EAE7E4',
                padding: '2.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Send Us a Message</h2>
              <p style={{ color: '#5C5552', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Fill out the form below and our boutique staff will reply promptly via phone or WhatsApp.
              </p>

              {submitted ? (
                <div style={{ backgroundColor: '#E8F5E9', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: '#2E7D32' }}>
                  <CheckCircle2 size={36} color="#2E7D32" style={{ margin: '0 auto 0.75rem' }} />
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Message Received!</h3>
                  <p style={{ color: '#1B5E20', fontSize: '0.9rem' }}>
                    Thank you, {formData.name}. Our boutique team will get in touch with you shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', phone: '', email: '', subject: 'General Garment Inquiry', message: '' });
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '1.25rem' }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="form-select"
                    >
                      <option value="General Garment Inquiry">General Garment Inquiry</option>
                      <option value="In-Store Tailoring Consultation">In-Store Tailoring Consultation</option>
                      <option value="Bridal / Festive Lehenga Inquiry">Bridal / Festive Lehenga Inquiry</option>
                      <option value="Order Tracking / Delivery Status">Order Tracking / Delivery Status</option>
                      <option value="Bulk Order / Fabric Query">Bulk Order / Fabric Query</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Your Message *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="form-textarea"
                      placeholder="Please let us know how we can assist you..."
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    <Send size={16} /> Send Message to Boutique
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
