import { describe, it, expect } from 'vitest';
import { runAudit } from './auditEngine';
import type { AuditFormData } from '../types';

describe('auditEngine', () => {
  it('1. should downgrade Claude Max to Pro for a single user', () => {
    const formData: AuditFormData = {
      teamSize: 1,
      useCase: 'mixed',
      tools: [
        { tool: 'claude', plan: 'max', monthlySpend: 100, seats: 1 }
      ]
    };
    const result = runAudit(formData);
    
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].action).toBe('downgrade');
    expect(result.recommendations[0].recommendedPlan).toBe('Pro');
    expect(result.recommendations[0].monthlySavings).toBe(80); // 100 - 20
    expect(result.totalMonthlySavings).toBe(80);
  });

  it('2. should keep an optimal stack without unnecessary changes', () => {
    const formData: AuditFormData = {
      teamSize: 1,
      useCase: 'writing',
      tools: [
        { tool: 'claude', plan: 'pro', monthlySpend: 20, seats: 1 }
      ]
    };
    const result = runAudit(formData);
    
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].action).toBe('keep');
    expect(result.recommendations[0].monthlySavings).toBe(0);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.savingsTier).toBe('optimal');
  });

  it('3. should flag overlapping Copilot redundant usage if Cursor is present', () => {
    const formData: AuditFormData = {
      teamSize: 3,
      useCase: 'coding',
      tools: [
        { tool: 'cursor', plan: 'pro', monthlySpend: 60, seats: 3 },
        { tool: 'github_copilot', plan: 'business', monthlySpend: 57, seats: 3 }
      ]
    };
    const result = runAudit(formData);
    
    // The engine's cross-tool overlap logic flags Copilot if coding and Cursor exists
    const copilotRec = result.recommendations.find(r => r.tool === 'github_copilot');
    expect(copilotRec).toBeDefined();
    expect(copilotRec?.reason).toMatch(/redundant completions/i);
    // Overlap doesn't strictly project savings automatically in current logic, but warns the user
    expect(copilotRec?.action).toBe('keep'); // Wait, the current logic actually says 'keep' with a warning reason.
  });

  it('4. should downgrade ChatGPT Team to Plus if there are only 2 seats', () => {
    const formData: AuditFormData = {
      teamSize: 2,
      useCase: 'mixed',
      tools: [
        { tool: 'chatgpt', plan: 'team', monthlySpend: 40, seats: 2 }
      ]
    };
    const result = runAudit(formData);
    
    const chatgptRec = result.recommendations[0];
    expect(chatgptRec.action).toBe('downgrade');
    expect(chatgptRec.recommendedPlan).toBe('Plus (individual)');
    // 2 Plus plans = $40. Current spend = 40. Savings = 0, but action is downgrade.
    // Let's test the projected spend matches PRICING constant (20 * 2 = 40).
    expect(chatgptRec.projectedSpend).toBe(40);
  });

  it('5. should optimize direct API spend if it exceeds $200/mo', () => {
    const formData: AuditFormData = {
      teamSize: 5,
      useCase: 'mixed',
      tools: [
        { tool: 'openai_api', plan: 'api_direct', monthlySpend: 500, seats: 5 }
      ]
    };
    const result = runAudit(formData);
    
    const apiRec = result.recommendations[0];
    expect(apiRec.action).toBe('optimize');
    expect(apiRec.monthlySavings).toBe(150); // 30% of 500
    expect(result.totalMonthlySavings).toBe(150);
    expect(result.savingsTier).toBe('medium');
  });
});
