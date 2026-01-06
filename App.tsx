
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

  // 新增公司表單狀態
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [newCompanyData, setNewCompanyData] = useState<Partial<Company>>({
    name: '',
    industry: '',
    rank: 0,
    phone: '',
    website: '',
    headquarters: ''
  });

  // 開發計畫狀態
  const [devPlans, setDevPlans] = useState<Record<string, DevPlan>>({});
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [tempPlan, setTempPlan] = useState<DevPlan | null>(null);

  // 開發紀錄狀態
  const [logs, setLogs] = useState<Record<string, DevLog[]>>({});
  const [newLogContent, setNewLogContent] = useState('');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // 篩選邏輯
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

  const getTodayStr = () => new Date().toISOString().split('T')[0];

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

  // --- 新增公司邏輯 ---
  const handleAddCompany = () => {
    if (!newCompanyData.name || !newCompanyData.industry) return;
    
    const newId = Math.random().toString(36).substr(2, 9);
    const company: Company = {
      id: newId,
      name: newCompanyData.name || '',
      industry: newCompanyData.industry || '',
      rank: Number(newCompanyData.rank) || 999,
      phone: newCompanyData.phone || '',
      website: newCompanyData.website || '',
      headquarters: newCompanyData.headquarters || '',
      description: ''
    };

    setCompanies([company, ...companies]);
    setIsAddingCompany(false);
    setNewCompanyData({ name: '', industry: '', rank: 0, phone: '', website: '', headquarters: '' });
    handleCompanySelect(company); // 自動選取新公司
  };

  const handleStartEditPlan = () => {
    if (!selectedCompany) return;
    const currentPlan = devPlans[selectedCompany.id] || {
      hrContact: '',
      contactInfo: '',
      hasLine: false,
      lineId: '',
      notes: ''
    };
    setTempPlan(currentPlan);
    setIsEditingPlan(true);
  };

  const handleSavePlan = () => {
    if (!selectedCompany || !tempPlan) return;
    setDevPlans(prev => ({ ...prev, [selectedCompany.id]: tempPlan }));
    setIsEditingPlan(false);
  };

  const addLog = () => {
    if (!selectedCompany || !newLogContent.trim()) return;
    const newEntry: DevLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: getTodayStr(),
      content: newLogContent,
      type: 'Note',
      author: '資深開發經理'
    };
    setLogs(prev => ({
      ...prev,
      [selectedCompany.id]: [newEntry, ...(prev[selectedCompany.id] || [])]
    }));
    setNewLogContent('');
  };

  const deleteLog = (logId: string) => {
    if (!selectedCompany) return;
    setLogs(prev => ({
      ...prev,
      [selectedCompany.id]: prev[selectedCompany.id].filter(l => l.id !== logId)
    }));
  };

  const startEditingLog = (log: DevLog) => {
    setEditingLogId(log.id);
    setEditingContent(log.content);
  };

  const saveEditLog = () => {
    if (!selectedCompany || !editingLogId) return;
    setLogs(prev => ({
      ...prev,
      [selectedCompany.id]: prev[selectedCompany.id].map(l => 
        l.id === editingLogId ? { ...l, content: editingContent } : l
      )
    }));
    setEditingLogId(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case AppSection.Dashboard:
        return <Dashboard />;
      case AppSection.Companies:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* 左側：極簡化名單庫 */}
            <div className="lg:col-span-1 space-y-3">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <button 
                  onClick={() => setIsAddingCompany(true)}
                  className="w-full mb-3 py-2 bg-blue-600 text-white rounded-xl text-[11px] font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                >
                  <span className="text-lg">+</span> 新增公司名單
                </button>
                <input 
                  type="text" 
                  placeholder="快速搜尋..." 
                  className="w-full px-3 py-1.5 bg-slate-50 rounded-lg border-none focus:ring-1 focus:ring-blue-500 text-[10px] outline-none mb-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {industries.slice(0, 4).map(industry => (
                    <button
                      key={industry}
                      onClick={() => setSelectedIndustry(industry)}
                      className={`px-2 py-0.5 rounded text-[9px] font-black whitespace-nowrap ${
                        selectedIndustry === industry ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 custom-scrollbar overflow-y-auto max-h-[calc(100vh-320px)]">
                {filteredCompanies.map(company => (
                  <button
                    key={company.id}
                    onClick={() => handleCompanySelect(company)}
                    className={`w-full px-3 py-2 rounded-xl text-left transition-all border ${
                      selectedCompany?.id === company.id 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                        : 'bg-white border-slate-100 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black truncate max-w-[80%]">{company.name}</span>
                      <span className={`text-[8px] font-bold ${selectedCompany?.id === company.id ? 'text-slate-400' : 'text-slate-300'}`}>#{company.rank}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 右側：揭露式詳細內容 */}
            <div className="lg:col-span-4">
              {selectedCompany ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* 基礎資訊 & 開發計畫 */}
                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
                          {selectedCompany.name.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-slate-900 leading-tight">{selectedCompany.name}</h2>
                          <div className="flex gap-3 text-[10px] font-bold text-slate-400 mt-1">
                            <span>📍 {selectedCompany.headquarters}</span>
                            <span>🌐 {selectedCompany.website}</span>
                          </div>
                        </div>
                      </div>
                      {!isEditingPlan && (
                        <button 
                          onClick={handleStartEditPlan}
                          className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-blue-600 transition-all active:scale-95"
                        >
                          {devPlans[selectedCompany.id] ? '🔧 修改計畫' : '⚡ 立即開發'}
                        </button>
                      )}
                    </div>

                    <div className="p-6 bg-slate-50/50">
                      {isEditingPlan ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
                          <input type="text" className="px-3 py-2 text-xs border rounded-lg" placeholder="HR 窗口" value={tempPlan?.hrContact} onChange={e => setTempPlan({...tempPlan!, hrContact: e.target.value})} />
                          <input type="text" className="px-3 py-2 text-xs border rounded-lg" placeholder="聯絡資訊" value={tempPlan?.contactInfo} onChange={e => setTempPlan({...tempPlan!, contactInfo: e.target.value})} />
                          <div className="flex items-center gap-2 bg-white px-3 border rounded-lg">
                            <span className="text-[10px] font-bold">LINE:</span>
                            <input type="checkbox" checked={tempPlan?.hasLine} onChange={e => setTempPlan({...tempPlan!, hasLine: e.target.checked})} />
                            <input type="text" disabled={!tempPlan?.hasLine} className="flex-1 py-2 text-xs outline-none" placeholder="ID" value={tempPlan?.lineId} onChange={e => setTempPlan({...tempPlan!, lineId: e.target.value})} />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={handleSavePlan} className="flex-1 bg-blue-600 text-white text-xs font-bold rounded-lg py-2">儲存</button>
                            <button onClick={() => setIsEditingPlan(false)} className="px-3 bg-slate-200 text-slate-600 text-xs font-bold rounded-lg py-2">取消</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-8 animate-in fade-in duration-500">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase">人資窗口</span>
                            <span className="text-sm font-bold text-slate-800">{devPlans[selectedCompany.id]?.hrContact || '—'}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase">聯繫詳情</span>
                            <span className="text-sm font-bold text-slate-800">{devPlans[selectedCompany.id]?.contactInfo || '—'}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase">LINE 狀態</span>
                            <span className={`text-sm font-bold ${devPlans[selectedCompany.id]?.hasLine ? 'text-emerald-600' : 'text-slate-300'}`}>
                              {devPlans[selectedCompany.id]?.hasLine ? `✅ ${devPlans[selectedCompany.id]?.lineId}` : '未對接'}
                            </span>
                          </div>
                          <div className="flex-1 flex flex-col border-l border-slate-200 pl-8">
                            <span className="text-[9px] font-black text-slate-400 uppercase">開發策略備註</span>
                            <span className="text-xs font-medium text-slate-500 line-clamp-1 italic">{devPlans[selectedCompany.id]?.notes || '尚未輸入補充備註...'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 揭露補充資訊 */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-500 delay-150">
                    <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-tighter flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        AI 人事組織預測圖
                      </h4>
                      <OrgChart data={orgChart} />
                    </div>

                    <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">104 實時數據</h4>
                        <button onClick={() => syncJobs(selectedCompany.name)} className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-all">REFRESH</button>
                      </div>
                      <div className="space-y-3">
                        {loadingJobs ? (
                          <div className="space-y-2 animate-pulse">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl"></div>)}
                          </div>
                        ) : jobs.length > 0 ? (
                          jobs.slice(0, 4).map(job => (
                            <div key={job.id} className="p-3 bg-slate-50 rounded-xl border border-transparent hover:border-blue-200 hover:bg-white transition-all cursor-pointer">
                              <h5 className="font-bold text-slate-800 text-[11px] truncate">{job.title}</h5>
                              <p className="text-[9px] text-emerald-600 font-black mt-0.5">{job.salary}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-center py-10 text-[10px] text-slate-300 font-bold">點選刷新獲取職缺</p>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-3 bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">開發日誌 (倒敘排)</h4>
                        <div className="text-[9px] font-bold text-slate-300">TODAY: {getTodayStr()}</div>
                      </div>
                      
                      <div className="flex gap-4 mb-6">
                        <input 
                          type="text" 
                          placeholder="記錄今日進度..." 
                          className="flex-1 px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500"
                          value={newLogContent}
                          onChange={e => setNewLogContent(e.target.value)}
                        />
                        <button onClick={addLog} className="px-6 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-blue-600 transition-all">ADD LOG</button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(logs[selectedCompany.id] || []).map(log => (
                          <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">{log.date}</span>
                              <button onClick={() => deleteLog(log.id)} className="opacity-0 group-hover:opacity-100 text-[9px] font-bold text-red-400 transition-opacity">DELETE</button>
                            </div>
                            <p className="text-xs font-bold text-slate-600 leading-relaxed">{log.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-200 shadow-sm p-12 text-center group">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 transition-transform duration-700">🔍</div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">請選取一家目標公司</h3>
                  <p className="text-slate-400 text-xs font-medium max-w-[240px]">
                    左側名單已根據您的偏好過濾，選取後將為您自動展開 <span className="text-blue-500">AI 組織結構</span> 與 <span className="text-blue-500">104 職位名單</span>。
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900 antialiased overflow-hidden">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1400px] mx-auto w-full">
          <header className="flex justify-between items-end mb-8">
            <div>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Target Development Hub</p>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                {activeSection === AppSection.Dashboard ? '營運數據' : 
                 activeSection === AppSection.Companies ? '企業看板' :
                 activeSection === AppSection.Analytics ? '市場分析' : '設定'}
              </h1>
            </div>
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-100">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <span className="text-[10px] font-black text-slate-600">GLOBAL 1000 SYNCED</span>
            </div>
          </header>
          {renderContent()}
        </div>
      </main>

      {/* 新增公司 Modal */}
      {isAddingCompany && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-8 text-white">
              <h3 className="text-2xl font-black">建立新開發公司</h3>
              <p className="text-slate-400 text-sm mt-1">手動輸入企業資料以納入 CRM 追蹤名單</p>
            </div>
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">公司全稱</label>
                  <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={newCompanyData.name} onChange={e => setNewCompanyData({...newCompanyData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">產業別</label>
                  <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={newCompanyData.industry} onChange={e => setNewCompanyData({...newCompanyData, industry: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">全球排名 / 優先度</label>
                  <input type="number" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={newCompanyData.rank} onChange={e => setNewCompanyData({...newCompanyData, rank: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">總部地點</label>
                  <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={newCompanyData.headquarters} onChange={e => setNewCompanyData({...newCompanyData, headquarters: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">官方網站</label>
                <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={newCompanyData.website} onChange={e => setNewCompanyData({...newCompanyData, website: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsAddingCompany(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-2xl text-xs font-black hover:bg-slate-200 transition-all">取消</button>
                <button onClick={handleAddCompany} className="flex-[2] py-3 bg-blue-600 text-white rounded-2xl text-xs font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">確認加入名單</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
