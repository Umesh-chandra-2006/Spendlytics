import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import type { AuditResult, AuditFormData } from './types';

const DATA_DIR = path.join(__dirname, '..', 'data');
const AUDITS_FILE = path.join(DATA_DIR, 'audits.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize Supabase Client if env vars are present
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '';
const useSupabase = !!(supabaseUrl && supabaseKey);

const supabase = useSupabase ? createClient(supabaseUrl, supabaseKey) : null;

if (useSupabase) {
  console.log('Supabase integration enabled in backend.');
} else {
  console.log('Supabase environment variables missing. Falling back to local file-based database.');
}

export async function saveAudit(id: string, auditData: AuditResult, formData: AuditFormData) {
  if (supabase) {
    try {
      const { error } = await supabase.from('audits').insert({
        id,
        tools: formData.tools,
        results: auditData.recommendations,
        total_monthly_savings: auditData.totalMonthlySavings,
        total_annual_savings: auditData.totalAnnualSavings,
        ai_summary: auditData.aiSummary,
        team_size: formData.teamSize,
        use_case: formData.useCase,
      });
      if (error) {
        console.error('Error saving audit to Supabase:', error);
      } else {
        console.log(`Saved audit ${id} to Supabase successfully.`);
      }
    } catch (err) {
      console.error('Supabase exception saving audit:', err);
    }
  }

  // Always write locally as backup/fallback
  try {
    let audits: any[] = [];
    if (fs.existsSync(AUDITS_FILE)) {
      try {
        const fileContent = fs.readFileSync(AUDITS_FILE, 'utf8');
        audits = fileContent ? JSON.parse(fileContent) : [];
      } catch (e) {
        console.warn('Failed to parse local audits file, starting fresh', e);
      }
    }
    audits.push({
      id,
      createdAt: new Date().toISOString(),
      formData,
      result: auditData,
    });
    fs.writeFileSync(AUDITS_FILE, JSON.stringify(audits, null, 2), 'utf8');
    console.log(`Saved audit ${id} locally.`);
  } catch (err) {
    console.error('Failed to save audit locally:', err);
  }
}

export async function getAudit(id: string): Promise<AuditResult | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        console.log(`Loaded audit ${id} from Supabase.`);
        return {
          id: data.id,
          recommendations: data.results,
          totalMonthlySavings: Number(data.total_monthly_savings),
          totalAnnualSavings: Number(data.total_annual_savings),
          savingsTier: data.total_monthly_savings < 100 ? 'optimal' : data.total_monthly_savings < 500 ? 'medium' : 'high',
          aiSummary: data.ai_summary,
          createdAt: data.created_at
        };
      } else if (error) {
        console.warn(`Could not load audit ${id} from Supabase, attempting local file read: ${error.message}`);
      }
    } catch (err) {
      console.error('Supabase exception reading audit:', err);
    }
  }

  try {
    if (fs.existsSync(AUDITS_FILE)) {
      const fileContent = fs.readFileSync(AUDITS_FILE, 'utf8');
      const audits = fileContent ? JSON.parse(fileContent) : [];
      const found = audits.find((a: any) => a.id === id);
      if (found) {
        console.log(`Loaded audit ${id} from local file.`);
        return found.result;
      }
    }
  } catch (err) {
    console.error('Failed to read audit locally:', err);
  }
  return null;
}

export async function saveLead(leadData: any) {
  if (supabase) {
    try {
      const { error } = await supabase.from('leads').insert({
        audit_id: leadData.auditId,
        email: leadData.email,
        company_name: leadData.companyName,
        role: leadData.role,
        monthly_savings: leadData.monthlySavings,
      });
      if (error) {
        console.error('Error saving lead to Supabase:', error);
      } else {
        console.log('Saved lead to Supabase successfully.');
      }
    } catch (err) {
      console.error('Supabase exception saving lead:', err);
    }
  }

  try {
    let leads: any[] = [];
    if (fs.existsSync(LEADS_FILE)) {
      try {
        const fileContent = fs.readFileSync(LEADS_FILE, 'utf8');
        leads = fileContent ? JSON.parse(fileContent) : [];
      } catch (e) {
        console.warn('Failed to parse local leads file, starting fresh', e);
      }
    }
    leads.push({
      id: new Date().getTime().toString(),
      createdAt: new Date().toISOString(),
      ...leadData,
    });
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
    console.log('Saved lead locally.');
  } catch (err) {
    console.error('Failed to save lead locally:', err);
  }
}
