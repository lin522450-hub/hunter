
import React from 'react';

interface DashboardProps {
  companyCount: number;
}

const Dashboard: React.FC<DashboardProps> = ({ companyCount }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">開發中名單</p>
          <h4 className="text-4xl font-black text-slate-900">{companyCount} <span className="text-sm font-medium text-slate-400">間</span></h4>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">本週跟進</p>
          <h4 className="text-4xl font-black text-slate-900">24 <span className="text-sm font-medium text-slate-400">次</span></h4>
        </div>
        <div className="bg-blue-600 p-6 rounded-[2rem] shadow-lg shadow-blue-100 text-white">
          <p className="text-xs font-black opacity-60 uppercase tracking-widest mb-1">年度達成率</p>
          <h4 className="text-4xl font-black">68%</h4>
        </div>
      </div>
      
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
        <h3 className="text-xl font-bold mb-4">市場開發建議 (AI)</h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          根據目前的 1000 大公司動態，半導體與 AI 基礎設施產業在 Q3 有明顯的職缺擴張需求。
          建議本週將開發重點集中在「Hsinchu, Taiwan」地區的供應鏈夥伴。
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
