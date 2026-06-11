import { useState, useEffect } from 'react';

export default function LogisticsTracking() {
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    // 动态加载 17track 的官方外部调用脚本
    const script = document.createElement('script');
    script.src = '//www.17track.net/externalcall.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // 组件卸载时移除脚本，避免内存泄漏
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleTrack = () => {
    if (!trackingNumber.trim()) {
      alert('请输入物流单号');
      return;
    }
    
    // 调用 17track 的官方 API
    if (window.YQV5) {
      window.YQV5.trackSingle({
        YQ_ContainerId: "YQContainer", // 必须和下面 div 的 id 一致
        YQ_Height: 600,                // 结果框高度
        YQ_Fc: "0",                    // 默认风格
        YQ_Lang: "zh-cn",              // 界面语言
        YQ_Num: trackingNumber.trim()  // 用户填写的物流单号
      });
    } else {
      alert('物流查询组件正在加载中，请稍等片刻再试...');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] fade-in">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-text-primary">物流查询</h1>
        <p className="text-text-secondary mt-1">支持全球超过 1500 家快递物流商的轨迹查询 (由 17TRACK 官方接口提供)</p>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-border mb-4 flex gap-4 shadow-sm">
        <input 
          type="text" 
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="请输入快递物流单号..."
          className="flex-1 px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
        />
        <button 
          onClick={handleTrack}
          className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-secondary transition-colors whitespace-nowrap"
        >
          查询轨迹
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-border overflow-hidden relative p-4 shadow-sm">
        {/* 17track 的查询结果会渲染在这个容器里 */}
        <div id="YQContainer" className="w-full h-full min-h-[500px]">
          {!trackingNumber && (
            <div className="h-full flex items-center justify-center text-text-secondary">
              请输入单号并点击查询
            </div>
          )}
        </div>
      </div>
    </div>
  );
}