import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { runAudit } from './src/auditEngine';
import { generateSummary } from './src/generateSummary';
import { AuditFormData } from './src/types';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/audit', async (req, res) => {
  try {
    const body: AuditFormData = req.body;
    if (!body.tools || !Array.isArray(body.tools) || body.tools.length === 0) {
      return res.status(400).json({ error: 'No tools provided' });
    }

    const result = runAudit(body);
    const aiSummary = await generateSummary(body, result);
    result.aiSummary = aiSummary;

    // TODO: Implement actual Supabase insert if needed. For now we generate a UUID so the frontend can redirect.
    const id = uuidv4();

    res.json({ result, id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
