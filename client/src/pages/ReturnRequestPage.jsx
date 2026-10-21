import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { RotateCcw, AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function ReturnRequestPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState('Size / Fitting Adjustment');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${orderId}`);
        if (res.data?.success) {
          setOrder(res.data.order);
          // By default select the first item
          if (res.data.order.items?.length > 0) {
            setSelectedItems([res.data.order.items[0]._id]);
          }
        }
      } catch (err) {
        addToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId, addToast]);

  const toggleItemSelection = (itemId) => {
    if (selectedItems.includes(itemId)) {
      if (selectedItems.length === 1) {
        addToast('At least one garment must be selected for return.', 'info');
        return;
      }
      setSelectedItems(selectedItems.filter((i) => i !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      addToast('Please select at least one garment to return.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const itemsToReturn = order.items
        .filter((i) => selectedItems.includes(i._id))
        .map((i) => ({
          product: i.product,
          sku: i.sku,
          name: i.name,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          price: i.unitPrice,
          reason,
        }));

      const res = await api.post('/returns', {
        orderId: order._id,
        items: itemsToReturn,
        customerReason: reason,
        customerComments: comments,
      });

      if (res.data?.success) {
        addToast('Return request submitted successfully!', 'success');
        navigate(`/returns/status/${res.data.returnRequest.returnNumber}`);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '6rem 0' }}>Loading return eligibility...</div>;
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Order Not Found</h2>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F7F4F0', padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '750px' }}>
        <Link
          to={`/orders/${order._id}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#5C5552', marginBottom: '1.5rem', fontSize: '0.9rem' }}
        >
          <ArrowLeft size={16} /> Back to Order
        </Link>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #EAE7E4',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <RotateCcw size={22} color="#C98491" />
            <h1 style={{ fontSize: '1.75rem' }}>Submit Boutique Return Request</h1>
          </div>
          <p style={{ color: '#5C5552', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Order Number: <strong>{order.orderNumber}</strong> • Delivered on: <strong>{order.deliveryAddress?.city}</strong>
          </p>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Select Item(s) */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                1. Select garment(s) you wish to return:
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {order.items?.map((item) => (
                  <label
                    key={item._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: selectedItems.includes(item._id) ? '2px solid #C98491' : '1px solid #EAE7E4',
                      backgroundColor: selectedItems.includes(item._id) ? '#FDF8F9' : '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item._id)}
                      onChange={() => toggleItemSelection(item._id)}
                    />
                    <img
                      src={item.image || '/assets/images/purple-embroidered-kurti.jpg'}
                      alt={item.name}
                      style={{ width: '48px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</p>
                      <p style={{ fontSize: '0.8rem', color: '#8A817D' }}>
                        Size: {item.size} • Colour: {item.color} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span style={{ fontWeight: 600 }}>{formatINR(item.lineTotal)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 2: Reason for Return */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                2. Reason for Return: *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="form-select"
                required
              >
                <option value="Size / Fitting Adjustment">Size / Fitting issue (need different size or alteration)</option>
                <option value="Fabric / Quality Query">Fabric or material query</option>
                <option value="Style / Color Preference">Colour or style preference</option>
                <option value="Damaged in Transit">Received with packaging damage</option>
                <option value="Other Boutique Query">Other boutique inquiry</option>
              </select>
            </div>

            {/* Step 3: Additional Comments */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                3. Additional Comments / Tailoring Requirements:
              </label>
              <textarea
                className="form-textarea"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Describe your fitting experience or preferred resolution..."
              />
            </div>

            {/* Policy Reminder */}
            <div
              style={{
                backgroundColor: '#FDFBF9',
                border: '1px solid #EAE7E4',
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '0.85rem',
                color: '#5C5552',
                marginBottom: '1.5rem',
              }}
            >
              <strong>Boutique Return Policy:</strong> Items must be in their original unworn condition with intact boutique price tags. Customized/altered pieces and cut unstitched fabrics are non-returnable. Refunds or adjustments are coordinated by boutique administration upon item receipt.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', justifyContent: 'center' }}
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Submit Official Return Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
