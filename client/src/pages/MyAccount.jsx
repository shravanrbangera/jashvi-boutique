import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { User, MapPin, Plus, Trash2, Shield, Phone, Mail, Loader2 } from 'lucide-react';

export default function MyAccount() {
  const { user, refreshProfile } = useAuth();
  const { addToast } = useToast();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressData, setAddressData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine: '',
    landmark: '',
    city: 'Mangalore',
    state: 'Karnataka',
    pincode: '575001',
    isDefault: false,
  });

  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.patch('/auth/profile', profileData);
      if (res.data?.success) {
        addToast('Profile updated successfully!', 'success');
        setEditingProfile(false);
        refreshProfile();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/auth/addresses', addressData);
      if (res.data?.success) {
        addToast('Delivery address saved!', 'success');
        setShowAddAddress(false);
        refreshProfile();
        setAddressData({
          fullName: user?.name || '',
          phone: user?.phone || '',
          addressLine: '',
          landmark: '',
          city: 'Mangalore',
          state: 'Karnataka',
          pincode: '575001',
          isDefault: false,
        });
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const res = await api.delete(`/auth/addresses/${addressId}`);
      if (res.data?.success) {
        addToast('Address deleted.', 'info');
        refreshProfile();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div style={{ backgroundColor: '#F7F4F0', padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>My Account Profile</h1>

        {/* Profile Details Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #EAE7E4',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <User size={20} color="#C98491" />
              <h3 style={{ fontSize: '1.25rem' }}>Personal Information</h3>
            </div>
            <button
              onClick={() => setEditingProfile(!editingProfile)}
              className="btn btn-secondary btn-sm"
            >
              {editingProfile ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editingProfile ? (
            <form onSubmit={handleUpdateProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    required
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
                {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.95rem' }}>
              <div>
                <p style={{ color: '#8A817D', fontSize: '0.8rem', textTransform: 'uppercase' }}>Full Name</p>
                <p style={{ fontWeight: 600, color: '#262322' }}>{user?.name}</p>
              </div>
              <div>
                <p style={{ color: '#8A817D', fontSize: '0.8rem', textTransform: 'uppercase' }}>Email Address</p>
                <p style={{ fontWeight: 600, color: '#262322' }}>{user?.email}</p>
              </div>
              <div>
                <p style={{ color: '#8A817D', fontSize: '0.8rem', textTransform: 'uppercase' }}>Contact Phone</p>
                <p style={{ fontWeight: 600, color: '#262322' }}>{user?.phone}</p>
              </div>
              <div>
                <p style={{ color: '#8A817D', fontSize: '0.8rem', textTransform: 'uppercase' }}>Account Role</p>
                <span className="badge badge-rose" style={{ textTransform: 'capitalize' }}>
                  {user?.role}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Saved Addresses Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #EAE7E4',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <MapPin size={20} color="#C98491" />
              <h3 style={{ fontSize: '1.25rem' }}>Saved Delivery Addresses</h3>
            </div>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={16} /> Add Address
            </button>
          </div>

          {/* Add Address Form */}
          {showAddAddress && (
            <form
              onSubmit={handleAddAddress}
              style={{
                backgroundColor: '#FDFBF9',
                border: '1px solid #EAE7E4',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <h4 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>New Address Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    value={addressData.fullName}
                    onChange={(e) => setAddressData({ ...addressData, fullName: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    required
                    value={addressData.phone}
                    onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address Line</label>
                <input
                  type="text"
                  required
                  placeholder="Street / Flat / Door Number"
                  value={addressData.addressLine}
                  onChange={(e) => setAddressData({ ...addressData, addressLine: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    required
                    value={addressData.city}
                    onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    required
                    value={addressData.state}
                    onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">PIN Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addressData.pincode}
                    onChange={(e) => setAddressData({ ...addressData, pincode: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Address'}
                </button>
                <button type="button" onClick={() => setShowAddAddress(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* List of addresses */}
          {!user?.addresses || user.addresses.length === 0 ? (
            <p style={{ color: '#5C5552', fontSize: '0.9rem' }}>
              No delivery addresses saved yet. Add your default address for faster checkout.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {user.addresses.map((addr) => (
                <div
                  key={addr._id}
                  style={{
                    border: '1px solid #EAE7E4',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    backgroundColor: '#FDFBF9',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <p style={{ fontWeight: 600 }}>{addr.fullName}</p>
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      style={{ color: '#D32F2F', cursor: 'pointer', padding: '2px' }}
                      title="Delete address"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#5C5552', lineHeight: '1.5' }}>
                    {addr.addressLine}<br />
                    {addr.landmark && <>{addr.landmark}<br /></>}
                    {addr.city}, {addr.state} - <strong>{addr.pincode}</strong><br />
                    Phone: {addr.phone}
                  </p>

                  {addr.isDefault && (
                    <span className="badge badge-success" style={{ marginTop: '0.75rem' }}>
                      Default Address
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
