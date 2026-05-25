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
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-2xl mx-auto pt-6 px-4">
        <Link to="/" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
          ← Back to form
        </Link>
      </div>
      <AuditResultsView audit={audit} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<SpendForm />} />
          <Route path="/audit/:id" element={<AuditResultRoute />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
