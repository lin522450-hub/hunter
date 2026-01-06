
import React from 'react';
import { DashboardStats } from '../types';

const MOCK_STATS: DashboardStats = {
  year: { label: '年度開發目標', target: 1000, current: 642, unit: '間', trend: 'up', percentage: 64 },
  quarter: { label: 'Q3 簽約進度', target: 250, current: 120, unit: '間', trend: 'up', percentage: 48 },
  month: { label: '本月開發邀約', target: 80, current: 55, unit: '場', trend: 'stable', percentage: 68 },
  day: { label: '今日跟進任務', target: 10, current: 7, unit: '件', trend: 'up', percentage: 70 },
};

const KpiCard: React.FC<{ metric: any, color: string }> = ({ metric, color }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 group">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{metric.label}</p>
        <h4 className="text-3xl font-black text-slate-900">{metric.current} <span className="text-sm font-medium text-slate-400">/ {metric.target}{metric.unit}</span></h4>
      </div>
      <div className={`p-2 rounded-xl bg-${color === 'emerald' ? 'green' : color}-50 text-${color === 'emerald' ? 'green' : color}-600 text-sm font-bold`}>
        {metric.trend === 'up' ? '↑' : '→'} {metric.percentage}%
      </div>
    </div>
    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
      <div 
        className={`bg-${color === 'emerald' ? 'green' : color}-500 h-full rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${metric.percentage}%` }}
      ></div>
    </div>
    <div className="mt-4 flex justify-between text-[10px] font-bold text-slate-400">
      <span>0</span>
      <span>目標: {metric.target}</span>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard metric={MOCK_STATS.year} color="blue" />
        <KpiCard metric={MOCK_STATS.quarter} color="indigo" />
        <KpiCard metric={MOCK_STATS.month} color="purple" />
        <KpiCard metric={MOCK_STATS.day} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2 text-white">開發趨勢預測</h3>
            <p className="text-slate-400 text-sm mb-8">基於目前 AI 分析的全球 1000 大公司人才流動趨勢</p>
            <div className="flex items-end gap-4 h-48">
              {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-blue-500 rounded-t-lg transition-all duration-1000 delay-300" 
                    style={{ height: `${h}%`, opacity: 0.3 + (h/150) }}
                  ></div>
                  <span className="text-[10px] text-slate-500 font-bold">M{i+1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full"></div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6">重點待開發產業</h3>
          <div className="space-y-6">
            {[
              { name: '半導體設計', count: 12, grow: '+15%' },
              { name: 'AI 雲端運算', count: 8, grow: '+24%' },
              { name: '電動車能源', count: 15, grow: '+8%' },
              { name: '生物醫療', count: 5, grow: '+12%' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="font-bold text-slate-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-900">{item.count} 間</div>
                  <div className="text-[10px] font-bold text-emerald-500">{item.grow}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-all">
            查看完整產業報告
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
