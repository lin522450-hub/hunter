
import React, { useState, useMemo } from 'react';
import { Company, AppSection, OrgNode, JobPosition, DevLog, DevPlan } from './types';
import { MOCK_COMPANIES } from './constants';
import Sidebar from './components/Sidebar';
import OrgChart from './components/OrgChart';
import Dashboard from './components/Dashboard';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.Dashboard);
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [orgChart, setOrgChart] = useState<OrgNode | null>(null);
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingOrg, setLoadingOrg] = useState(false);

  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [newCompanyData, setNewCompanyData] = useState<Partial<Company>>({
    name: '', industry: '', rank: 1, phone: '', website: '', headquarters: ''
  });

  const [devPlans, setDevPlans] = useState<Record<string, DevPlan>>({});
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [tempPlan, setTempPlan] = useState<DevPlan | null>(null);

  const [logs, setLogs] = useState<Record<string, DevLog[]>>({});
  const [newLogContent, setNewLogContent] = useState('');

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            company.industry.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesIndustry = selectedIndustry === 'All' || company.industry === selectedIndustry;
      return matchesSearch && matchesIndustry;
    });
  }, [companies, searchTerm, selectedIndustry]);

  const industries = useMemo(() => {
    const set = new Set(companies.map(c => c.industry));
    return ['All', ...Array.from(set)];
  }, [companies]);

  const syncJobs = async (companyName: string) => {
    setLoadingJobs(true);
    try {
      const suggestedJobs = await geminiService.simulate104Import(companyName);
      setJobs(suggestedJobs);
    } catch (error) {
      console.error("104 同步失敗:", error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleCompanySelect = async (company: Company) => {
    setSelectedCompany(company);
    setLoadingOrg(true);
    setOrgChart(null);
    setIsEditingPlan(false);
    
    try {
      const chartPromise = geminiService.generateOrgChart(company.name);
      syncJobs(company.name);
      const chart = await chartPromise;
      setOrgChart(chart);
    } catch (error) {
      console.error("載入公司數據失敗:", error);
    } finally {
      setLoadingOrg(false);
    }
  };

  const handleAddCompany = () => {
    if (!newCompanyData.name) return;
    const company: Company = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCompanyData.name || '',
      industry: newCompanyData.industry || 'General',
      rank: Number(newCompanyData.rank) || 999,
      phone: newCompanyData.phone || '',
      website: newCompanyData.website || '',
      headquarters: newCompanyData.headquarters || '',
      description: ''
    };
    setCompanies([company, ...companies]);
    setIsAddingCompany(false);
    handleCompanySelect(company);
  };

  const handleStartEditPlan = () => {
    if (!selectedCompany) return;
    const currentPlan = devPlans[selectedCompany.id] || {
      hrContact: '', contactInfo: '', hasLine: false, lineId: '', notes: ''
    };
    setTempPlan(currentPlan);
    setIsEditingPlan(true);
  };

  const addLog = () => {
    if (!selectedCompany || !newLogContent.trim()) return;
    const newEntry: DevLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      content: newLogContent,
      type: 'Note',
      author: '資深開發經理'
    };
    setLogs(prev => ({
      ...prev, [selectedCompany.id]: [newEntry, ...(prev[selectedCompany.id] || [])]
    }));
    setNewLogContent('');
  };

  const renderContent = () => {
    switch (activeSection) {
      case AppSection.Dashboard:
        return <Dashboard companyCount={companies.length} />;
      case AppSection.Companies:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-1 space-y-3">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <button 
                  onClick={() => setIsAddingCompany(true)}
                  className="w-full mb-3 py-2 bg-slate-900 text-white rounded-xl text-[11px] font-black hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  + 新增開發對象
                </button>
                <input 
                  type="text" 
                  placeholder="搜尋公司..." 
                  className="w-full px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] outline-none mb-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {industries.map(ind => (
                    <button key={ind} onClick={() => setSelectedIndustry(ind)} className={`px-2 py-0.5 rounded text-[9px] font-black ${selectedIndustry === ind ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{ind}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1 custom-scrollbar overflow-y-auto max-h-[calc(100vh-320px)]">
                {filteredCompanies.map(c => (
                  <button key={c.id} onClick={() => handleCompanySelect(c)} className={`w-full px-3 py-2 rounded-xl text-left border ${selectedCompany?.id === c.id ? 'bg-blue-50 border-blue-500 text-blue-900' : 'bg-white border-slate-100 text-slate-700'}`}>
                    <div className="flex justify-between items-center"><span className="text-[11px] font-black truncate">{c.name}</span><span className="text-[8px] opacity-30">#{c.rank}</span></div>
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-4">
              {selectedCompany ? (
                <div className="space-y-6">
                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">{selectedCompany.name.charAt(0)}</div>
                        <div>
                          <h2 className="text-2xl font-black">{selectedCompany.name}</h2>
                          <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                            <span>📍 {selectedCompany.headquarters}</span>
                            <a href={`tel:${selectedCompany.phone}`} className="text-blue-500">📞 {selectedCompany.phone}</a>
                          </div>
                        </div>
                      </div>
                      <button onClick={handleStartEditPlan} className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs">設定開發計畫</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">AI 組織架構預測</h4>
                      <OrgChart data={orgChart} />
                    </div>
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">104 即時職缺</h4>
                      <div className="space-y-3">
                        {loadingJobs ? <div className="animate-pulse space-y-2"><div className="h-10 bg-slate-100 rounded-lg"></div><div className="h-10 bg-slate-100 rounded-lg"></div></div> : 
                          jobs.map(j => (
                            <div key={j.id} className="p-3 bg-slate-50 rounded-xl">
                              <h5 className="font-bold text-[11px] truncate">{j.title}</h5>
                              <p className="text-[9px] text-emerald-600 font-black">{j.salary}</p>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                    <div className="lg:col-span-3 bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">開發日誌</h4>
                      <div className="flex gap-2 mb-4">
                        <input value={newLogContent} onChange={e => setNewLogContent(e.target.value)} type="text" placeholder="紀錄開發進度..." className="flex-1 px-4 py-2 bg-slate-50 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500" />
                        <button onClick={addLog} className="px-6 bg-slate-900 text-white rounded-xl text-[10px] font-black">儲存</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(logs[selectedCompany.id] || []).map(l => (
                          <div key={l.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[9px] font-black text-blue-500">{l.date}</span>
                            <p className="text-xs font-bold text-slate-600 mt-1">{l.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : <div className="h-full min-h-[400px] flex items-center justify-center bg-white rounded-[3rem] border border-dashed border-slate-300 text-slate-400 text-sm font-bold">請從左側選取公司</div>}
            </div>
          </div>
        );
      default:
        return <Dashboard companyCount={companies.length} />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <header className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {activeSection === AppSection.Dashboard ? '營運數據概覽' : '開發名單管理'}
          </h1>
        </header>
        {renderContent()}
      </main>
      {isAddingCompany && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-2xl font-black mb-6">新增開發對象</h3>
            <div className="space-y-4">
              <input type="text" placeholder="公司名稱" className="w-full px-4 py-2 bg-slate-50 rounded-xl" onChange={e => setNewCompanyData({...newCompanyData, name: e.target.value})} />
              <input type="text" placeholder="聯絡電話" className="w-full px-4 py-2 bg-slate-50 rounded-xl" onChange={e => setNewCompanyData({...newCompanyData, phone: e.target.value})} />
              <div className="flex gap-2">
                <button onClick={() => setIsAddingCompany(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">取消</button>
                <button onClick={handleAddCompany} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">確認</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
