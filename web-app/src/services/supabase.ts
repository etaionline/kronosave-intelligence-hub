import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lblbfcbbwcjamfnvfjpm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxibGJmY2Jid2NqYW1mbnZmanBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjA1NTIsImV4cCI6MjA3MDkzNjU1Mn0.ZgQNgyFZXGGCgdcxUMEn42f2foI-AdbSSXqzWtWY-PE';

export const supabase = createClient(supabaseUrl, supabaseKey);
export const FUNCTIONS_URL = `${supabaseUrl}/functions/v1`;

export const fetchAgents = async () => {
  const { data, error } = await supabase.from('agents').select('*').order('name');
  if (error) throw error;
  return data;
};

export const fetchTasks = async () => {
  const { data, error } = await supabase.from('tasks').select('*').order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
};

export const updateTask = async (id: string, updates: any) => {
  const { data, error } = await supabase.from('tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select();
  if (error) throw error;
  return data;
};

export const fetchCapturedContent = async () => {
  const { data, error } = await supabase.from('captured_content').select('*').order('captured_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const processCapture = async (url: string, title: string, content: string) => {
  const response = await fetch(`${FUNCTIONS_URL}/process-capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
    body: JSON.stringify({ url, title, content })
  });
  return response.json();
};

export const fetchAITools = async () => {
  const { data, error } = await supabase.from('ai_tools').select('*');
  if (error) throw error;
  return data;
};

export const fetchKnowledgeNodes = async () => {
  const { data, error } = await supabase.from('knowledge_nodes').select('*');
  if (error) throw error;
  return data;
};

export const triggerAgent = async (agentType: string, action: string, data: any = {}) => {
  const response = await fetch(`${FUNCTIONS_URL}/agent-process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
    body: JSON.stringify({ agentType, action, data })
  });
  return response.json();
};

export const subscribeToAgents = (callback: (payload: any) => void) => {
  return supabase.channel('agents-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, callback).subscribe();
};

export const subscribeToTasks = (callback: (payload: any) => void) => {
  return supabase.channel('tasks-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, callback).subscribe();
};

export const subscribeToCapturedContent = (callback: (payload: any) => void) => {
  return supabase.channel('captured-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'captured_content' }, callback).subscribe();
};