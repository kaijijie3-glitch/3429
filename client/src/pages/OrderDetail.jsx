import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(false);
  const [goodsImageModal, setGoodsImageModal] = useState(false);
  const [logisticsModal, setLogisticsModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [trackingNumber, setTrackingNumber] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrder();
    if (user?.role === 'admin') {
      fetchStaff();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setTrackingNumber(data.tracking_number || '');
      }
    } catch (err) {
      console.error('获取订单失败', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (err) {
      console.error('获取员工列表失败', err);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('确定要取消该订单吗？')) return;
    
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (res.ok) {
        fetchOrder();
      }
    } catch (err) {
      console.error('取消订单失败', err);
    }
  };

  const handleAssign = async (type, staffId) => {
    try {
      const body = {};
      if (type === 'goods') body.goods_staff_id = staffId;
      if (type === 'logistics') body.logistics_staff_id = staffId;
      
      const res = await fetch(`/api/orders/${id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setAssignModal(false);
        fetchOrder();
      }
    } catch (err) {
      console.error('分配失败', err);
    }
  };

  const handleFileUpload = async (files) => {
    const uploadedUrls = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        uploadedUrls.push(data.url);
      }
    }
    return uploadedUrls;
  };

  const handleUploadGoodsImages = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);

    try {
      const urls = await handleFileUpload(selectedFiles);
      const res = await fetch(`/api/orders/${id}/goods-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ images: urls })
      });
      if (res.ok) {
        setGoodsImageModal(false);
        setSelectedFiles([]);
        fetchOrder();
      }
    } catch (err) {
      console.error('上传失败', err);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadLogistics = async () => {
    setUploading(true);

    try {
      const body = {};
      if (trackingNumber) body.tracking_number = trackingNumber;
      
      if (selectedFiles.length > 0) {
        const urls = await handleFileUpload(selectedFiles);
        body.images = urls;
      }

      const res = await fetch(`/api/orders/${id}/logistics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setLogisticsModal(false);
        setSelectedFiles([]);
        setTrackingNumber('');
        fetchOrder();
      }
    } catch (err) {
      console.error('上传失败', err);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning/10 text-warning',
      quoted: 'bg-accent/10 text-accent',
      cancelled: 'bg-gray/10 text-gray'
    };
    const labels = { pending: '待报价', quoted: '已报价', cancelled: '已取消' };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'goods_handler': return '货物处理员';
      case 'logistics_handler': return '物流处理员';
      default: return role;
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

  const canManageGoods = user?.role === 'admin' || 
    (user?.role === 'goods_handler' && order.assigned_goods_staff === user.id);
  const canManageLogistics = user?.role === 'admin' || 
    (user?.role === 'logistics_handler' && order.assigned_logistics_staff === user.id);

  const goodsStaff = order.assigned_goods_staff ? 
    staff.find(s => s.id === order.assigned_goods_staff) : null;
  const logisticsStaff = order.assigned_logistics_staff ? 
    staff.find(s => s.id === order.assigned_logistics_staff) : null;

  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className="mb-6">
        <Link
          to={user?.role === 'client' ? '/client/orders' : '/admin/orders'}
          className="text-primary text-sm hover:underline mb-2 inline-block"
        >
          ← 返回订单列表
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{order.orderName}</h1>
            <p className="text-text-secondary mt-1">{order.orderNo}</p>
          </div>
          {getStatusBadge(order.status)}
        </div>
      </div>

      {/* Order Info */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">订单信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {order.client_name && (
            <div>
              <p className="text-sm text-text-secondary">客户账号</p>
              <p className="font-medium text-text-primary mt-1">{order.client_name}</p>
            </div>
          )}
          {order.contactName && (
            <div>
              <p className="text-sm text-text-secondary">联系人</p>
              <p className="font-medium text-text-primary mt-1">{order.contactName}</p>
            </div>
          )}
          {order.phone && (
            <div>
              <p className="text-sm text-text-secondary">联系电话</p>
              <p className="font-medium text-text-primary mt-1">{order.phone}</p>
            </div>
          )}
          {order.address && (
            <div className="md:col-span-2">
              <p className="text-sm text-text-secondary">收货地址</p>
              <p className="font-medium text-text-primary mt-1">{order.address}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-text-secondary">创建时间</p>
            <p className="font-medium text-text-primary mt-1">
              {new Date(order.created_at).toLocaleDateString('zh-CN')}
            </p>
          </div>
          {order.quoted_at && (
            <div>
              <p className="text-sm text-text-secondary">报价时间</p>
              <p className="font-medium text-text-primary mt-1">
                {new Date(order.quoted_at).toLocaleDateString('zh-CN')}
              </p>
            </div>
          )}
          {user?.role !== 'goods_handler' && user?.role !== 'logistics_handler' && goodsStaff && (
            <div>
              <p className="text-sm text-text-secondary">货物处理员</p>
              <p className="font-medium text-text-primary mt-1">{goodsStaff.username}</p>
            </div>
          )}
          {user?.role !== 'goods_handler' && user?.role !== 'logistics_handler' && logisticsStaff && (
            <div>
              <p className="text-sm text-text-secondary">物流处理员</p>
              <p className="font-medium text-text-primary mt-1">{logisticsStaff.username}</p>
            </div>
          )}
          {order.tracking_number && (
            <div className="md:col-span-2">
              <p className="text-sm text-text-secondary">物流单号</p>
              <p className="font-medium text-text-primary mt-1 font-mono">{order.tracking_number}</p>
            </div>
          )}
        </div>
        {order.orderDesc && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-text-secondary">订单描述</p>
            <p className="font-medium text-text-primary mt-1">{order.orderDesc}</p>
          </div>
        )}

        {/* Admin actions */}
        {user?.role === 'admin' && (
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-3">
            <button
              onClick={() => setAssignModal(true)}
              className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors"
            >
              分配员工
            </button>
            {canManageGoods && (
              <button
                onClick={() => setGoodsImageModal(true)}
                className="px-4 py-2 bg-accent/10 text-accent rounded-lg font-medium hover:bg-accent/20 transition-colors"
              >
                上传货物图片
              </button>
            )}
            {canManageLogistics && (
              <button
                onClick={() => setLogisticsModal(true)}
                className="px-4 py-2 bg-warning/10 text-warning rounded-lg font-medium hover:bg-warning/20 transition-colors"
              >
                物流信息
              </button>
            )}
          </div>
        )}

        {/* Staff actions */}
        {user?.role === 'goods_handler' && canManageGoods && (
          <div className="mt-4 pt-4 border-t border-border">
            <button
              onClick={() => setGoodsImageModal(true)}
              className="px-4 py-2 bg-accent/10 text-accent rounded-lg font-medium hover:bg-accent/20 transition-colors"
            >
              上传货物图片
            </button>
          </div>
        )}

        {user?.role === 'logistics_handler' && canManageLogistics && (
          <div className="mt-4 pt-4 border-t border-border">
            <button
              onClick={() => setLogisticsModal(true)}
              className="px-4 py-2 bg-warning/10 text-warning rounded-lg font-medium hover:bg-warning/20 transition-colors"
            >
              物流信息
            </button>
          </div>
        )}
      </div>

      {/* Sub Orders */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-text-primary">子订单 ({order.subOrders?.length || 0})</h2>
        {(order.subOrders || []).map((subOrder, index) => (
          <div key={subOrder.id} className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-text-primary">{subOrder.productName}</h3>
                <p className="text-sm text-text-secondary mt-1">{subOrder.subOrderNo}</p>
              </div>
              {getStatusBadge(subOrder.status)}
            </div>

            {subOrder.productDesc && (
              <p className="text-text-secondary mb-4">{subOrder.productDesc}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              {subOrder.image && (
                <div className="md:col-span-1">
                  <img
                    src={subOrder.image}
                    alt={subOrder.productName}
                    className="w-full h-48 object-cover rounded-lg border border-border"
                  />
                </div>
              )}

              <div className="md:col-span-1">
                <h4 className="text-sm font-medium text-text-primary mb-3">尺码数量</h4>
                <div className="grid grid-cols-3 gap-2">
                  {SIZES.map(size => (
                    <div key={size} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-text-secondary">{size}</span>
                      <span className="font-mono font-medium">{subOrder.sizes[size] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {subOrder.quotes && (
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium text-text-primary mb-3">报价</h4>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {SIZES.map(size => (
                    <div key={size} className="flex items-center justify-between px-3 py-2 bg-accent/5 rounded-lg">
                      <span className="text-sm text-text-secondary">{size}</span>
                      <span className="font-mono font-medium text-accent">
                        {subOrder.quotes[size] ? `¥${subOrder.quotes[size]}` : '-'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-3 border-t border-border">
                  <div className="text-right">
                    <p className="text-sm text-text-secondary">小计</p>
                    <p className="text-xl font-bold text-accent">
                      ¥{Object.entries(subOrder.quotes).reduce((sum, [size, price]) => {
                        const qty = subOrder.sizes[size] || 0;
                        return sum + (qty * (price || 0));
                      }, 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total */}
      {order.status === 'quoted' && (
        <div className="bg-white rounded-xl border border-border p-6 mt-6">
          <div className="flex justify-end items-center gap-4">
            <span className="text-text-secondary">订单总计</span>
            <span className="text-2xl font-bold text-accent">
              ¥{(order.subOrders || []).reduce((total, so) => {
                if (!so.quotes) return total;
                return total + Object.entries(so.quotes).reduce((sum, [size, price]) => {
                  const qty = so.sizes[size] || 0;
                  return sum + (qty * (price || 0));
                }, 0);
              }, 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Goods Images */}
      {order.goods_images && order.goods_images.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-6 mt-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">货物照片</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {order.goods_images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`货物 ${i + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Logistics Images */}
      {order.logistics_images && order.logistics_images.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-6 mt-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">物流面单</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {order.logistics_images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`面单 ${i + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 mt-6">
        {user?.role === 'admin' && order.status === 'pending' && (
          <Link
            to={`/admin/orders/${id}/quote`}
            className="flex-1 bg-warning text-white py-3 rounded-lg font-medium hover:bg-warning/90 transition-colors text-center"
          >
            录入报价
          </Link>
        )}
        {user?.role === 'client' && order.status === 'pending' && (
          <button
            onClick={handleCancelOrder}
            className="flex-1 border border-danger text-danger py-3 rounded-lg font-medium hover:bg-danger/5 transition-colors"
          >
            取消订单
          </button>
        )}
        <button
          onClick={() => navigate(user?.role === 'client' ? '/client/orders' : '/admin/orders')}
          className="flex-1 border border-border text-text-primary py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          返回
        </button>
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 fade-in">
            <h2 className="text-xl font-bold text-text-primary mb-6">分配员工</h2>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-text-primary mb-3">货物处理员</p>
                <div className="space-y-2">
                  <div
                    onClick={() => handleAssign('goods', null)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${!order.assigned_goods_staff ? 'bg-primary/10 border-primary' : 'border-border hover:bg-gray-50'}`}
                  >
                    未分配
                  </div>
                  {staff.filter(s => s.role === 'goods_handler').map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleAssign('goods', s.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${order.assigned_goods_staff === s.id ? 'bg-primary/10 border-primary' : 'border-border hover:bg-gray-50'}`}
                    >
                      {s.username}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary mb-3">物流处理员</p>
                <div className="space-y-2">
                  <div
                    onClick={() => handleAssign('logistics', null)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${!order.assigned_logistics_staff ? 'bg-primary/10 border-primary' : 'border-border hover:bg-gray-50'}`}
                  >
                    未分配
                  </div>
                  {staff.filter(s => s.role === 'logistics_handler').map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleAssign('logistics', s.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${order.assigned_logistics_staff === s.id ? 'bg-primary/10 border-primary' : 'border-border hover:bg-gray-50'}`}
                    >
                      {s.username}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setAssignModal(false)}
                className="w-full py-3 border border-border rounded-lg font-medium text-text-primary hover:bg-gray-50 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goods Image Modal */}
      {goodsImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 fade-in">
            <h2 className="text-xl font-bold text-text-primary mb-6">上传货物照片</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  选择图片
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                  className="w-full"
                />
                {selectedFiles.length > 0 && (
                  <p className="text-sm text-text-secondary mt-2">
                    已选择 {selectedFiles.length} 张图片
                  </p>
                )}
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => { setGoodsImageModal(false); setSelectedFiles([]); }}
                  className="flex-1 px-4 py-3 border border-border rounded-lg font-medium text-text-primary hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleUploadGoodsImages}
                  disabled={uploading || selectedFiles.length === 0}
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? '上传中...' : '上传'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logistics Modal */}
      {logisticsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 fade-in">
            <h2 className="text-xl font-bold text-text-primary mb-6">物流信息</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  物流单号
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="请输入物流单号"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  面单图片（可选）
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                  className="w-full"
                />
                {selectedFiles.length > 0 && (
                  <p className="text-sm text-text-secondary mt-2">
                    已选择 {selectedFiles.length} 个文件
                  </p>
                )}
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => { setLogisticsModal(false); setSelectedFiles([]); setTrackingNumber(''); }}
                  className="flex-1 px-4 py-3 border border-border rounded-lg font-medium text-text-primary hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleUploadLogistics}
                  disabled={uploading}
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? '上传中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
