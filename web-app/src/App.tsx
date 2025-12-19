import React, { useState, useEffect, useCallback } from 'react';
import { CommandBar } from './components/CommandBar';
import { AgentDashboard } from './components/AgentDashboard';
import { TaskManager } from './components/TaskManager';
import { AIToolHub } from './components/AIToolHub';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { BrowserCapture } from './components/BrowserCapture';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { NotificationCenter } from './components/NotificationCenter';
import { 
  fetchAgents, fetchTasks, fetchCapturedContent, fetchAITools, fetchKnowledgeNodes,
  updateTask, subscribeToAgents, subscribeToTasks, subscribeToCapturedContent, triggerAgent
} from './services/supabase';
import { agents as mockAgents, tasks as mockTasks, aiTools as mockTools, capturedContent as mockCaptures, projects, notifications, analyticsData } from './data/mockData';
import { Agent, Task, Notification } from './types';
import './App.css';

type ViewType = 'dashboard' | 'agents' | 'tasks' | 'ai-tools' | 'knowledge' | 'capture' | 'analytics';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isDark] = useState(true);
  const [agentList, setAgentList] = useState<Agent[]>(mockAgents);
  const [taskList, setTaskList] = useState<Task[]>(mockTasks);
  const [aiTools, setAiTools] = useState(mockTools);
  const [capturedContent, setCapturedContent] = useState(mockCaptures);
  const [knowledgeNodes, setKnowledgeNodes] = useState<any[]>([]);
  const [notificationList, setNotificationList] = useState<Notification[]>(notifications);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [agentsData, tasksData, toolsData, capturesData, nodesData] = await Promise.all([
          fetchAgents().catch(() => null),
          fetchTasks().catch(() => null),
          fetchAITools().catch(() => null),
          fetchCapturedContent().catch(() => null),
          fetchKnowledgeNodes().catch(() => null)
        ]);

        if (agentsData?.length) {
          setAgentList(agentsData.map((a: any) => ({
            id: a.id,
            name: a.name,
            type: a.type,
            status: a.status || 'idle',
            personality: a.personality || '',
            capabilities: a.capabilities || [],
            knowledgeBase: a.knowledge_base || [],
            lastActive: a.last_active,
            tasksCompleted: a.tasks_completed || 0,
            successRate: parseFloat(a.success_rate) || 0
          })));
        }

        if (tasksData?.length) {
          setTaskList(tasksData.map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description || '',
            level: t.level || 'task',
            status: t.status || 'pending',
            priority: t.priority || 'medium',
            assignedAgent: t.assigned_agent_id,
            project: t.project,
            createdAt: t.created_at,
            updatedAt: t.updated_at,
            tags: t.tags || []
          })));
        }

        if (toolsData?.length) {
          setAiTools(toolsData.map((t: any) => ({
            id: t.id,
            name: t.name,
            type: t.type,
            status: t.status || 'disconnected',
            lastSync: t.last_sync,
            conversationCount: t.conversation_count || 0,
            insights: t.insights || []
          })));
        }

        if (capturesData?.length) {
          setCapturedContent(capturesData.map((c: any) => ({
            id: c.id,
            url: c.url,
            title: c.title || 'Untitled',
            type: c.content_type || 'article',
            content: c.raw_content || '',
            capturedAt: c.captured_at,
            processedBy: c.processed_by,
            status: c.status || 'pending',
            notionPageId: c.notion_page_id
          })));
        }

        if (nodesData?.length) {
          setKnowledgeNodes(nodesData);
        }

        setConnectionStatus('connected');
      } catch (error) {
        console.error('Error loading data:', error);
        setConnectionStatus('disconnected');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    const agentSub = subscribeToAgents((payload) => {
      if (payload.eventType === 'UPDATE' && payload.new) {
        setAgentList(prev => prev.map(a => 
          a.id === payload.new.id ? { ...a, status: payload.new.status, lastActive: payload.new.last_active } : a
        ));
      }
    });

    const taskSub = subscribeToTasks((payload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        const newTask = {
          id: payload.new.id,
          title: payload.new.title,
          description: payload.new.description || '',
          level: payload.new.level || 'task',
          status: payload.new.status || 'pending',
          priority: payload.new.priority || 'medium',
          assignedAgent: payload.new.assigned_agent_id,
          project: payload.new.project,
          createdAt: payload.new.created_at,
          updatedAt: payload.new.updated_at,
          tags: payload.new.tags || []
        };
        setTaskList(prev => [...prev, newTask]);
        addNotification('New task created', `Task: ${newTask.title}`, 'info');
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        setTaskList(prev => prev.map(t => 
          t.id === payload.new.id ? { ...t, status: payload.new.status, updatedAt: payload.new.updated_at } : t
        ));
      }
    });

    const captureSub = subscribeToCapturedContent((payload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        const newCapture = {
          id: payload.new.id,
          url: payload.new.url,
          title: payload.new.title || 'Untitled',
          type: payload.new.content_type || 'article',
          content: payload.new.raw_content || '',
          capturedAt: payload.new.captured_at,
          status: payload.new.status || 'pending'
        };
        setCapturedContent(prev => [newCapture, ...prev]);
        addNotification('Content captured', `New ${newCapture.type} added`, 'success');
      }
    });

    return () => {
      agentSub.unsubscribe();
      taskSub.unsubscribe();
      captureSub.unsubscribe();
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsCommandOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simulate agent activity
  useEffect(() => {
    const interval = setInterval(() => {
      setAgentList(prev => prev.map(agent => ({
        ...agent,
        status: Math.random() > 0.85 ? 'processing' : agent.status === 'processing' && Math.random() > 0.4 ? 'active' : agent.status
      })));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const addNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
    const newNotification: Notification = {
      id: `n-${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      priority: type === 'error' ? 4 : type === 'warning' ? 3 : type === 'success' ? 2 : 1
    };
    setNotificationList(prev => [newNotification, ...prev]);
  };

  const handleViewChange = useCallback((view: ViewType) => {
    setCurrentView(view);
    setIsCommandOpen(false);
  }, []);

  const handleTaskUpdate = useCallback(async (taskId: string, updates: Partial<Task>) => {
    setTaskList(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    try {
      await updateTask(taskId, updates);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotificationList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const handleAgentTrigger = useCallback(async (agentType: string, action: string) => {
    try {
      const result = await triggerAgent(agentType, action);
      addNotification(`${agentType} Agent`, `Action completed: ${action}`, 'success');
      return result;
    } catch (error) {
      addNotification('Agent Error', `Failed to execute ${action}`, 'error');
    }
  }, []);

  const renderMainContent = () => {
    switch (currentView) {
      case 'agents':
        return <AgentDashboard agents={agentList} projects={projects} onTriggerAgent={handleAgentTrigger} />;
      case 'tasks':
        return <TaskManager tasks={taskList} agents={agentList} onTaskUpdate={handleTaskUpdate} />;
      case 'ai-tools':
        return <AIToolHub tools={aiTools} />;
      case 'knowledge':
        return <KnowledgeGraph nodes={knowledgeNodes} />;
      case 'capture':
        return <BrowserCapture content={capturedContent} />;
      case 'analytics':
        return <AnalyticsPanel data={analyticsData} agents={agentList} tasks={taskList} />;
      default:
        return (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <AgentDashboard agents={agentList} projects={projects} compact onTriggerAgent={handleAgentTrigger} />
            </div>
            <div className="col-span-12 lg:col-span-8">
              <TaskManager tasks={taskList.slice(0, 6)} agents={agentList} onTaskUpdate={handleTaskUpdate} compact />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <AIToolHub tools={aiTools} compact />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <BrowserCapture content={capturedContent.slice(0, 4)} compact />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <AnalyticsPanel data={analyticsData} agents={agentList} tasks={taskList} compact />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-zinc-100'} text-neutral-200 font-mono`}>
      <CommandBar
        isOpen={isCommandOpen}
        onToggle={() => setIsCommandOpen(!isCommandOpen)}
        onViewChange={handleViewChange}
        currentView={currentView}
      />
      
      <nav className="fixed top-12 left-0 right-0 z-40 border-b border-zinc-800 bg-black/95 backdrop-blur">
        <div className="max-w-[1800px] mx-auto px-4 flex items-center gap-1 h-10 overflow-x-auto">
          {(['dashboard', 'agents', 'tasks', 'ai-tools', 'knowledge', 'capture', 'analytics'] as ViewType[]).map(view => (
            <button
              key={view}
              onClick={() => handleViewChange(view)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors whitespace-nowrap ${
                currentView === view 
                  ? 'text-cyan-400 border-b-2 border-cyan-400' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {view.replace('-', ' ')}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            <span className={`flex items-center gap-1.5 text-[10px] ${
              connectionStatus === 'connected' ? 'text-green-400' : 
              connectionStatus === 'loading' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400' : 
                connectionStatus === 'loading' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'
              }`} />
              {connectionStatus.toUpperCase()}
            </span>
            <NotificationCenter 
              notifications={notificationList} 
              onMarkRead={markNotificationRead} 
            />
          </div>
        </div>
      </nav>

      <main className="pt-24 px-4 pb-12 max-w-[1800px] mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-500 text-sm">Initializing KronoSave Intelligence Hub...</p>
            </div>
          </div>
        ) : (
          renderMainContent()
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 h-6 bg-zinc-900 border-t border-zinc-800 flex items-center px-4 text-[10px] text-zinc-500 font-mono">
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {connectionStatus === 'connected' ? 'System Active' : 'Offline Mode'}
        </span>
        <span className="mx-4 hidden sm:inline">|</span>
        <span className="hidden sm:inline">{agentList.filter(a => a.status === 'active' || a.status === 'processing').length}/4 Agents Online</span>
        <span className="mx-4 hidden md:inline">|</span>
        <span className="hidden md:inline">{taskList.filter(t => t.status === 'in-progress').length} Tasks Running</span>
        <span className="mx-4 hidden lg:inline">|</span>
        <span className="hidden lg:inline">{capturedContent.filter(c => c.status === 'pending' || c.status === 'review-needed').length} Pending Review</span>
        <span className="ml-auto">[Ctrl+K] Command</span>
      </footer>
    </div>
  );
}

export default App;