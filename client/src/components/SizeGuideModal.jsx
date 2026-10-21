import React from 'react';
import { X, Ruler } from 'lucide-react';

export default function SizeGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const sizeTable = [
    { size: 'XS', bustIn: '32-34', waistIn: '26-28', hipIn: '34-36', bustCm: '81-86', waistCm: '66-71' },
    { size: 'S', bustIn: '34-36', waistIn: '28-30', hipIn: '36-38', bustCm: '86-91', waistCm: '71-76' },
    { size: 'M', bustIn: '36-38', waistIn: '30-32', hipIn: '38-40', bustCm: '91-96', waistCm: '76-81' },
    { size: 'L', bustIn: '38-40', waistIn: '32-34', hipIn: '40-42', bustCm: '96-101', waistCm: '81-86' },
    { size: 'XL', bustIn: '40-42', waistIn: '34-36', hipIn: '42-44', bustCm: '101-106', waistCm: '86-91' },
    { size: 'XXL', bustIn: '42-44', waistIn: '36-38', hipIn: '44-46', bustCm: '106-112', waistCm: '91-96' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Ruler size={20} color="#C98491" />
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
              Jashvi Boutique Standard Size Guide
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#5C5552', marginBottom: '1.25rem' }}>
          All measurements are garment standards. For tailored blouses, lehenga cholis, or customized fitting, visit our Attavara studio for personalized alterations.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F7F4F0', borderBottom: '2px solid #EAE7E4' }}>
                <th style={{ padding: '0.65rem 0.85rem' }}>Size</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Bust (Inches)</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Waist (Inches)</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Hips (Inches)</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Bust (CM)</th>
              </tr>
            </thead>
            <tbody>
              {sizeTable.map((row, idx) => (
                <tr
                  key={row.size}
                  style={{
                    borderBottom: '1px solid #EAE7E4',
                    backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FDFBF9',
                  }}
                >
                  <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#C98491' }}>
                    {row.size}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>{row.bustIn}</td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>{row.waistIn}</td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>{row.hipIn}</td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>{row.bustCm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#F1DFE2',
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: '#262322',
          }}
        >
          <strong>Need custom alterations?</strong> Our in-house master tailors provide custom stitching, sleeve alterations, and body tapering at our Attavara boutique. Contact us at <strong>8050853393</strong>.
        </div>
      </div>
    </div>
  );
}
