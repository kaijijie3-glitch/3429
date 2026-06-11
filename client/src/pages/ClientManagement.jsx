import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ClientManagement() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'orders_desc'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error('获取客户列表失败', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedClients = () => {
    let filtered = [...clients];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.username.toLowerCase().includes(term) || 
        (c.email && c.email.toLowerCase().includes(term))
      );
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'orders_desc') {
        return b.orderCount - a.orderCount;
      }
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };

  const displayClients = getFilteredAndSortedClients();

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">客户管理</h1>
          <p className="text-text-secondary mt-1">查看注册客户信息及订单统计</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="搜索客户名或邮箱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <span className="absolute left-3 top-2.5 text-text-secondary">
              🔍
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-border w-full sm:w-auto">
            <span className="text-sm text-text-secondary whitespace-nowrap">排序：</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-transparent border-none focus:ring-0 text-text-primary font-medium cursor-pointer"
            >
              <option value="newest">最新注册</option>
              <option value="oldest">最早注册</option>
              <option value="orders_desc">订单最多</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : displayClients.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-secondary">未找到匹配的客户</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 text-sm font-medium text-text-secondary">
              <div className="col-span-3">用户名</div>
              <div className="col-span-4">邮箱</div>
              <div className="col-span-2 text-center">订单数</div>
              <div className="col-span-3 text-right">注册时间</div>
            </div>
            {displayClients.map((client) => (
              <div key={client.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                <div className="col-span-3 font-medium text-text-primary truncate" title={client.username}>
                  {client.username}
                </div>
                <div className="col-span-4 text-text-secondary text-sm truncate" title={client.email}>
                  {client.email || '-'}
                </div>
                <div className="col-span-2 text-center">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded font-medium">
                    {client.orderCount}
                  </span>
                </div>
                <div className="col-span-3 text-right text-text-secondary text-sm">
                  {new Date(client.created_at).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}