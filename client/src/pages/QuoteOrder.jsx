import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export default function QuoteOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [subOrderQuotes, setSubOrderQuotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);

        const quotes = {};
        data.subOrders.forEach(so => {
          quotes[so.id] = {};
          Object.keys(so.sizes).forEach(size => {
            quotes[so.id][size] = so.quotes?.[size] || '';
          });
        });
        setSubOrderQuotes(quotes);
      }
    } catch (err) {
      console.error('获取订单失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteChange = (subOrderId, size, value) => {
    const num = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
    setSubOrderQuotes(prev => ({
      ...prev,
      [subOrderId]: {
        ...prev[subOrderId],
        [size]: num
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const quotesArray = Object.entries(subOrderQuotes).map(([subOrderId, quotes]) => ({
      subOrderId: parseInt(subOrderId),
      quotes
    }));

    if (quotesArray.length === 0) {
      setError('请至少填写一个报价');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/orders/${id}/quote`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subOrderQuotes: quotesArray })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '提交报价失败');
      }

      navigate('/admin/orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">订单不存在</p>
      </div>
    );
  }

  const subOrders = order.subOrders || [];

  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className="mb-6">
        <Link
          to="/admin/orders"
          className="text-primary text-sm hover:underline mb-2 inline-block"
        >
          ← 返回订单列表
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">录入报价</h1>
        <p className="text-text-secondary mt-1">{order.orderNo} - {order.orderName}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-danger/10 text-danger text-sm p-4 rounded-lg">
            {error}
          </div>
        )}

        {subOrders.map((subOrder, index) => (
          <div key={subOrder.id} className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-text-primary">{subOrder.productName}</h3>
                <p className="text-sm text-text-secondary mt-1">{subOrder.subOrderNo}</p>
              </div>
            </div>

            {subOrder.image && (
              <img
                src={subOrder.image}
                alt={subOrder.productName}
                className="w-32 h-32 object-cover rounded-lg border border-border mb-4"
              />
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {SIZES.map(size => {
                const qty = subOrder.sizes[size] || 0;
                if (qty === 0) return null;

                return (
                  <div key={size} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-primary">{size}</span>
                      <span className="text-xs text-text-secondary">×{qty}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-text-secondary">¥</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={subOrderQuotes[subOrder.id]?.[size] || ''}
                        onChange={(e) => handleQuoteChange(subOrder.id, size, e.target.value)}
                        className="flex-1 px-2 py-1 border border-border rounded text-sm font-mono focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="0.00"
                      />
                    </div>
                    {subOrderQuotes[subOrder.id]?.[size] && (
                      <p className="text-xs text-text-secondary mt-1">
                        小计: ¥{(subOrderQuotes[subOrder.id][size] * qty).toFixed(2)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Subtotal */}
            <div className="flex justify-end pt-3 border-t border-border mt-4">
              <div className="text-right">
                <p className="text-sm text-text-secondary">子订单小计</p>
                <p className="text-lg font-bold text-accent">
                  ¥{Object.entries(subOrderQuotes[subOrder.id] || {}).reduce((sum, [size, price]) => {
                    const qty = subOrder.sizes[size] || 0;
                    return sum + (qty * (price || 0));
                  }, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Grand Total */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex justify-end items-center gap-4">
            <span className="text-text-secondary">订单总计</span>
            <span className="text-2xl font-bold text-accent">
              ¥{Object.entries(subOrderQuotes).reduce((total, [subOrderId, quotes]) => {
                const subOrder = subOrders.find(so => so.id === parseInt(subOrderId));
                if (!subOrder) return total;
                return total + Object.entries(quotes).reduce((sum, [size, price]) => {
                  const qty = subOrder.sizes[size] || 0;
                  return sum + (qty * (price || 0));
                }, 0);
              }, 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="flex-1 px-4 py-3 border border-border rounded-lg font-medium text-text-primary hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '提交中...' : '确认报价'}
          </button>
        </div>
      </form>
    </div>
  );
}
