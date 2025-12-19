import React, { useState } from 'react';
import { Agent, Project } from '../types';
import { Bot, Cpu, BarChart3, Users, Activity, CheckCircle, Zap, Play, RefreshCw, Settings } from 'lucide-react';

interface AgentDashboardProps {
  agents: Agent[];
  projects: Project[];
  compact?: boolean;
  onTriggerAgent?: (agentType: string, action: string) => Promise<any>;
}

const agentIcons: Record<string, React.ReactNode> = {
  andraia: <Bot className="w-5 h-5" />,
  megalith: <Cpu className="w-5 h-5" />,
  appraise: <BarChart3 className="w-5 h-5" />,
  agora: <Users className="w-5 h-5" />,
};

const agentColors: Record<string, string> = {
  andraia: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
  megalith: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  appraise: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  agora: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-500',
  processing: 'bg-cyan-500 animate-pulse',
  idle: 'bg-zinc-500',
  error: 'bg-red-500',
};

const agentActions: Record<string, string[]> = {
  andraia: ['analyze-tool', 'get-pending', 'research'],
  megalith: ['create-task', 'deploy', 'integrate'],
  appraise: ['evaluate', 'benchmark', 'report'],
  agora: ['coordinate', 'notify', 'schedule'],
};

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ agents, projects, compact, onTriggerAgent }) => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleTrigger = async (agentType: string, action: string) => {
    if (!onTriggerAgent) return;
    setLoadingAction(`${agentType}-${action}`);
    try {
      await onTriggerAgent(agentType, action);
    } finally {
      setLoadingAction(null);
    }
  };

  if (compact) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded p-4">
        <h2 className="text-xs uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          Autonomous Agents
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {agents.map(agent => (
            <div 
              key={agent.id} 
              className={`p-3 rounded border ${agentColors[agent.type]} cursor-pointer hover:border-opacity-60 transition-all`}
              onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
            >
              <div className="flex items-center justify-between mb-2">
                {agentIcons[agent.type]}
                <span className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
              </div>
              <div className="text-sm font-medium">{agent.name}</div>
              <div className="text-[10px] text-zinc-500 mt-1">
                {agent.currentTask ? 'Working...' : agent.status}
              </div>
              {selectedAgent === agent.id && onTriggerAgent && (
                <div className="mt-2 pt-2 border-t border-zinc-700 flex flex-wrap gap-1">
                  {agentActions[agent.type]?.slice(0, 2).map(action => (
                    <button
                      key={action}
                      onClick={(e) => { e.stopPropagation(); handleTrigger(agent.type, action); }}
                      disabled={loadingAction === `${agent.type}-${action}`}
                      className="px-1.5 py-0.5 text-[9px] bg-zinc-800 hover:bg-zinc-700 rounded transition-colors disabled:opacity-50"
                    >
                      {loadingAction === `${agent.type}-${action}` ? '...' : action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-zinc-200 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Autonomous Agent Ecosystem
        </h2>
        <span className="text-xs text-zinc-500">
          {agents.filter(a => a.status === 'active' || a.status === 'processing').length} Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map(agent => {
          const project = projects.find(p => p.agent === agent.id);
          return (
            <div key={agent.id} className={`p-5 rounded-lg border ${agentColors[agent.type]} bg-zinc-900/50`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${agentColors[agent.type]}`}>
                    {agentIcons[agent.type]}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{agent.name}</h3>
                    <p className="text-xs text-zinc-500">{agent.type.charAt(0).toUpperCase() + agent.type.slice(1)} Agent</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${statusColors[agent.status]}`} />
                  <span className="text-xs capitalize text-zinc-400">{agent.status}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 mb-4 line-clamp-2">{agent.personality}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {agent.capabilities.slice(0, 3).map((cap, i) => (
                  <span key={i} className="px-2 py-0.5 text-[10px] bg-zinc-800 rounded text-zinc-400">
                    {cap}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-zinc-800">
                <div>
                  <div className="text-lg font-bold text-zinc-200">{agent.tasksCompleted}</div>
                  <div className="text-[10px] text-zinc-500">Tasks Done</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-400">{agent.successRate}%</div>
                  <div className="text-[10px] text-zinc-500">Success</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-zinc-200">{project?.progress || 0}%</div>
                  <div className="text-[10px] text-zinc-500">Project</div>
                </div>
              </div>

              {agent.currentTask && (
                <div className="mt-3 p-2 bg-zinc-800/50 rounded flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span className="text-xs text-zinc-300 truncate">{agent.currentTask.title}</span>
                </div>
              )}

              {onTriggerAgent && (
                <div className="mt-3 pt-3 border-t border-zinc-800">
                  <div className="text-[10px] text-zinc-500 mb-2">Quick Actions</div>
                  <div className="flex flex-wrap gap-1.5">
                    {agentActions[agent.type]?.map(action => (
                      <button
                        key={action}
                        onClick={() => handleTrigger(agent.type, action)}
                        disabled={loadingAction === `${agent.type}-${action}`}
                        className="flex items-center gap-1 px-2 py-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 rounded transition-colors disabled:opacity-50"
                      >
                        {loadingAction === `${agent.type}-${action}` ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mt-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          Project Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {projects.map(project => (
            <div key={project.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">{project.name}</span>
                <span className="text-xs text-zinc-500">{project.progress}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="text-[10px] text-zinc-500">
                {project.completedTasks}/{project.tasks} tasks
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};