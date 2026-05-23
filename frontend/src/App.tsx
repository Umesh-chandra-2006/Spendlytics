import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SpendForm from './components/SpendForm';
import './App.css';

function AuditResultRoute() {
  // In a complete implementation, this would fetch the audit result by ID from the backend
  // Since we are mocking the backend persistence, we just show a placeholder here.
  return (
    <div className="p-12 text-center text-gray-500">
      <h2 className="text-2xl font-bold text-black mb-4">Audit Saved</h2>
      <p>Your audit has been successfully generated.</p>
      <p className="mt-2 text-sm">(Full persistence and fetching by ID can be connected to Supabase here)</p>
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
