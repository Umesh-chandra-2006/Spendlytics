import { BrowserRouter, Routes, Route, useLocation, useParams, Link } from 'react-router-dom';
import SpendForm from './components/SpendForm';
import AuditResultsView from './components/AuditResultsView';
import { runAudit } from './lib/auditEngine';
import { usePersistedForm } from './lib/usePersistedForm';
import './App.css';

function AuditResultRoute() {
  const { id } = useParams();
  const location = useLocation();
  const stateResult = location.state?.result;
  const { formData } = usePersistedForm();

  // If we have it in router state, use it
  let audit = stateResult;

  // If not, compute it locally on the fly
  if (!audit) {
    const result = runAudit(formData);
    const topSaver = [...result.recommendations].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
    const aiSummary = result.savingsTier === 'optimal'
      ? `Your team of ${formData.teamSize} is running a lean AI stack for ${formData.useCase} work — no significant overspend detected. Your current tool choices are well-matched to your team size and use case.`
      : `Your team of ${formData.teamSize} is spending more than necessary on AI tools for ${formData.useCase} work. The biggest opportunity is ${topSaver?.tool ? topSaver.tool.toUpperCase() : 'your current stack'} — switching to the recommended plan saves $${result.totalMonthlySavings.toFixed(0)}/month.`;
    
    audit = {
      ...result,
      id,
      aiSummary
    };
  } else {
    audit = {
      ...audit,
      id
    };
  }

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto pt-8 px-4 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200 group">
          <span className="transform group-hover:-translate-x-1 transition-transform duration-200">&larr;</span> Back to form
        </Link>
      </div>
      <AuditResultsView audit={audit} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#030712] text-gray-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200 font-sans relative">
        {/* Universal Background radial glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none" />

        {/* Global Nav Bar */}
        <header className="sticky top-0 z-50 w-full glass-card border-b border-white/5 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-all duration-300">
                S
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">
                Spend<span className="text-indigo-400">Scope</span>
              </span>
            </Link>
            <nav className="flex items-center gap-6">
              <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Credex &rarr;
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<SpendForm />} />
            <Route path="/audit/:id" element={<AuditResultRoute />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="py-12 border-t border-white/5 bg-[#030712] relative z-10">
          <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">&copy; {new Date().getFullYear()} SpendScope. Powered by Credex.</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">Website</a>
              <span className="text-gray-800">|</span>
              <a href="/DEVLOG.md" target="_blank" className="hover:text-gray-300 transition-colors">Devlog</a>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
