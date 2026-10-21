import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Sparkles, Phone, Clock } from 'lucide-react';

export default function AnnouncementBar() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.get('/settings');
        if (res.data?.success) {
          setSettings(res.data.settings);
        }
      } catch {
        // Fallback default
      }
    }
    loadSettings();
  }, []);

  if (settings?.announcementBar && !settings.announcementBar.isActive) {
    return null;
  }

  const message =
    settings?.announcementBar?.text ||
    'Complimentary Boutique Delivery in Mangalore for orders above ₹1,999 | In-Store Custom Tailoring Available';

  return (
    <div className="announcement-bar">
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontSize: '0.8rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 auto' }}>
          <Sparkles size={14} color="#C98491" />
          <span>{message}</span>
        </div>
        <div style={{ display: 'none', alignItems: 'center', gap: '1.25rem' }} className="d-md-flex">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#D5CFC9' }}>
            <Phone size={13} color="#C98491" /> 8050853393
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#D5CFC9' }}>
            <Clock size={13} color="#C98491" /> 10:00 AM - 8:30 PM (Sun Closed)
          </span>
        </div>
      </div>
    </div>
  );
}
