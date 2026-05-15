import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Heart, User, TrendingUp, Sparkles, BookOpen, Server, Users, Briefcase,
  Search, Calendar, BarChart3, List, Bell, ChevronDown, ChevronRight, ChevronLeft,
  Plus, Minus, X, Settings, Crosshair, Target, Compass, Flag, Zap, Menu, Brain,
  Play, Pause, Check, Circle, AlertCircle, Trash2, Save, ExternalLink, ArrowRight,
  GripVertical, Activity, Droplet, Moon, ArrowLeft, Wrench,
  Rocket, PenTool, Image as ImageIcon, Coins,
  Upload, Download, LayoutGrid, Rows3, Tag as TagIcon, Globe, Github,
  FileJson, Star, Eye, Camera, RefreshCw, Loader, Trophy
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  bg: '#0A0B0F', surface: '#13141A', surfaceHi: '#1C1D26', surfaceHi2: '#22232C',
  border: '#272832', borderDim: '#1A1B22', borderHair: '#15161D',
  text: '#FFFFFF', textMid: '#C5C6CE', textDim: '#7A7B83', textFaint: '#4D4E55',
  health: '#5EE7A0', self: '#EA8FC8', wealth: '#F4C76C', creative: '#B58FE9',
  knowledge: '#6FDDD6', infra: '#F49A6C', network: '#82A4F8', business: '#E8B07A',
  done: '#5EE7A0', progress: '#F4C76C', danger: '#FF6B6B',
  // Priority palette
  pCritical: '#FF6B6B', pHigh: '#F4C76C', pNormal: '#82A4F8', pLow: '#7A7B83',
  // Deploy palette
  deployLive: '#5EE7A0', deployPending: '#F4C76C', deployFailed: '#FF6B6B', deployNone: '#4D4E55'
};

const PRIORITY = {
  critical: { label: 'Critical', color: T.pCritical },
  high:     { label: 'High',     color: T.pHigh },
  normal:   { label: 'Normal',   color: T.pNormal },
  low:      { label: 'Low',      color: T.pLow }
};

const DEPLOY = {
  none:    { label: 'Not deployed', color: T.deployNone },
  pending: { label: 'Deploying',    color: T.deployPending },
  live:    { label: 'Live',         color: T.deployLive },
  failed:  { label: 'Failed',       color: T.deployFailed }
};

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────────────────────────────────────
const today = new Date();
const monthFromToday = (n) => {
  const d = new Date(today); d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
};

const DEFAULT_DOMAINS = [
  { id: 'health',    name: 'Health',         color: T.health,    iconKey: 'Heart',      vision: 'I embody vibrant health, peak performance, and longevity to live a life of limitless impact.' },
  { id: 'self',      name: 'Self',           color: T.self,      iconKey: 'User',       vision: 'Identity reprogrammed for the version of me that has already arrived.' },
  { id: 'wealth',    name: 'Wealth',         color: T.wealth,    iconKey: 'TrendingUp', vision: '$10M liquid by 2030. Financial freedom, global mobility.' },
  { id: 'creative',  name: 'Creative',       color: T.creative,  iconKey: 'Sparkles',   vision: 'Build creative engines that compound — taste, story, voice, image.' },
  { id: 'knowledge', name: 'Knowledge',      color: T.knowledge, iconKey: 'BookOpen',   vision: 'Second brain that thinks with me. Every insight findable.' },
  { id: 'infra',     name: 'Infrastructure', color: T.infra,     iconKey: 'Server',     vision: 'Empire runs on rails: ship → deploy → live in seconds.' },
  { id: 'business',  name: 'Business',       color: T.business,  iconKey: 'Briefcase',  vision: 'Move the portfolio from internal tools to public products with revenue.' },
  { id: 'network',   name: 'Network',        color: T.network,   iconKey: 'Users',      vision: 'Right rooms, right people, compounding signal.' }
];

const DEFAULT_TRACKS = [
  // Health
  { id: 'th1', domainId: 'health',   name: 'Biohacking',   iconKey: 'Activity' },
  { id: 'th2', domainId: 'health',   name: 'Peptides',     iconKey: 'Droplet' },
  { id: 'th3', domainId: 'health',   name: 'Recovery',     iconKey: 'Moon' },
  { id: 'th4', domainId: 'health',   name: 'Longevity',    iconKey: 'Heart' },
  // Self
  { id: 'ts1', domainId: 'self',     name: 'Identity',     iconKey: 'User' },
  { id: 'ts2', domainId: 'self',     name: 'Mind',         iconKey: 'Brain' },
  { id: 'ts3', domainId: 'self',     name: 'Habits',       iconKey: 'Activity' },
  // Wealth
  { id: 'tw1', domainId: 'wealth',   name: 'Trading',      iconKey: 'TrendingUp' },
  { id: 'tw2', domainId: 'wealth',   name: 'Income',       iconKey: 'Coins' },
  { id: 'tw3', domainId: 'wealth',   name: 'Investment',   iconKey: 'BarChart3' },
  // Creative
  { id: 'tc1', domainId: 'creative', name: 'Engines',      iconKey: 'Zap' },
  { id: 'tc2', domainId: 'creative', name: 'Visual',       iconKey: 'ImageIcon' },
  { id: 'tc3', domainId: 'creative', name: 'Writing',      iconKey: 'PenTool' },
  // Knowledge
  { id: 'tk1', domainId: 'knowledge', name: 'Second Brain',iconKey: 'Brain' },
  { id: 'tk2', domainId: 'knowledge', name: 'Learning',    iconKey: 'BookOpen' },
  // Infrastructure
  { id: 'ti1', domainId: 'infra',    name: 'Deployment',   iconKey: 'Server' },
  { id: 'ti2', domainId: 'infra',    name: 'Tools',        iconKey: 'Wrench' },
  { id: 'ti3', domainId: 'infra',    name: 'Cockpit',      iconKey: 'Target' },
  // Business
  { id: 'tb1', domainId: 'business', name: 'Brand',        iconKey: 'Sparkles' },
  { id: 'tb2', domainId: 'business', name: 'Products',     iconKey: 'Briefcase' },
  { id: 'tb3', domainId: 'business', name: 'Launch',       iconKey: 'Rocket' },
  // Network
  { id: 'tn1', domainId: 'network',  name: 'Community',    iconKey: 'Users' },
  { id: 'tn2', domainId: 'network',  name: 'Connections',  iconKey: 'Compass' },
];

const DEFAULT_PROJECTS = [
  { id: 'p1',  domainId: 'health',    trackId: 'th2', name: 'Peptide Companion',        type: 'App',       status: 'active',  startDate: monthFromToday(-2), endDate: monthFromToday(2),  progress: 70, scores: { impact: 8, ease: 6, revenue: 7, strategicFit: 9, momentum: 7, excitement: 8 }, keystoneSkills: ['s1'], builds: ['b1'], flywheelStage: 'f1-2', chatUrl: 'https://claude.ai/chat/0ea37d0b-8d2d-4b46-9264-088b66c04c1a', description: 'A pocket guide to peptide protocols — dose, timing, stack interactions, and personal logs. Built for self-experimenters who need clarity, not noise.', tags: ['biohacking','wellness','flagship','iOS'], priority: 'high', techStack: ['React Native','Supabase','GPT-4'], liveUrl: 'https://peptide.scottelling.com', githubUrl: 'https://github.com/scottelling/peptide-companion', deployStatus: 'live' },
  { id: 'p2',  domainId: 'health',    trackId: 'th1', name: 'Vitality OS',              type: 'OS',        status: 'planned', startDate: monthFromToday(1),  endDate: monthFromToday(8),  progress: 10, scores: { impact: 9, ease: 4, revenue: 8, strategicFit: 10, momentum: 4, excitement: 9 }, keystoneSkills: ['s1','s2'], builds: ['b1'], flywheelStage: null, chatUrl: '' },
  { id: 'p3',  domainId: 'health',    trackId: 'th4', name: 'Longevity Protocol',       type: 'Skill',     status: 'active',  startDate: monthFromToday(-6), endDate: monthFromToday(18), progress: 30, scores: { impact: 9, ease: 6, revenue: 5, strategicFit: 9, momentum: 6, excitement: 8 }, keystoneSkills: ['s1'], builds: ['b1'], flywheelStage: null, chatUrl: '' },
  { id: 'p3b', domainId: 'health',    trackId: 'th3', name: 'Sleep Optimization',       type: 'Skill',     status: 'active',  startDate: monthFromToday(-4), endDate: monthFromToday(12), progress: 55, scores: { impact: 8, ease: 7, revenue: 3, strategicFit: 8, momentum: 8, excitement: 7 }, keystoneSkills: ['s1'], builds: ['b1'], flywheelStage: null, chatUrl: '' },
  { id: 'p4',  domainId: 'self',      trackId: 'ts2', name: 'MindScript',               type: 'Engine',    status: 'active',  startDate: monthFromToday(-4), endDate: monthFromToday(4),  progress: 55, scores: { impact: 10, ease: 7, revenue: 6, strategicFit: 10, momentum: 8, excitement: 10 }, keystoneSkills: ['s2'], builds: ['b2'], flywheelStage: 'f2-1', chatUrl: 'https://claude.ai/chat/f2d63f54-ec6c-4940-bd7b-bb7aed7dcbfd', description: 'Identity-rewiring engine. Generate, refine, and run personalized scripts that reprogram self-concept toward the version of you that has already arrived.', tags: ['identity','cognition','flagship','engine'], priority: 'critical', techStack: ['Next.js','Claude API','PostgreSQL'], liveUrl: 'https://mindscript.scottelling.com', githubUrl: 'https://github.com/scottelling/mindscript', deployStatus: 'live' },
  { id: 'p5',  domainId: 'self',      trackId: 'ts2', name: 'Dream Machine',            type: 'Engine',    status: 'paused',  startDate: monthFromToday(-1), endDate: monthFromToday(3),  progress: 30, scores: { impact: 7, ease: 5, revenue: 4, strategicFit: 7, momentum: 3, excitement: 8 }, keystoneSkills: ['s2'], builds: [], flywheelStage: null, chatUrl: '' },
  { id: 'p6',  domainId: 'self',      trackId: 'ts1', name: 'Identity Forge',           type: 'Framework', status: 'planned', startDate: monthFromToday(2),  endDate: monthFromToday(10), progress: 5,  scores: { impact: 9, ease: 5, revenue: 4, strategicFit: 9, momentum: 3, excitement: 9 }, keystoneSkills: ['s2'], builds: ['b2'], flywheelStage: null, chatUrl: '' },
  { id: 'p6b', domainId: 'self',      trackId: 'ts3', name: 'Daily Protocol',           type: 'Framework', status: 'active',  startDate: monthFromToday(-5), endDate: monthFromToday(15), progress: 60, scores: { impact: 9, ease: 6, revenue: 2, strategicFit: 9, momentum: 8, excitement: 8 }, keystoneSkills: ['s2'], builds: ['b2'], flywheelStage: null, chatUrl: '' },
  { id: 'p7',  domainId: 'wealth',    trackId: 'tw1', name: 'Personal Trading Terminal',type: 'App',       status: 'active',  startDate: monthFromToday(-1), endDate: monthFromToday(5),  progress: 40, scores: { impact: 8, ease: 5, revenue: 9, strategicFit: 8, momentum: 6, excitement: 7 }, keystoneSkills: ['s3'], builds: ['b3'], flywheelStage: null, chatUrl: '' },
  { id: 'p8',  domainId: 'wealth',    trackId: 'tw1', name: 'Oracle v5',                type: 'Engine',    status: 'active',  startDate: monthFromToday(-3), endDate: monthFromToday(6),  progress: 60, scores: { impact: 9, ease: 4, revenue: 9, strategicFit: 9, momentum: 7, excitement: 9 }, keystoneSkills: ['s3'], builds: ['b3'], flywheelStage: 'f3-2', chatUrl: '', description: 'Market-read engine — price action, flow, and macro fused into a single tradable signal. The fifth iteration; first that consistently outperforms baseline.', tags: ['trading','signals','flagship','engine'], priority: 'critical', techStack: ['Python','TensorFlow','PostgreSQL','TradingView'], liveUrl: '', githubUrl: 'https://github.com/scottelling/oracle', deployStatus: 'pending' },
  { id: 'p9',  domainId: 'wealth',    trackId: 'tw1', name: 'MiroFish / OASIS',         type: 'Engine',    status: 'planned', startDate: monthFromToday(3),  endDate: monthFromToday(12), progress: 5,  scores: { impact: 8, ease: 3, revenue: 8, strategicFit: 8, momentum: 2, excitement: 7 }, keystoneSkills: ['s3'], builds: ['b3'], flywheelStage: null, chatUrl: '' },
  { id: 'p9b', domainId: 'wealth',    trackId: 'tw2', name: 'Revenue Engine',           type: 'Framework', status: 'planned', startDate: monthFromToday(1),  endDate: monthFromToday(7),  progress: 0,  scores: { impact: 9, ease: 5, revenue: 9, strategicFit: 9, momentum: 2, excitement: 8 }, keystoneSkills: ['s5'], builds: ['b3'], flywheelStage: 'f1-3', chatUrl: '' },
  { id: 'p10', domainId: 'creative',  trackId: 'tc1', name: 'Genome',                   type: 'Engine',    status: 'active',  startDate: monthFromToday(-5), endDate: monthFromToday(3),  progress: 75, scores: { impact: 9, ease: 4, revenue: 5, strategicFit: 9, momentum: 7, excitement: 9 }, keystoneSkills: ['s4'], builds: ['b4'], flywheelStage: 'f4-1', chatUrl: '', description: 'Generate variations of a creative artifact across taste dimensions — same idea, twenty cuts. Picks the one that lands.', tags: ['creative','generative','flagship'], priority: 'high', techStack: ['Next.js','Claude API','Replicate'], liveUrl: 'https://genome.scottelling.com', githubUrl: 'https://github.com/scottelling/genome', deployStatus: 'live' },
  { id: 'p11', domainId: 'creative',  trackId: 'tc2', name: 'Taste Engine',             type: 'Engine',    status: 'planned', startDate: monthFromToday(0),  endDate: monthFromToday(7),  progress: 15, scores: { impact: 8, ease: 4, revenue: 5, strategicFit: 8, momentum: 5, excitement: 8 }, keystoneSkills: ['s4'], builds: ['b4'], flywheelStage: null, chatUrl: '' },
  { id: 'p12', domainId: 'creative',  trackId: 'tc3', name: 'Story Engine',             type: 'Engine',    status: 'active',  startDate: monthFromToday(-2), endDate: monthFromToday(6),  progress: 50, scores: { impact: 8, ease: 5, revenue: 6, strategicFit: 8, momentum: 6, excitement: 8 }, keystoneSkills: ['s5'], builds: ['b5'], flywheelStage: 'f5-1', chatUrl: '' },
  { id: 'p13', domainId: 'creative',  trackId: 'tc1', name: 'Immersion Engine',         type: 'Engine',    status: 'paused',  startDate: monthFromToday(-3), endDate: monthFromToday(2),  progress: 35, scores: { impact: 8, ease: 4, revenue: 5, strategicFit: 7, momentum: 3, excitement: 7 }, keystoneSkills: ['s5'], builds: ['b5'], flywheelStage: null, chatUrl: '' },
  { id: 'p14', domainId: 'knowledge', trackId: 'tk1', name: 'Eagle Eye / Legend',       type: 'OS',        status: 'active',  startDate: monthFromToday(-6), endDate: monthFromToday(12), progress: 45, scores: { impact: 10, ease: 3, revenue: 6, strategicFit: 10, momentum: 5, excitement: 9 }, keystoneSkills: ['s6'], builds: ['b6'], flywheelStage: null, chatUrl: '', description: 'The map of maps. Every project, every connection, every flywheel — one zoomable canvas with semantic search.', tags: ['cockpit','knowledge','flagship','OS'], priority: 'high', techStack: ['React','D3','Pinecone'], liveUrl: '', githubUrl: 'https://github.com/scottelling/eagle-eye', deployStatus: 'pending' },
  { id: 'p15', domainId: 'knowledge', trackId: 'tk1', name: 'Second Brain Index',       type: 'Framework', status: 'active',  startDate: monthFromToday(-2), endDate: monthFromToday(8),  progress: 25, scores: { impact: 8, ease: 5, revenue: 4, strategicFit: 9, momentum: 5, excitement: 7 }, keystoneSkills: ['s6'], builds: ['b6'], flywheelStage: null, chatUrl: '' },
  { id: 'p15b',domainId: 'knowledge', trackId: 'tk2', name: 'Learning Stack',           type: 'Skill',     status: 'active',  startDate: monthFromToday(-1), endDate: monthFromToday(11), progress: 20, scores: { impact: 7, ease: 7, revenue: 2, strategicFit: 7, momentum: 6, excitement: 7 }, keystoneSkills: ['s6'], builds: ['b6'], flywheelStage: null, chatUrl: '' },
  { id: 'p16', domainId: 'infra',     trackId: 'ti1', name: 'Portfolio Site',           type: 'App',       status: 'active',  startDate: monthFromToday(-8), endDate: monthFromToday(10), progress: 65, scores: { impact: 7, ease: 4, revenue: 5, strategicFit: 9, momentum: 7, excitement: 7 }, keystoneSkills: ['s7'], builds: ['b7'], flywheelStage: null, chatUrl: 'https://claude.ai/chat/e9689542-f13a-4f43-8c7c-2d1e2bc96e8e', description: 'scottelling.com — the public face of the empire. Subdomain-per-product wildcard DNS already live; portfolio shell shipping next.', tags: ['public','infra','flagship'], priority: 'high', techStack: ['Next.js','Vercel','Tailwind'], liveUrl: 'https://scottelling.com', githubUrl: 'https://github.com/scottelling/portfolio', deployStatus: 'live' },
  { id: 'p17', domainId: 'infra',     trackId: 'ti3', name: 'Constellation Map',        type: 'Tool',      status: 'active',  startDate: monthFromToday(-1), endDate: monthFromToday(2),  progress: 80, scores: { impact: 7, ease: 7, revenue: 3, strategicFit: 9, momentum: 8, excitement: 8 }, keystoneSkills: ['s8'], builds: ['b8'], flywheelStage: null, chatUrl: 'https://claude.ai/chat/366811d5-399d-4752-90a8-556cf17f6807', description: 'Spatial navigator for the portfolio — map view, outline view, manifesto view. Drag to reposition, search to filter, daily manifesto on launch.', tags: ['cockpit','navigation','flagship','tool'], priority: 'high', techStack: ['React','Framer Motion','localStorage'], liveUrl: 'https://constellation.scottelling.com', githubUrl: 'https://github.com/scottelling/constellation', deployStatus: 'live' },
  { id: 'p18', domainId: 'infra',     trackId: 'ti3', name: 'Project Edit',             type: 'Framework', status: 'active',  startDate: monthFromToday(0),  endDate: monthFromToday(3),  progress: 25, scores: { impact: 8, ease: 6, revenue: 4, strategicFit: 9, momentum: 8, excitement: 9 }, keystoneSkills: ['s7','s8'], builds: ['b8'], flywheelStage: null, chatUrl: '', description: 'The cockpit you are looking at. Edits, scores, ties, and ships every project in the empire from one timeline.', tags: ['cockpit','meta','flagship','framework'], priority: 'critical', techStack: ['React','lucide-react','localStorage'], liveUrl: '', githubUrl: 'https://github.com/scottelling/project-edit', deployStatus: 'none' },
  { id: 'p18b',domainId: 'infra',     trackId: 'ti2', name: 'Ship Pipeline',            type: 'Tool',      status: 'active',  startDate: monthFromToday(-4), endDate: monthFromToday(14), progress: 50, scores: { impact: 8, ease: 5, revenue: 4, strategicFit: 9, momentum: 7, excitement: 7 }, keystoneSkills: ['s7'], builds: ['b7'], flywheelStage: null, chatUrl: '' },
  { id: 'p19', domainId: 'business',  trackId: 'tb1', name: 'Brand Infrastructure',     type: 'Framework', status: 'active',  startDate: monthFromToday(-3), endDate: monthFromToday(4),  progress: 50, scores: { impact: 8, ease: 5, revenue: 7, strategicFit: 9, momentum: 6, excitement: 8 }, keystoneSkills: ['s7'], builds: ['b7'], flywheelStage: null, chatUrl: '' },
  { id: 'p20', domainId: 'business',  trackId: 'tb3', name: 'Public Empire Launch',     type: 'Content',   status: 'planned', startDate: monthFromToday(2),  endDate: monthFromToday(8),  progress: 0,  scores: { impact: 9, ease: 5, revenue: 8, strategicFit: 9, momentum: 2, excitement: 9 }, keystoneSkills: ['s5'], builds: ['b7'], flywheelStage: 'f1-3', chatUrl: '' },
  { id: 'p20b',domainId: 'business',  trackId: 'tb2', name: 'First Public Product',     type: 'App',       status: 'planned', startDate: monthFromToday(3),  endDate: monthFromToday(9),  progress: 0,  scores: { impact: 9, ease: 4, revenue: 9, strategicFit: 9, momentum: 1, excitement: 9 }, keystoneSkills: ['s7'], builds: ['b7'], flywheelStage: null, chatUrl: '' },
];

const DEFAULT_MILESTONES = [
  { id: 'm1',  domainId: 'health',    trackId: 'th1', projectId: null, name: 'Body comp goal',     date: monthFromToday(-1), status: 'planned' },
  { id: 'm2',  domainId: 'health',    trackId: 'th2', projectId: 'p1', name: 'Peptide v1 ship',    date: monthFromToday(2),  status: 'planned' },
  { id: 'm3',  domainId: 'health',    trackId: 'th1', projectId: 'p2', name: 'Vitality OS alpha',  date: monthFromToday(8),  status: 'planned' },
  { id: 'm3b', domainId: 'health',    trackId: 'th3', projectId: null, name: '90-day sleep',       date: monthFromToday(3),  status: 'planned' },
  { id: 'm3c', domainId: 'health',    trackId: 'th4', projectId: null, name: 'Biomarker baseline', date: monthFromToday(5),  status: 'planned' },
  { id: 'm4',  domainId: 'self',      trackId: 'ts2', projectId: 'p4',name: '90-day script',      date: monthFromToday(1),  status: 'planned' },
  { id: 'm5',  domainId: 'self',      trackId: 'ts1', projectId: 'p6',name: 'Identity v1',         date: monthFromToday(7),  status: 'planned' },
  { id: 'm5b', domainId: 'self',      trackId: 'ts3', projectId: null,name: '100-day streak',      date: monthFromToday(4),  status: 'planned' },
  { id: 'm6',  domainId: 'wealth',    trackId: 'tw1', projectId: 'p8',name: 'Oracle v5 live',      date: monthFromToday(3),  status: 'planned' },
  { id: 'm7',  domainId: 'wealth',    trackId: 'tw2', projectId: null,name: '$10K month',          date: monthFromToday(6),  status: 'planned' },
  { id: 'm8',  domainId: 'wealth',    trackId: 'tw1', projectId: null,name: 'Edge live',           date: monthFromToday(9),  status: 'planned' },
  { id: 'm9',  domainId: 'creative',  trackId: 'tc1', projectId: 'p10',name: '4 genomes',          date: monthFromToday(1),  status: 'hit' },
  { id: 'm10', domainId: 'creative',  trackId: 'tc2', projectId: null,name: 'Taste 1k tagged',     date: monthFromToday(5),  status: 'planned' },
  { id: 'm10b',domainId: 'creative',  trackId: 'tc3', projectId: null,name: 'Story library v1',    date: monthFromToday(8),  status: 'planned' },
  { id: 'm11', domainId: 'knowledge', trackId: 'tk1', projectId: 'p14',name: 'Legend v1',          date: monthFromToday(4),  status: 'planned' },
  { id: 'm11b',domainId: 'knowledge', trackId: 'tk2', projectId: null,name: '50 books',            date: monthFromToday(10), status: 'planned' },
  { id: 'm12', domainId: 'infra',     trackId: 'ti3', projectId: 'p17',name: 'Constellation v2',   date: monthFromToday(2),  status: 'planned' },
  { id: 'm13', domainId: 'infra',     trackId: 'ti3', projectId: 'p18',name: 'Project Edit v1',    date: monthFromToday(3),  status: 'planned' },
  { id: 'm13b',domainId: 'infra',     trackId: 'ti2', projectId: null,name: 'Ship 1-day',          date: monthFromToday(6),  status: 'planned' },
  { id: 'm14', domainId: 'business',  trackId: 'tb3', projectId: 'p20',name: 'Public launch',      date: monthFromToday(8),  status: 'planned' },
  { id: 'm14b',domainId: 'business',  trackId: 'tb1', projectId: null,name: 'Brand v1',            date: monthFromToday(4),  status: 'planned' },
  { id: 'm15', domainId: 'network',   trackId: 'tn1', projectId: null,name: 'Right rooms',         date: monthFromToday(6),  status: 'planned' },
];

const DEFAULT_KEYSTONE_SKILLS = [
  { id: 's1', name: 'Biology fluency',       description: 'Read mechanism + dose + risk for any compound.', currentLevel: 3, targetLevel: 5 },
  { id: 's2', name: 'Identity architecture', description: 'Design the inner OS that runs the outer life.', currentLevel: 4, targetLevel: 5 },
  { id: 's3', name: 'Market intuition',      description: 'Read price action + flow + macro as one signal.',currentLevel: 3, targetLevel: 5 },
  { id: 's4', name: 'Visual taste',          description: 'Verdict on whether something is good, why.',    currentLevel: 4, targetLevel: 5 },
  { id: 's5', name: 'Distribution writing',  description: 'Words that move people. Hooks, structure, voice.',currentLevel: 3, targetLevel: 5 },
  { id: 's6', name: 'Systems thinking',      description: 'See the graph behind the noise.',               currentLevel: 4, targetLevel: 5 },
  { id: 's7', name: 'Build velocity',        description: 'Concept → live product in days, not months.',   currentLevel: 4, targetLevel: 5 },
  { id: 's8', name: 'Empire navigation',     description: 'Hold 90+ projects in one mind and steer.',      currentLevel: 3, targetLevel: 5 },
];

const DEFAULT_BUILDS = [
  { id: 'b1', name: 'Longevity stack',    description: 'Working protocols I run on myself + ship.',     currentState: 'Operating, not monetized', targetState: 'Operating + monetized' },
  { id: 'b2', name: 'Inner OS',           description: 'Identity, scripts, daily protocol — codified.', currentState: 'Drafts + active use',      targetState: 'Daily-use system' },
  { id: 'b3', name: 'Trading system',     description: 'End-to-end edge + execution + journal.',         currentState: 'Edges identified',         targetState: 'Profitable, low-touch' },
  { id: 'b4', name: 'Taste corpus',       description: 'Labeled feed of what is good and why.',         currentState: 'Tagged seeds',             targetState: 'Trained, queryable' },
  { id: 'b5', name: 'Story library',      description: 'Canonical narratives + frames + hooks.',         currentState: 'Scattered',                targetState: 'Indexed, retrievable' },
  { id: 'b6', name: 'Second brain',       description: 'Every insight findable in one tap.',             currentState: 'Partial coverage',         targetState: 'Universal' },
  { id: 'b7', name: 'Public empire',      description: 'Portfolio site → subdomains → live products.',   currentState: 'Wildcard DNS live',        targetState: 'Self-deploying' },
  { id: 'b8', name: 'Portfolio cockpit',  description: 'Constellation + Project Edit + Eagle Eye.',      currentState: 'Three tools, connecting',  targetState: 'One cockpit' },
];

const DEFAULT_FLYWHEELS = [
  { id: 'f1', name: 'Content Flywheel',  description: 'Write → audience → distribution → income → reinvest', stages: ['Write','Audience','Distribute','Income','Reinvest'] },
  { id: 'f2', name: 'Identity Flywheel', description: 'Script → behavior → identity → results',               stages: ['Script','Behavior','Identity','Result'] },
  { id: 'f3', name: 'Trading Flywheel',  description: 'Edge → backtest → execute → journal → refine',         stages: ['Edge','Backtest','Execute','Journal','Refine'] },
  { id: 'f4', name: 'Taste Flywheel',    description: 'See → tag → train → judge',                            stages: ['See','Tag','Train','Judge'] },
  { id: 'f5', name: 'Story Flywheel',    description: 'Frame → write → ship → react',                         stages: ['Frame','Write','Ship','React'] },
];

// Time-blocked work sessions on a specific day. Hours stored as floats (e.g., 7.5 = 7:30 AM).
const todayISO = today.toISOString().slice(0, 10);
const DEFAULT_WORK_BLOCKS = [
  { id: 'wb1', projectId: 'p1',  date: todayISO, startHour: 6,    endHour: 7,    status: 'done',       notes: 'Morning protocol + cold plunge' },
  { id: 'wb2', projectId: 'p4',  date: todayISO, startHour: 7,    endHour: 7.5,  status: 'done',       notes: 'Daily script review' },
  { id: 'wb3', projectId: 'p18', date: todayISO, startHour: 9,    endHour: 12,   status: 'inProgress', notes: 'Deep work: day timeline build' },
  { id: 'wb4', projectId: 'p10', date: todayISO, startHour: 13,   endHour: 14.5, status: 'planned',    notes: 'Content gen + variations' },
  { id: 'wb5', projectId: 'p8',  date: todayISO, startHour: 15,   endHour: 16,   status: 'planned',    notes: 'Oracle review + new signals' },
  { id: 'wb6', projectId: 'p17', date: todayISO, startHour: 16.5, endHour: 17.5, status: 'planned',    notes: 'Constellation polish pass' },
  { id: 'wb7', projectId: 'p3b', date: todayISO, startHour: 18,   endHour: 19,   status: 'planned',    notes: 'Evening walk + journal' },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const ICONS = {
  Heart, User, TrendingUp, Sparkles, BookOpen, Server, Users, Briefcase,
  Activity, Droplet, Moon, Brain, Zap, Wrench, Target, Compass, Coins,
  Rocket, PenTool, ImageIcon, BarChart3
};

const STATUS = {
  planned:   { label: 'Planned',   color: T.textDim,   icon: Circle },
  active:    { label: 'Active',    color: T.health,    icon: Play },
  paused:    { label: 'Paused',    color: T.wealth,    icon: Pause },
  done:      { label: 'Done',      color: T.knowledge, icon: Check },
  abandoned: { label: 'Abandoned', color: T.danger,    icon: X }
};

const PROJECT_TYPES = ['Engine','OS','Framework','App','Tool','Skill','Content','Game'];

const composite = (s) => Math.round(((s.impact + s.ease + s.revenue + s.strategicFit + s.momentum + s.excitement) / 60) * 100);
const needsKick = (s) => s.excitement >= 6 && s.momentum <= 4;
const compoundScore = (p) => (p.keystoneSkills?.length ? 4 : 0) + (p.builds?.length ? 4 : 0) + (p.flywheelStage ? 2 : 0);
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
const fmtDate = (s) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const fmtMonthYear = (d) => d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
const subLabel = (p) => ['Engine','OS','Framework','Skill'].includes(p.type)
  ? `${p.type} · Ongoing`
  : `${p.type} · ${fmtDate(p.startDate)} – ${fmtDate(p.endDate)}`;

const packLanes = (projects) => {
  const sorted = [...projects].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const lanes = [];
  for (const p of sorted) {
    let placed = false;
    for (let i = 0; i < lanes.length; i++) {
      const last = lanes[i][lanes[i].length - 1];
      if (new Date(last.endDate) <= new Date(p.startDate)) {
        lanes[i].push(p); p._lane = i; placed = true; break;
      }
    }
    if (!placed) { lanes.push([p]); p._lane = lanes.length - 1; }
  }
  return { projects: sorted, laneCount: Math.max(1, lanes.length) };
};

// Deterministic pseudo-random for sparkline shapes
const seedSpark = (seedStr, target, n = 14) => {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = ((h << 5) - h) + seedStr.charCodeAt(i) | 0;
  const points = [];
  let val = target * 0.5;
  for (let i = 0; i < n; i++) {
    h = (h * 9301 + 49297) % 233280;
    const r = h / 233280;
    val += (r - 0.4) * (target * 0.13);
    val = Math.max(0, Math.min(target * 1.2, val));
    points.push(val);
  }
  points[n - 1] = target * (0.7 + (Math.abs(h) % 30) / 100);
  return points;
};

const computeDomainMetrics = (domain, projects, milestones) => {
  const own = projects.filter(p => p.domainId === domain.id);
  const active = own.filter(p => p.status === 'active');
  const ms = milestones.filter(m => m.domainId === domain.id);
  const msHit = ms.filter(m => m.status === 'hit').length;
  const avgMomentum = active.length ? (active.reduce((s, p) => s + p.scores.momentum, 0) / active.length) : 0;
  const avgComposite = own.length ? (own.reduce((s, p) => s + composite(p.scores), 0) / own.length) : 0;
  const compound = own.reduce((s, p) => s + compoundScore(p), 0);
  return [
    { id: 'active',   name: 'Active projects', current: active.length, target: own.length || 1, unit: '', format: 'count' },
    { id: 'momentum', name: 'Avg momentum',    current: avgMomentum,   target: 8, unit: '/10', format: 'decimal' },
    { id: 'score',    name: 'Avg composite',   current: avgComposite,  target: 80, unit: '',   format: 'int' },
    { id: 'compound', name: 'Compound ties',   current: compound,      target: own.length * 10 || 10, unit: '', format: 'count' },
    { id: 'milestones', name: 'Milestones hit', current: msHit,        target: ms.length || 1, unit: '', format: 'count' },
  ];
};

// Deterministic placeholder image generator — SVG data URL with gradient + initials
const hashStr = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
};
const initialsOf = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const placeholderImage = (name, color) => {
  const seed = hashStr(name || 'x');
  const angle = seed % 360;
  const initials = initialsOf(name || '??');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${angle} 0.5 0.5)">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0.08"/>
      </linearGradient>
      <pattern id="d" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="12" cy="12" r="0.8" fill="${color}" fill-opacity="0.18"/>
      </pattern>
    </defs>
    <rect width="600" height="400" fill="#13141A"/>
    <rect width="600" height="400" fill="url(#g)"/>
    <rect width="600" height="400" fill="url(#d)"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
      font-family="Inter, sans-serif" font-size="120" font-weight="800"
      fill="${color}" fill-opacity="0.55" letter-spacing="-4">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const heroImageFor = (project, domain) => {
  if (project.images && project.images.length > 0) return project.images[0].dataUrl;
  return placeholderImage(project.name, domain?.color || T.creative);
};

// File → base64 data URL (for screenshot upload)
const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = () => reject(new Error('read failed'));
  r.readAsDataURL(file);
});

// JSON I/O
const validateImport = (raw) => {
  try {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!data || typeof data !== 'object') return { ok: false, error: 'Not a JSON object.' };
    if (!Array.isArray(data.projects)) return { ok: false, error: 'Missing "projects" array.' };
    for (const p of data.projects) {
      if (!p.id || !p.name) return { ok: false, error: `Project missing id or name: ${JSON.stringify(p).slice(0, 80)}…` };
    }
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${e.message}` };
  }
};

const downloadJson = (data, filename = 'project-edit-export.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
};

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE — migrates older versions; ensures every project has the new fields
// ─────────────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'project-edit-v5';
const LEGACY_KEYS = ['project-edit-v4', 'project-edit-v3', 'project-edit-v2'];

const PROJECT_DEFAULTS = {
  description: '',
  tags: [],
  priority: 'normal',
  images: [],
  techStack: [],
  liveUrl: '',
  githubUrl: '',
  deployStatus: 'none'
};

const migrateProject = (p) => ({ ...PROJECT_DEFAULTS, ...p });

const DEFAULT_DEPLOY_CONFIG = {
  rootDomain: 'scottelling.com',
  githubOrg: 'scottelling',
  vercelTeam: 'scott',
  defaultBranch: 'main',
  autoDeploy: true
};

const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
      || LEGACY_KEYS.map(k => localStorage.getItem(k)).find(Boolean);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.domains && parsed.projects) {
        if (!parsed.tracks) parsed.tracks = DEFAULT_TRACKS;
        if (!parsed.workBlocks) parsed.workBlocks = DEFAULT_WORK_BLOCKS;
        if (!parsed.deployConfig) parsed.deployConfig = DEFAULT_DEPLOY_CONFIG;
        parsed.projects = parsed.projects.map(migrateProject);
        return parsed;
      }
    }
  } catch (e) {}
  return {
    domains: DEFAULT_DOMAINS,
    tracks: DEFAULT_TRACKS,
    projects: DEFAULT_PROJECTS.map(migrateProject),
    milestones: DEFAULT_MILESTONES,
    keystoneSkills: DEFAULT_KEYSTONE_SKILLS,
    builds: DEFAULT_BUILDS,
    flywheels: DEFAULT_FLYWHEELS,
    workBlocks: DEFAULT_WORK_BLOCKS,
    deployConfig: DEFAULT_DEPLOY_CONFIG,
    vision: { global: 'Build an empire of compounding tools by 2030. Financial freedom + global mobility.' }
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
const ScoreBadge = ({ score, size = 'sm' }) => {
  const color = score >= 70 ? T.health : score >= 50 ? T.wealth : T.textDim;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: size === 'sm' ? 28 : 36, height: size === 'sm' ? 20 : 28,
      padding: '0 6px', borderRadius: 6,
      background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}33`,
      color, fontWeight: 700, fontSize: size === 'sm' ? 11 : 13,
      fontVariantNumeric: 'tabular-nums', letterSpacing: -0.2
    }}>{score}</div>
  );
};

const StatusDot = ({ status }) => {
  const s = STATUS[status] || STATUS.planned;
  return <div style={{ width: 8, height: 8, borderRadius: 4, background: s.color, flexShrink: 0 }} />;
};

const StatusPill = ({ status }) => {
  const s = STATUS[status] || STATUS.planned;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px 3px 8px', borderRadius: 999,
      background: `${s.color}14`, color: s.color, fontSize: 11, fontWeight: 600
    }}>
      <div style={{ width: 6, height: 6, borderRadius: 3, background: s.color }} />
      {s.label}
    </div>
  );
};

const Diamond = ({ color, filled, size = 12 }) => (
  <div style={{
    width: size, height: size,
    background: filled ? color : 'transparent',
    border: `1.5px solid ${color}`,
    transform: 'rotate(45deg)', flexShrink: 0
  }} />
);

const IconBtn = ({ children, onClick, size = 36, active }) => (
  <button onClick={onClick} style={{
    width: size, height: size, borderRadius: 8,
    background: active ? T.surfaceHi : 'transparent', border: 'none', cursor: 'pointer',
    color: active ? T.text : T.textMid,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s'
  }}
  onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.surfaceHi; }}
  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
    {children}
  </button>
);

const Stepper = ({ value, onChange, min = 0, max = 10, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
    {label && <div style={{ flex: 1, color: T.textMid, fontSize: 13 }}>{label}</div>}
    <button onClick={() => onChange(Math.max(min, value - 1))} style={{
      width: 32, height: 32, borderRadius: 8, border: 'none',
      background: T.surfaceHi, color: T.text, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}><Minus size={14} /></button>
    <div style={{
      minWidth: 32, textAlign: 'center', color: T.text,
      fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums'
    }}>{value}</div>
    <button onClick={() => onChange(Math.min(max, value + 1))} style={{
      width: 32, height: 32, borderRadius: 8, border: 'none',
      background: T.surfaceHi, color: T.text, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}><Plus size={14} /></button>
  </div>
);

const Chip = ({ children, active, color = T.creative, onClick }) => (
  <button onClick={onClick} style={{
    padding: '6px 12px', minHeight: 32, borderRadius: 8,
    border: `1px solid ${active ? color : T.border}`,
    background: active ? `${color}1A` : 'transparent',
    color: active ? color : T.textMid,
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    whiteSpace: 'nowrap', transition: 'all 0.15s'
  }}>{children}</button>
);

const Sparkline = ({ points, color, width = 80, height = 24, showLast }) => {
  if (!points || points.length < 2) return <div style={{ width, height }} />;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);
  const path = points.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p - min) / range) * height * 0.8 - height * 0.1;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  const lastX = (points.length - 1) * stepX;
  const lastY = height - ((points[points.length - 1] - min) / range) * height * 0.8 - height * 0.1;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`${path} L ${width} ${height} L 0 ${height} Z`} fill={`url(#grad-${color})`} />
      <path d={path} stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {showLast && <circle cx={lastX} cy={lastY} r={2.5} fill={color} />}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TOP NAV
// ─────────────────────────────────────────────────────────────────────────────
const TopNav = ({ view, setView, breadcrumb, onBack, onToggleSidebar, isMobile, onToggleRail, searchValue, onSearchChange, onOpenSettings, onOpenDeploy }) => {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '0 20px', height: 60,
      background: T.bg, borderBottom: `1px solid ${T.borderDim}`,
      flexShrink: 0, gap: 16
    }}>
      {isMobile && <IconBtn onClick={onToggleSidebar} size={36}><Menu size={18} /></IconBtn>}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexShrink: 0 }}>
        <div style={{ color: T.text, fontSize: 16, fontWeight: 800, letterSpacing: 1.5 }}>PROJECT EDIT</div>
        {!isMobile && <div style={{ color: T.textFaint, fontSize: 11, fontWeight: 500 }}>v0.5</div>}
      </div>

      {!isMobile && (
        <div style={{
          display: 'flex', alignItems: 'center',
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 10, padding: '0 12px',
          flex: 1, maxWidth: 480, height: 38, gap: 8
        }}>
          <Search size={14} color={T.textDim} />
          <input
            value={searchValue || ''}
            onChange={e => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search projects, milestones, skills…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: T.text, fontSize: 13
            }}
          />
          {searchValue ? (
            <button onClick={() => onSearchChange('')} style={{
              background: 'transparent', border: 'none', color: T.textDim,
              cursor: 'pointer', padding: 0, display: 'flex'
            }}><X size={14} /></button>
          ) : (
            <kbd style={{
              fontSize: 10, color: T.textDim, padding: '2px 6px',
              border: `1px solid ${T.border}`, borderRadius: 4, fontFamily: 'inherit'
            }}>⌘K</kbd>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: isMobile ? 'auto' : 24 }}>
        {['horizon','feed','dailies','vision'].map(v => {
          const active = view === v || (v === 'horizon' && view === 'domain');
          const label = v === 'horizon' ? 'Timeline' : v === 'feed' ? 'Feed' : v === 'dailies' ? 'Dailies' : 'Vision';
          return (
            <button key={v} onClick={() => setView(v)} style={{
              padding: isMobile ? '6px 10px' : '8px 14px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: active ? T.text : T.textDim,
              fontSize: 13, fontWeight: 600,
              borderBottom: `2px solid ${active ? T.text : 'transparent'}`,
              marginBottom: -1
            }}>{label}</button>
          );
        })}
      </div>

      {!isMobile && <div style={{ flex: 1 }} />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {!isMobile && (
          <button onClick={onOpenDeploy} title="Deploy to scottelling.com" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 8,
            background: T.surface, border: `1px solid ${T.border}`,
            color: T.text, fontSize: 12, fontWeight: 600, cursor: 'pointer'
          }}>
            <Rocket size={13} color={T.health} /> Deploy
          </button>
        )}
        <IconBtn onClick={onOpenSettings} size={36}><Settings size={16} /></IconBtn>
        {isMobile && <IconBtn onClick={onToggleRail} size={36}><LayoutGrid size={16} /></IconBtn>}
        <div style={{
          width: 32, height: 32, borderRadius: 16,
          background: `linear-gradient(135deg, ${T.creative}, ${T.network})`, marginLeft: 4
        }} />
      </div>
    </div>
  );
};

// Breadcrumb bar (shown when drilling into a domain)
const Breadcrumb = ({ items, onBack }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 24px', background: T.bg,
    borderBottom: `1px solid ${T.borderHair}`,
    flexShrink: 0
  }}>
    <IconBtn onClick={onBack} size={28}><ArrowLeft size={14} /></IconBtn>
    {items.map((item, i) => (
      <React.Fragment key={i}>
        {i > 0 && <ChevronRight size={12} color={T.textFaint} />}
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: i === items.length - 1 ? T.text : T.textDim,
          cursor: item.onClick ? 'pointer' : 'default'
        }} onClick={item.onClick}>{item.label}</span>
      </React.Fragment>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// LEFT SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
const PillarSidebar = ({ data, expanded, toggleExpanded, onQuickAdd, selectedDomain, onSelectDomain, onOpenDomain }) => {
  return (
    <div style={{
      width: 240, flexShrink: 0,
      background: T.bg, borderRight: `1px solid ${T.borderDim}`,
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      <div style={{
        padding: '16px 20px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{
          fontSize: 11, color: T.textDim, fontWeight: 700,
          letterSpacing: 1.2, textTransform: 'uppercase'
        }}>Domains</div>
        <IconBtn onClick={onQuickAdd} size={28}><Plus size={14} /></IconBtn>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 16px' }}>
        {data.domains.map(d => {
          const Icon = ICONS[d.iconKey] || Compass;
          const projects = data.projects.filter(p => p.domainId === d.id);
          const isOpen = expanded[d.id];
          const isSelected = selectedDomain === d.id;
          return (
            <div key={d.id}>
              <button onClick={() => onOpenDomain(d.id)} style={{
                width: '100%', padding: '10px 12px', marginBottom: 2,
                background: isSelected ? T.surface : 'transparent',
                border: 'none', borderRadius: 10, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                color: T.text, textAlign: 'left', transition: 'background 0.12s'
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = T.surface; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: d.color, flexShrink: 0 }} />
                <Icon size={16} color={d.color} strokeWidth={1.75} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: T.textDim, marginTop: 1 }}>
                    {projects.length} project{projects.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleExpanded(d.id); }} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: T.textDim, padding: 4, display: 'flex'
                }}>
                  <ChevronDown size={14} style={{
                    transform: isOpen ? 'rotate(0)' : 'rotate(-90deg)',
                    transition: 'transform 0.15s'
                  }} />
                </button>
              </button>
              {isOpen && (
                <div style={{ padding: '4px 8px 8px 28px' }}>
                  {projects.slice(0, 10).map(p => (
                    <div key={p.id} style={{
                      padding: '5px 8px', fontSize: 12, color: T.textMid,
                      borderRadius: 6, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden'
                    }}>
                      <StatusDot status={p.status} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </span>
                    </div>
                  ))}
                  {projects.length > 10 && (
                    <div style={{ padding: '4px 8px', fontSize: 11, color: T.textDim }}>
                      +{projects.length - 10} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TIMELINE CANVAS (overview — all domains)
// ─────────────────────────────────────────────────────────────────────────────
const TimelineCanvas = ({ data, onClipTap, filter, isMobile, onOpenDomain }) => {
  const scrollRef = useRef(null);
  const [zoom, setZoom] = useState(isMobile ? 60 : 80);
  const ROW_PADDING_TOP = 28;
  const CLIP_HEIGHT = 32;
  const CLIP_GAP = 6;

  const windowStart = useMemo(() => {
    const d = new Date(today); d.setMonth(d.getMonth() - 2); d.setDate(1);
    return d;
  }, []);
  const windowMonths = 38;
  const totalWidth = windowMonths * zoom;

  const months = useMemo(() => {
    const arr = [];
    for (let i = 0; i < windowMonths; i++) {
      const d = new Date(windowStart); d.setMonth(d.getMonth() + i);
      arr.push(d);
    }
    return arr;
  }, [windowStart, windowMonths]);

  const todayX = (daysBetween(windowStart, today) / 30.44) * zoom;
  const dateToX = (s) => (daysBetween(windowStart, s) / 30.44) * zoom;
  const snapToToday = () => {
    if (scrollRef.current) scrollRef.current.scrollTo({ left: Math.max(0, todayX - 120), behavior: 'smooth' });
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = Math.max(0, todayX - 120);
  }, []);

  const filtered = useMemo(() => {
    if (!filter.activeOnly && !filter.kick && !filter.search) return data.projects;
    return data.projects.filter(p => {
      if (filter.activeOnly && p.status !== 'active') return false;
      if (filter.kick && !needsKick(p.scores)) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        if (!p.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [data.projects, filter]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div ref={scrollRef} style={{
        flex: 1, overflowX: 'auto', overflowY: 'auto', position: 'relative',
        WebkitOverflowScrolling: 'touch'
      }}>
        <div style={{ width: totalWidth, position: 'relative', minHeight: '100%' }}>
          {/* Time axis */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 6,
            height: 60, background: T.bg,
            borderBottom: `1px solid ${T.borderDim}`, display: 'flex'
          }}>
            {months.map((d, i) => {
              const isFirstMonthOfYear = d.getMonth() === 0;
              return (
                <div key={i} style={{
                  width: zoom, flexShrink: 0,
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  paddingBottom: 8, paddingLeft: 6, position: 'relative',
                  borderLeft: isFirstMonthOfYear ? `1px solid ${T.border}` : 'none'
                }}>
                  {isFirstMonthOfYear && (
                    <div style={{
                      position: 'absolute', top: 8, left: 6,
                      color: T.textMid, fontSize: 12, fontWeight: 700, letterSpacing: -0.3
                    }}>{d.getFullYear()}</div>
                  )}
                  <div style={{
                    color: T.textDim, fontSize: 10, fontWeight: 600,
                    letterSpacing: 0.6, textTransform: 'uppercase'
                  }}>{fmtMonthYear(d)}</div>
                </div>
              );
            })}
          </div>

          {/* Today line */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: todayX, width: 1, background: T.text, zIndex: 4, opacity: 0.85
          }}>
            <div style={{
              position: 'absolute', top: 6, left: -28, width: 56,
              padding: '3px 6px', background: T.text, color: T.bg,
              fontSize: 9, fontWeight: 800, textAlign: 'center', borderRadius: 3, letterSpacing: 0.8
            }}>TODAY</div>
            <div style={{
              position: 'absolute', top: 26, left: -4, width: 0, height: 0,
              borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
              borderTop: `5px solid ${T.text}`
            }} />
          </div>

          {/* Pillar rows */}
          {data.domains.map(domain => {
            const projects = filtered.filter(p => p.domainId === domain.id);
            const { projects: packed, laneCount } = packLanes(projects);
            const milestones = data.milestones.filter(m => m.domainId === domain.id);
            const rowHeight = ROW_PADDING_TOP + (laneCount * (CLIP_HEIGHT + CLIP_GAP)) + 12;

            return (
              <div key={domain.id} onClick={() => onOpenDomain && onOpenDomain(domain.id)}
                style={{
                  position: 'relative',
                  minHeight: Math.max(96, rowHeight),
                  borderBottom: `1px solid ${T.borderHair}`,
                  cursor: 'pointer'
                }}>
                {milestones.map(m => {
                  const x = dateToX(m.date);
                  return (
                    <div key={m.id} style={{
                      position: 'absolute', left: x - 50, top: 6,
                      width: 100, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', pointerEvents: 'none', zIndex: 2
                    }}>
                      <div style={{
                        color: T.textMid, fontSize: 10, fontWeight: 500,
                        marginBottom: 2, whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'
                      }}>{m.name}</div>
                      <Diamond color={domain.color} filled={m.status === 'hit'} size={10} />
                    </div>
                  );
                })}

                {packed.map(p => {
                  const x = dateToX(p.startDate);
                  const w = Math.max(60, dateToX(p.endDate) - dateToX(p.startDate));
                  const y = ROW_PADDING_TOP + (p._lane * (CLIP_HEIGHT + CLIP_GAP));
                  const isFuture = new Date(p.startDate) > today;
                  const isPaused = p.status === 'paused';
                  const opacity = isPaused ? 0.5 : isFuture ? 0.7 : 1;
                  return (
                    <div key={p.id} onClick={(e) => { e.stopPropagation(); onClipTap(p); }}
                      style={{
                        position: 'absolute', left: x, top: y, width: w, height: CLIP_HEIGHT,
                        background: T.surface, border: `1px solid ${T.borderHair}`,
                        borderLeft: `3px solid ${domain.color}`, borderRadius: 6,
                        padding: '4px 8px 0', cursor: 'pointer', opacity,
                        overflow: 'hidden', transition: 'background 0.12s', zIndex: 3
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHi; }}
                      onMouseLeave={e => { e.currentTarget.style.background = T.surface; }}>
                      <div style={{
                        color: T.text, fontSize: 11, fontWeight: 600,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2
                      }}>{p.name}</div>
                      <div style={{
                        height: 3, background: `${domain.color}22`,
                        borderRadius: 2, overflow: 'hidden',
                        position: 'absolute', left: 8, right: 8, bottom: 5
                      }}>
                        <div style={{
                          width: `${p.progress}%`, height: '100%',
                          background: domain.color, borderRadius: 2,
                          boxShadow: `0 0 6px ${domain.color}66`
                        }} />
                      </div>
                    </div>
                  );
                })}

                {projects.length === 0 && (
                  <div style={{
                    position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                    color: T.textFaint, fontSize: 11, fontStyle: 'italic'
                  }}>No projects in this domain</div>
                )}
              </div>
            );
          })}
          <div style={{ height: 60 }} />
        </div>
      </div>

      {/* Bottom controls */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 16px', borderTop: `1px solid ${T.borderDim}`,
        background: T.bg, flexShrink: 0
      }}>
        <Chip active={filter.activeOnly} onClick={() => filter.setFilter(f => ({ ...f, activeOnly: !f.activeOnly }))} color={T.health}>
          <Play size={11} /> Active
        </Chip>
        <Chip active={filter.kick} onClick={() => filter.setFilter(f => ({ ...f, kick: !f.kick }))} color={T.wealth}>
          <AlertCircle size={11} /> Needs kick
        </Chip>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <IconBtn onClick={() => setZoom(z => Math.max(30, z - 15))} size={32}><Minus size={14} /></IconBtn>
          <input type="range" min={30} max={140} value={zoom} onChange={e => setZoom(+e.target.value)}
            style={{ width: 120, accentColor: T.creative }} />
          <IconBtn onClick={() => setZoom(z => Math.min(140, z + 15))} size={32}><Plus size={14} /></IconBtn>
        </div>
        <button onClick={snapToToday} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 12px', borderRadius: 8,
          background: T.surface, border: `1px solid ${T.border}`,
          color: T.text, fontSize: 12, fontWeight: 600, cursor: 'pointer'
        }}>
          <Crosshair size={13} /> Snap to today
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN DETAIL — Timeline focused on one domain, with sub-lane (track) rows
// ─────────────────────────────────────────────────────────────────────────────
const DomainDetailView = ({ data, domainId, onClipTap, isMobile }) => {
  const domain = data.domains.find(d => d.id === domainId);
  const Icon = ICONS[domain.iconKey] || Compass;
  const tracks = data.tracks.filter(t => t.domainId === domainId);
  const projects = data.projects.filter(p => p.domainId === domainId);
  const milestones = data.milestones.filter(m => m.domainId === domainId);
  const activeCount = projects.filter(p => p.status === 'active').length;
  const msHit = milestones.filter(m => m.status === 'hit').length;
  const onTrackPct = projects.length
    ? Math.round((projects.filter(p => p.scores.momentum >= 6).length / projects.length) * 100)
    : 0;

  const scrollRef = useRef(null);
  const [zoom, setZoom] = useState(isMobile ? 60 : 90);
  const TRACK_PADDING_TOP = 24;
  const CLIP_HEIGHT = 36;
  const CLIP_GAP = 4;

  const windowStart = useMemo(() => {
    const d = new Date(today); d.setMonth(d.getMonth() - 2); d.setDate(1);
    return d;
  }, []);
  const windowMonths = 38;
  const totalWidth = windowMonths * zoom;

  const months = useMemo(() => {
    const arr = [];
    for (let i = 0; i < windowMonths; i++) {
      const d = new Date(windowStart); d.setMonth(d.getMonth() + i);
      arr.push(d);
    }
    return arr;
  }, [windowStart, windowMonths]);

  const todayX = (daysBetween(windowStart, today) / 30.44) * zoom;
  const dateToX = (s) => (daysBetween(windowStart, s) / 30.44) * zoom;
  const snapToToday = () => {
    if (scrollRef.current) scrollRef.current.scrollTo({ left: Math.max(0, todayX - 120), behavior: 'smooth' });
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = Math.max(0, todayX - 120);
  }, [domainId]);

  // Group untracked projects under a virtual "Uncategorized" track
  const trackList = [...tracks];
  const untracked = projects.filter(p => !p.trackId || !tracks.find(t => t.id === p.trackId));
  if (untracked.length > 0) {
    trackList.push({ id: '__untracked', domainId, name: 'Uncategorized', iconKey: null, _virtual: true });
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Page header */}
      <div style={{
        padding: '20px 24px 16px', borderBottom: `1px solid ${T.borderDim}`,
        display: 'flex', alignItems: 'flex-start', gap: 16
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${domain.color}1A`, border: `1px solid ${domain.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={22} color={domain.color} strokeWidth={1.75} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: T.text, fontSize: 24, fontWeight: 700,
            letterSpacing: -0.4, marginBottom: 4
          }}>{domain.name}</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            color: T.textDim, fontSize: 12, fontWeight: 500
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: domain.color }} />
              {activeCount} active project{activeCount !== 1 ? 's' : ''}
            </div>
            <span style={{ color: T.textFaint }}>•</span>
            <div>{milestones.length} milestone{milestones.length !== 1 ? 's' : ''}</div>
            {milestones.length > 0 && <>
              <span style={{ color: T.textFaint }}>•</span>
              <div>{Math.round((msHit / milestones.length) * 100)}% hit</div>
            </>}
            <span style={{ color: T.textFaint }}>•</span>
            <div style={{ color: onTrackPct >= 60 ? T.health : T.wealth }}>{onTrackPct}% on track</div>
          </div>
        </div>
      </div>

      {/* Track timeline */}
      <div ref={scrollRef} style={{
        flex: 1, overflowX: 'auto', overflowY: 'auto',
        position: 'relative', WebkitOverflowScrolling: 'touch'
      }}>
        <div style={{ width: totalWidth + 160, position: 'relative', minHeight: '100%', display: 'flex' }}>
          {/* Sticky-left track labels column */}
          <div style={{
            position: 'sticky', left: 0, zIndex: 7, width: 160, flexShrink: 0,
            background: T.bg, borderRight: `1px solid ${T.borderDim}`
          }}>
            <div style={{ height: 60, borderBottom: `1px solid ${T.borderDim}` }} />
            {trackList.map(t => {
              const tProjects = projects.filter(p => (p.trackId || '__untracked') === t.id);
              const { laneCount } = packLanes(tProjects);
              const rowHeight = TRACK_PADDING_TOP + (laneCount * (CLIP_HEIGHT + CLIP_GAP)) + 16;
              const TIcon = ICONS[t.iconKey] || Circle;
              return (
                <div key={t.id} style={{
                  minHeight: Math.max(80, rowHeight),
                  borderBottom: `1px solid ${T.borderHair}`,
                  padding: '14px 16px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {t._virtual
                      ? <div style={{ width: 16, height: 16 }} />
                      : <TIcon size={14} color={domain.color} strokeWidth={1.75} />}
                    <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                  </div>
                  <div style={{ color: T.textDim, fontSize: 10, marginLeft: t._virtual ? 0 : 24 }}>
                    {tProjects.length} {tProjects.length === 1 ? 'project' : 'projects'}
                    {laneCount > 1 && ` · ${laneCount} lanes`}
                  </div>
                </div>
              );
            })}
            {trackList.length === 0 && (
              <div style={{ padding: 20, color: T.textFaint, fontSize: 11, fontStyle: 'italic' }}>
                No tracks defined
              </div>
            )}
          </div>

          {/* Right scrolling area */}
          <div style={{ position: 'relative', width: totalWidth }}>
            {/* Time axis */}
            <div style={{
              position: 'sticky', top: 0, zIndex: 6,
              height: 60, background: T.bg,
              borderBottom: `1px solid ${T.borderDim}`, display: 'flex'
            }}>
              {months.map((d, i) => {
                const isFirstMonthOfYear = d.getMonth() === 0;
                return (
                  <div key={i} style={{
                    width: zoom, flexShrink: 0, position: 'relative',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    paddingBottom: 8, paddingLeft: 6,
                    borderLeft: isFirstMonthOfYear ? `1px solid ${T.border}` : 'none'
                  }}>
                    {isFirstMonthOfYear && (
                      <div style={{
                        position: 'absolute', top: 8, left: 6,
                        color: T.textMid, fontSize: 12, fontWeight: 700, letterSpacing: -0.3
                      }}>{d.getFullYear()}</div>
                    )}
                    <div style={{
                      color: T.textDim, fontSize: 10, fontWeight: 600,
                      letterSpacing: 0.6, textTransform: 'uppercase'
                    }}>{fmtMonthYear(d)}</div>
                  </div>
                );
              })}
            </div>

            {/* Today line */}
            <div style={{
              position: 'absolute', top: 0, bottom: 0,
              left: todayX, width: 1, background: T.text, zIndex: 4, opacity: 0.85
            }}>
              <div style={{
                position: 'absolute', top: 6, left: -28, width: 56,
                padding: '3px 6px', background: T.text, color: T.bg,
                fontSize: 9, fontWeight: 800, textAlign: 'center', borderRadius: 3, letterSpacing: 0.8
              }}>TODAY</div>
              <div style={{
                position: 'absolute', top: 26, left: -4, width: 0, height: 0,
                borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
                borderTop: `5px solid ${T.text}`
              }} />
            </div>

            {/* Track rows */}
            {trackList.map(t => {
              const tProjects = projects.filter(p => (p.trackId || '__untracked') === t.id);
              const { projects: packed, laneCount } = packLanes(tProjects);
              const tMilestones = milestones.filter(m => m.trackId === t.id);
              const rowHeight = TRACK_PADDING_TOP + (laneCount * (CLIP_HEIGHT + CLIP_GAP)) + 16;

              return (
                <div key={t.id} style={{
                  position: 'relative',
                  minHeight: Math.max(80, rowHeight),
                  borderBottom: `1px solid ${T.borderHair}`
                }}>
                  {/* Milestones for this track */}
                  {tMilestones.map(m => {
                    const x = dateToX(m.date);
                    return (
                      <div key={m.id} style={{
                        position: 'absolute', left: x - 50, top: 4,
                        width: 100, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', pointerEvents: 'none', zIndex: 2
                      }}>
                        <div style={{
                          color: T.textMid, fontSize: 9, fontWeight: 500,
                          marginBottom: 2, whiteSpace: 'nowrap',
                          overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'
                        }}>{m.name}</div>
                        <Diamond color={domain.color} filled={m.status === 'hit'} size={9} />
                      </div>
                    );
                  })}

                  {/* Clips */}
                  {packed.map(p => {
                    const x = dateToX(p.startDate);
                    const w = Math.max(80, dateToX(p.endDate) - dateToX(p.startDate));
                    const y = TRACK_PADDING_TOP + (p._lane * (CLIP_HEIGHT + CLIP_GAP));
                    const isFuture = new Date(p.startDate) > today;
                    const isPaused = p.status === 'paused';
                    const isPlanned = p.status === 'planned';
                    const opacity = isPaused ? 0.5 : (isFuture || isPlanned) ? 0.6 : 1;
                    return (
                      <div key={p.id} onClick={() => onClipTap(p)}
                        style={{
                          position: 'absolute', left: x, top: y, width: w, height: CLIP_HEIGHT,
                          background: T.surface, border: `1px solid ${T.borderHair}`,
                          borderLeft: `3px solid ${domain.color}`, borderRadius: 6,
                          padding: '5px 10px 0', cursor: 'pointer', opacity,
                          overflow: 'hidden', transition: 'background 0.12s', zIndex: 3
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHi; }}
                        onMouseLeave={e => { e.currentTarget.style.background = T.surface; }}>
                        <div style={{
                          color: T.text, fontSize: 12, fontWeight: 600,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          marginBottom: 2, lineHeight: 1.2
                        }}>{p.name}</div>
                        <div style={{
                          color: T.textDim, fontSize: 10,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>{subLabel(p)}</div>
                        <div style={{
                          height: 3, background: `${domain.color}22`,
                          borderRadius: 2, overflow: 'hidden',
                          position: 'absolute', left: 10, right: 10, bottom: 5
                        }}>
                          <div style={{
                            width: `${p.progress}%`, height: '100%',
                            background: domain.color, borderRadius: 2,
                            boxShadow: `0 0 6px ${domain.color}66`
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            <div style={{ height: 60 }} />
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 16px', borderTop: `1px solid ${T.borderDim}`,
        background: T.bg, flexShrink: 0
      }}>
        <div style={{ color: T.textDim, fontSize: 11, fontWeight: 600 }}>Zoom</div>
        <IconBtn onClick={() => setZoom(z => Math.max(30, z - 15))} size={32}><Minus size={14} /></IconBtn>
        <input type="range" min={30} max={140} value={zoom} onChange={e => setZoom(+e.target.value)}
          style={{ width: 120, accentColor: domain.color }} />
        <IconBtn onClick={() => setZoom(z => Math.min(140, z + 15))} size={32}><Plus size={14} /></IconBtn>
        <div style={{ flex: 1 }} />
        <button onClick={snapToToday} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 12px', borderRadius: 8,
          background: T.surface, border: `1px solid ${T.border}`,
          color: T.text, fontSize: 12, fontWeight: 600, cursor: 'pointer'
        }}>
          <Crosshair size={13} /> Snap to today
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DAY TIMELINE — hourly grid for time-blocked project work on a single day
// ─────────────────────────────────────────────────────────────────────────────
const DayTimelineView = ({ data, selectedDate, onClipTap }) => {
  const startHour = 5;
  const endHour = 23; // 11 PM
  const hourCount = endHour - startHour; // 18 hours visible
  const [hourWidth, setHourWidth] = useState(90);
  const totalGridWidth = (hourCount + 1) * hourWidth;

  const isToday = selectedDate === today.toISOString().slice(0, 10);
  const now = new Date();
  const currentHourFloat = now.getHours() + now.getMinutes() / 60;
  const todayX = Math.max(0, Math.min(hourCount * hourWidth,
    ((currentHourFloat - startHour)) * hourWidth));

  const dateBlocks = data.workBlocks.filter(b => b.date === selectedDate);

  // Group blocks by domain (via project)
  const blocksByDomain = data.domains.map(d => {
    const blocks = dateBlocks
      .filter(b => {
        const proj = data.projects.find(p => p.id === b.projectId);
        return proj && proj.domainId === d.id;
      })
      .sort((a, b) => a.startHour - b.startHour);
    return { domain: d, blocks };
  }).filter(g => g.blocks.length > 0);

  const totalBlocks = dateBlocks.length;
  const doneCount = dateBlocks.filter(b => b.status === 'done').length;
  const inProgressCount = dateBlocks.filter(b => b.status === 'inProgress').length;
  const plannedCount = dateBlocks.filter(b => b.status === 'planned').length;

  const formatHour = (h) => {
    const intH = Math.floor(h);
    const min = Math.round((h - intH) * 60);
    const hour = ((intH % 12) || 12);
    const period = intH < 12 || intH === 24 ? 'AM' : 'PM';
    return min === 0 ? `${hour} ${period}` : `${hour}:${String(min).padStart(2,'0')} ${period}`;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Stats strip */}
      <div style={{ padding: '10px 24px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8,
          fontSize: 12, color: T.textMid, flexWrap: 'wrap'
        }}>
          <div style={{ color: T.text, fontWeight: 600, fontSize: 13 }}>
            {totalBlocks} block{totalBlocks !== 1 ? 's' : ''} scheduled
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: T.health }} />
            <span>{doneCount} done</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: T.wealth }} />
            <span>{inProgressCount} in progress</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: T.textDim }} />
            <span>{plannedCount} planned</span>
          </div>
        </div>
        <div style={{ height: 4, background: T.surface, borderRadius: 2, overflow: 'hidden', display: 'flex' }}>
          {totalBlocks > 0 && <>
            <div style={{ width: `${(doneCount/totalBlocks)*100}%`, height: '100%', background: T.health }} />
            <div style={{ width: `${(inProgressCount/totalBlocks)*100}%`, height: '100%', background: T.wealth }} />
            <div style={{ width: `${(plannedCount/totalBlocks)*100}%`, height: '100%', background: T.textDim }} />
          </>}
        </div>
      </div>

      {/* Grid */}
      <div style={{
        flex: 1, overflowX: 'auto', overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        marginTop: 12
      }}>
        <div style={{ minWidth: totalGridWidth + 140, position: 'relative' }}>
          {/* Time axis (sticky top) */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 6, display: 'flex',
            background: T.bg, borderBottom: `1px solid ${T.borderDim}`, height: 36
          }}>
            <div style={{ width: 140, flexShrink: 0, borderRight: `1px solid ${T.borderDim}` }} />
            {Array.from({ length: hourCount + 1 }, (_, i) => (
              <div key={i} style={{
                width: hourWidth, flexShrink: 0,
                display: 'flex', alignItems: 'center', paddingLeft: 8,
                color: T.textDim, fontSize: 10, fontWeight: 600,
                letterSpacing: 0.5, textTransform: 'uppercase'
              }}>{formatHour(startHour + i)}</div>
            ))}
          </div>

          {/* Today line */}
          {isToday && (
            <div style={{
              position: 'absolute', top: 0, bottom: 0,
              left: 140 + todayX, width: 1,
              background: T.text, zIndex: 4, opacity: 0.85, pointerEvents: 'none'
            }}>
              <div style={{
                position: 'absolute', top: 6, left: -18, width: 38,
                padding: '3px 6px', background: T.text, color: T.bg,
                fontSize: 9, fontWeight: 800, textAlign: 'center', borderRadius: 3,
                letterSpacing: 0.6
              }}>NOW</div>
              <div style={{
                position: 'absolute', top: 24, left: -4, width: 0, height: 0,
                borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
                borderTop: `5px solid ${T.text}`
              }} />
            </div>
          )}

          {/* Domain rows */}
          {blocksByDomain.length === 0 ? (
            <div style={{
              padding: '60px 24px', textAlign: 'center', color: T.textDim,
              maxWidth: 480, margin: '0 auto'
            }}>
              <div style={{ marginBottom: 8, fontSize: 14, color: T.textMid, fontWeight: 600 }}>
                No work blocks scheduled for this day
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                Day Timeline shows time-boxed work sessions per project.
                Add blocks from the list view, or use the <strong style={{ color: T.text }}>+</strong> button.
              </div>
            </div>
          ) : blocksByDomain.map(g => {
            const Icon = ICONS[g.domain.iconKey] || Compass;
            return (
              <div key={g.domain.id} style={{
                display: 'flex', minHeight: 84,
                borderBottom: `1px solid ${T.borderHair}`
              }}>
                {/* Domain label (sticky left) */}
                <div style={{
                  position: 'sticky', left: 0, zIndex: 5,
                  width: 140, flexShrink: 0,
                  background: T.bg, borderRight: `1px solid ${T.borderDim}`,
                  display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px'
                }}>
                  <Icon size={16} color={g.domain.color} strokeWidth={1.75} />
                  <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{g.domain.name}</div>
                </div>

                {/* Blocks area */}
                <div style={{ position: 'relative', flex: 1, padding: '12px 0' }}>
                  {/* Hour grid lines */}
                  {Array.from({ length: hourCount + 1 }, (_, i) => (
                    <div key={i} style={{
                      position: 'absolute', left: i * hourWidth, top: 0, bottom: 0,
                      width: 1, background: i % 3 === 0 ? T.borderHair : 'transparent'
                    }} />
                  ))}

                  {g.blocks.map(b => {
                    const proj = data.projects.find(p => p.id === b.projectId);
                    if (!proj) return null;
                    const x = (b.startHour - startHour) * hourWidth;
                    const w = (b.endHour - b.startHour) * hourWidth - 4;
                    const statusColor = b.status === 'done' ? T.health
                      : b.status === 'inProgress' ? T.wealth : T.textDim;
                    const opacity = b.status === 'planned' ? 0.78 : 1;

                    return (
                      <div key={b.id} onClick={() => onClipTap(proj)}
                        style={{
                          position: 'absolute', left: x, top: 10,
                          width: Math.max(60, w), height: 60,
                          background: T.surface, border: `1px solid ${T.borderHair}`,
                          borderLeft: `3px solid ${g.domain.color}`, borderRadius: 6,
                          padding: '6px 10px', cursor: 'pointer', opacity,
                          overflow: 'hidden', transition: 'background 0.12s', zIndex: 3
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHi; }}
                        onMouseLeave={e => { e.currentTarget.style.background = T.surface; }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 1 }}>
                          <div style={{
                            color: T.text, fontSize: 12, fontWeight: 600, flex: 1,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                          }}>{proj.name}</div>
                          <div style={{
                            width: 8, height: 8, borderRadius: 4,
                            background: statusColor, flexShrink: 0
                          }} />
                        </div>
                        <div style={{
                          color: T.textDim, fontSize: 10, fontWeight: 500,
                          marginBottom: 3, fontVariantNumeric: 'tabular-nums'
                        }}>
                          {formatHour(b.startHour)} – {formatHour(b.endHour)}
                        </div>
                        {b.notes && w > 110 && (
                          <div style={{
                            color: T.textMid, fontSize: 11, lineHeight: 1.3,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                          }}>{b.notes}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div style={{ height: 60 }} />
        </div>
      </div>

      {/* Bottom controls */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 16px', borderTop: `1px solid ${T.borderDim}`,
        background: T.bg, flexShrink: 0
      }}>
        <div style={{ color: T.textDim, fontSize: 11, fontWeight: 600 }}>Zoom</div>
        <IconBtn onClick={() => setHourWidth(w => Math.max(60, w - 15))} size={32}><Minus size={14} /></IconBtn>
        <input type="range" min={60} max={140} value={hourWidth} onChange={e => setHourWidth(+e.target.value)}
          style={{ width: 120, accentColor: T.creative }} />
        <IconBtn onClick={() => setHourWidth(w => Math.min(140, w + 15))} size={32}><Plus size={14} /></IconBtn>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DAILIES — list mode + day timeline mode toggle
// ─────────────────────────────────────────────────────────────────────────────
const DailiesView = ({ data, onClipTap }) => {
  const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0, 10));
  const [mode, setMode] = useState('day');
  const weekDays = useMemo(() => {
    const base = new Date(selectedDate);
    const dow = base.getDay();
    const monday = new Date(base);
    monday.setDate(base.getDate() - ((dow + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday); d.setDate(monday.getDate() + i); return d;
    });
  }, [selectedDate]);

  const sel = new Date(selectedDate);
  const todays = data.projects.filter(p => new Date(p.startDate) <= sel && new Date(p.endDate) >= sel);
  const grouped = data.domains.map(d => ({
    domain: d, projects: todays.filter(p => p.domainId === d.id)
  })).filter(g => g.projects.length > 0);

  const complete = todays.filter(p => p.progress >= 100 || p.status === 'done').length;
  const inProgress = todays.filter(p => p.status === 'active' && p.progress < 100).length;
  const upcoming = todays.filter(p => p.status === 'planned').length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Shared header — date nav + week strip + mode toggle */}
      <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ color: T.text, fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={() => setSelectedDate(today.toISOString().slice(0, 10))} style={{
                padding: '7px 14px', borderRadius: 8,
                background: T.surface, border: `1px solid ${T.border}`,
                color: T.text, fontSize: 12, fontWeight: 600, cursor: 'pointer'
              }}>Today</button>
              <IconBtn onClick={() => {
                const d = new Date(selectedDate); d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().slice(0, 10));
              }}><ChevronLeft size={16} /></IconBtn>
              <IconBtn onClick={() => {
                const d = new Date(selectedDate); d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().slice(0, 10));
              }}><ChevronRight size={16} /></IconBtn>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 12 }}>
            {weekDays.map((d, i) => {
              const ds = d.toISOString().slice(0, 10);
              const isSelected = ds === selectedDate;
              const isTodayDay = ds === today.toISOString().slice(0, 10);
              return (
                <button key={i} onClick={() => setSelectedDate(ds)} style={{
                  padding: '10px 6px', borderRadius: 10,
                  background: isSelected ? T.surface : 'transparent',
                  border: `1px solid ${isSelected ? T.border : 'transparent'}`,
                  color: T.text, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  position: 'relative'
                }}>
                  <div style={{ fontSize: 10, color: isSelected ? T.textMid : T.textDim, fontWeight: 600, letterSpacing: 0.5 }}>
                    {d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? T.text : T.textMid }}>
                    {d.toLocaleDateString('en-US', { month: 'short' })} {d.getDate()}
                  </div>
                  {isTodayDay && !isSelected && (
                    <div style={{ width: 4, height: 4, borderRadius: 2, background: T.text, position: 'absolute', bottom: 4 }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mode toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 8 }}>
            <div style={{
              display: 'inline-flex', borderRadius: 8,
              background: T.surface, border: `1px solid ${T.border}`, padding: 2
            }}>
              {[
                { id: 'list', label: 'List', icon: List },
                { id: 'day',  label: 'Day Timeline', icon: Calendar }
              ].map(opt => {
                const MIcon = opt.icon;
                const isOn = mode === opt.id;
                return (
                  <button key={opt.id} onClick={() => setMode(opt.id)} style={{
                    padding: '6px 12px', borderRadius: 6, border: 'none',
                    background: isOn ? T.surfaceHi : 'transparent',
                    color: isOn ? T.text : T.textDim,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    transition: 'all 0.12s'
                  }}>
                    <MIcon size={12} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mode-specific content */}
      {mode === 'day' && (
        <DayTimelineView data={data} selectedDate={selectedDate} onClipTap={onClipTap} />
      )}

      {mode === 'list' && (
        <div style={{ flex: 1, overflow: 'auto', padding: '4px 24px 24px' }}>
          <div style={{ maxWidth: 980, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, fontSize: 13, color: T.textMid, flexWrap: 'wrap' }}>
                <div style={{ color: T.text, fontWeight: 600 }}>
                  {todays.length} project{todays.length !== 1 ? 's' : ''} active today
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: T.health }} /><span>{complete} done</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: T.wealth }} /><span>{inProgress} in progress</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: T.textDim }} /><span>{upcoming} planned</span>
                </div>
              </div>
              <div style={{ height: 6, background: T.surface, borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
                {todays.length > 0 && <>
                  <div style={{ width: `${(complete / todays.length) * 100}%`, height: '100%', background: T.health }} />
                  <div style={{ width: `${(inProgress / todays.length) * 100}%`, height: '100%', background: T.wealth }} />
                  <div style={{ width: `${(upcoming / todays.length) * 100}%`, height: '100%', background: T.textDim }} />
                </>}
              </div>
            </div>

            {grouped.length === 0 ? (
              <div style={{
                padding: 60, textAlign: 'center', color: T.textDim,
                background: T.surface, borderRadius: 12, border: `1px solid ${T.borderDim}`
              }}>No projects active on this date.</div>
            ) : grouped.map(g => {
              const Icon = ICONS[g.domain.iconKey] || Compass;
              return (
                <div key={g.domain.id} style={{ marginBottom: 24 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                    color: T.text, fontSize: 14, fontWeight: 600
                  }}>
                    <Icon size={16} color={g.domain.color} />{g.domain.name}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {g.projects.map(p => (
                      <button key={p.id} onClick={() => onClipTap(p)} style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '12px 14px', background: 'transparent',
                        border: 'none', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                        transition: 'background 0.12s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = T.surface}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <GripVertical size={14} color={T.textFaint} />
                        <div style={{ minWidth: 160, color: T.text, fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                        <div style={{
                          padding: '3px 8px', borderRadius: 5,
                          background: T.surfaceHi, color: T.textMid, fontSize: 11, fontWeight: 500
                        }}>{p.type}</div>
                        <div style={{ flex: 1, color: T.textDim, fontSize: 12 }}>{subLabel(p)}</div>
                        <StatusPill status={p.status} />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// VISION (unchanged from v0.2)
// ─────────────────────────────────────────────────────────────────────────────
const VisionView = ({ data, onClipTap }) => {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', paddingBottom: 80 }}>
        <div style={{
          padding: 24, marginBottom: 24,
          background: T.surface, border: `1px solid ${T.borderDim}`,
          borderRadius: 14, position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: -20, right: -20, width: 200, height: 200,
            background: `radial-gradient(circle, ${T.creative}22, transparent 70%)`, pointerEvents: 'none'
          }} />
          <div style={{
            fontSize: 10, color: T.textDim, fontWeight: 700,
            letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8
          }}>North Star</div>
          <div style={{
            color: T.text, fontSize: 22, fontWeight: 600, lineHeight: 1.4,
            letterSpacing: -0.3, maxWidth: 720
          }}>"{data.vision.global}"</div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: 16, marginBottom: 24
        }}>
          <div>
            <SectionHeader icon={Target} title="Keystone Skills" subtitle="Meta-skills that compound across projects" color={T.knowledge} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.keystoneSkills.map(s => {
                const usage = data.projects.filter(p => p.keystoneSkills?.includes(s.id)).length;
                return (
                  <div key={s.id} style={{
                    padding: 14, background: T.surface, borderRadius: 12,
                    border: `1px solid ${T.borderDim}`, borderLeft: `3px solid ${T.knowledge}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                      <div style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>{s.name}</div>
                      <div style={{ color: T.textDim, fontSize: 11 }}>{usage} project{usage !== 1 ? 's' : ''}</div>
                    </div>
                    <div style={{ color: T.textDim, fontSize: 12, marginBottom: 10, lineHeight: 1.4 }}>{s.description}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {[1,2,3,4,5].map(n => (
                        <div key={n} style={{
                          width: 26, height: 5, borderRadius: 2.5,
                          background: n <= s.currentLevel ? T.knowledge : `${T.knowledge}1A`
                        }} />
                      ))}
                      <span style={{ color: T.textDim, fontSize: 11, marginLeft: 10, fontVariantNumeric: 'tabular-nums' }}>
                        {s.currentLevel}/{s.targetLevel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <SectionHeader icon={Flag} title="Builds" subtitle="Durable assets being constructed" color={T.self} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.builds.map(b => {
                const fueling = data.projects.filter(p => p.builds?.includes(b.id));
                return (
                  <div key={b.id} style={{
                    padding: 14, background: T.surface, borderRadius: 12,
                    border: `1px solid ${T.borderDim}`, borderLeft: `3px solid ${T.self}`
                  }}>
                    <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{b.name}</div>
                    <div style={{ color: T.textDim, fontSize: 12, marginBottom: 8, lineHeight: 1.4 }}>{b.description}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, marginBottom: fueling.length ? 10 : 0 }}>
                      <span style={{ color: T.textFaint, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>now</span>
                      <span style={{ color: T.textMid }}>{b.currentState}</span>
                      <ArrowRight size={11} color={T.textFaint} />
                      <span style={{ color: T.self }}>{b.targetState}</span>
                    </div>
                    {fueling.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {fueling.map(p => (
                          <button key={p.id} onClick={() => onClipTap(p)} style={{
                            fontSize: 11, padding: '3px 8px', borderRadius: 5,
                            background: T.surfaceHi, color: T.textMid, border: 'none', cursor: 'pointer'
                          }}>{p.name}</button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <SectionHeader icon={Zap} title="Flywheels" subtitle="Self-reinforcing loops powering the empire" color={T.wealth} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.flywheels.map(f => (
            <div key={f.id} style={{
              padding: 14, background: T.surface, borderRadius: 12,
              border: `1px solid ${T.borderDim}`, borderLeft: `3px solid ${T.wealth}`
            }}>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{f.name}</div>
              <div style={{ color: T.textDim, fontSize: 12, marginBottom: 10, lineHeight: 1.4 }}>{f.description}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {f.stages.map((stage, i) => (
                  <React.Fragment key={i}>
                    <div style={{
                      fontSize: 11, padding: '5px 10px', borderRadius: 6,
                      background: `${T.wealth}14`, color: T.wealth, fontWeight: 600
                    }}>{stage}</div>
                    {i < f.stages.length - 1 && <ChevronRight size={12} color={T.textFaint} />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, subtitle, color }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2,
      color: T.text, fontSize: 14, fontWeight: 700
    }}>
      <Icon size={16} color={color} />{title}
    </div>
    {subtitle && <div style={{ color: T.textDim, fontSize: 12, marginLeft: 24 }}>{subtitle}</div>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// RIGHT RAIL — context-aware
// ─────────────────────────────────────────────────────────────────────────────
const RightRail = ({ data, view, selectedDomain }) => {
  // When in domain detail, show DomainDetailRail
  if (view === 'domain' && selectedDomain) {
    return <DomainDetailRail data={data} domainId={selectedDomain} />;
  }

  const activeProjects = data.projects.filter(p => p.status === 'active');
  const avgMomentum = activeProjects.length
    ? Math.round((activeProjects.reduce((s, p) => s + p.scores.momentum, 0) / activeProjects.length) * 10)
    : 0;
  const topLeverage = [...activeProjects]
    .sort((a, b) => composite(b.scores) - composite(a.scores)).slice(0, 4);
  const stuck = activeProjects.filter(p => needsKick(p.scores));
  const upcomingMilestones = data.milestones
    .filter(m => new Date(m.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);

  return (
    <div style={{
      width: 320, flexShrink: 0,
      background: T.bg, borderLeft: `1px solid ${T.borderDim}`,
      overflowY: 'auto', padding: 20
    }}>
      <div style={{
        padding: 18, marginBottom: 16,
        background: T.surface, border: `1px solid ${T.borderDim}`, borderRadius: 12
      }}>
        <div style={{
          fontSize: 10, color: T.textDim, fontWeight: 700,
          letterSpacing: 1.2, marginBottom: 8
        }}>NORTH STAR</div>
        <div style={{ color: T.textMid, fontSize: 13, lineHeight: 1.5, fontWeight: 500 }}>
          "{data.vision.global}"
        </div>
      </div>

      <div style={{
        padding: 18, marginBottom: 16,
        background: T.surface, border: `1px solid ${T.borderDim}`, borderRadius: 12
      }}>
        <div style={{
          fontSize: 10, color: T.textDim, fontWeight: 700,
          letterSpacing: 1.2, marginBottom: 12
        }}>MOMENTUM SCORE</div>
        <MomentumGauge value={avgMomentum} />
      </div>

      <div style={{
        padding: 18, marginBottom: 16,
        background: T.surface, border: `1px solid ${T.borderDim}`, borderRadius: 12
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
          fontSize: 10, color: T.textDim, fontWeight: 700, letterSpacing: 1.2
        }}>
          <Zap size={11} color={T.creative} /> TOP LEVERAGE NOW
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {topLeverage.map(p => {
            const d = data.domains.find(x => x.id === p.domainId);
            return (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 8px', borderRadius: 6, background: T.bg
              }}>
                <div style={{ width: 3, height: 24, borderRadius: 2, background: d?.color }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: T.text, fontSize: 12, fontWeight: 600,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>{p.name}</div>
                  <div style={{ color: T.textDim, fontSize: 10, marginTop: 1 }}>{d?.name}</div>
                </div>
                <ScoreBadge score={composite(p.scores)} />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        padding: 18, marginBottom: 16,
        background: T.surface, border: `1px solid ${T.borderDim}`, borderRadius: 12
      }}>
        <div style={{
          fontSize: 10, color: T.textDim, fontWeight: 700,
          letterSpacing: 1.2, marginBottom: 12
        }}>TODAY vs PLAN</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              fontSize: 10, color: T.textDim, fontWeight: 600,
              width: 44, textAlign: 'right', textTransform: 'uppercase'
            }}>{today.toLocaleDateString('en-US', { month: 'short' })}</div>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: T.health }} />
            <div style={{ color: T.text, fontSize: 12, fontWeight: 600 }}>Today</div>
          </div>
          {upcomingMilestones.map(m => {
            const md = new Date(m.date);
            const d = data.domains.find(x => x.id === m.domainId);
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  fontSize: 10, color: T.textDim, fontWeight: 600,
                  width: 44, textAlign: 'right', textTransform: 'uppercase'
                }}>{md.toLocaleDateString('en-US', { month: 'short' })} {String(md.getFullYear()).slice(-2)}</div>
                <Diamond color={d?.color || T.textDim} filled={m.status === 'hit'} size={8} />
                <div style={{
                  color: T.textMid, fontSize: 12,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>{m.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {stuck.length > 0 && (
        <div style={{
          padding: 18, marginBottom: 16,
          background: T.surface, border: `1px solid ${T.wealth}33`, borderRadius: 12
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
            fontSize: 10, color: T.wealth, fontWeight: 700, letterSpacing: 1.2
          }}>
            <AlertCircle size={11} /> STUCK BUT WANTED
          </div>
          {stuck.map(p => {
            const d = data.domains.find(x => x.id === p.domainId);
            return (
              <div key={p.id} style={{
                fontSize: 12, color: T.textMid, marginBottom: 4,
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <div style={{ width: 3, height: 14, borderRadius: 2, background: d?.color }} />
                {p.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN DETAIL RAIL — vision quote + metric cards with sparklines
// ─────────────────────────────────────────────────────────────────────────────
const DomainDetailRail = ({ data, domainId }) => {
  const domain = data.domains.find(d => d.id === domainId);
  const metrics = useMemo(() => computeDomainMetrics(domain, data.projects, data.milestones), [domain, data.projects, data.milestones]);
  const projects = data.projects.filter(p => p.domainId === domainId);
  const topInDomain = [...projects.filter(p => p.status === 'active')]
    .sort((a, b) => composite(b.scores) - composite(a.scores)).slice(0, 3);

  const formatMetric = (m) => {
    if (m.format === 'decimal') return m.current.toFixed(1);
    if (m.format === 'int') return Math.round(m.current);
    return m.current;
  };

  return (
    <div style={{
      width: 320, flexShrink: 0,
      background: T.bg, borderLeft: `1px solid ${T.borderDim}`,
      overflowY: 'auto', padding: 20
    }}>
      {/* Vision quote card */}
      <div style={{
        padding: 18, marginBottom: 16,
        background: T.surface, border: `1px solid ${T.borderDim}`,
        borderRadius: 12, borderLeft: `3px solid ${domain.color}`,
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -16, right: -16, width: 120, height: 120,
          background: `radial-gradient(circle, ${domain.color}1A, transparent 70%)`,
          pointerEvents: 'none'
        }} />
        <div style={{
          fontSize: 10, color: T.textDim, fontWeight: 700,
          letterSpacing: 1.2, marginBottom: 10
        }}>{domain.name.toUpperCase()} 2030 VISION</div>
        <div style={{
          color: T.textMid, fontSize: 13, lineHeight: 1.5, fontWeight: 500,
          fontStyle: 'italic'
        }}>"{domain.vision}"</div>
      </div>

      {/* Metric cards */}
      <div style={{
        fontSize: 10, color: T.textDim, fontWeight: 700,
        letterSpacing: 1.2, marginBottom: 10, padding: '0 4px'
      }}>KEY METRICS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {metrics.map(m => {
          const onTrack = m.current >= m.target * 0.75;
          const trend = seedSpark(domain.id + m.id, m.current);
          return (
            <div key={m.id} style={{
              padding: 14, background: T.surface, border: `1px solid ${T.borderDim}`,
              borderRadius: 10
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ color: T.textMid, fontSize: 12, fontWeight: 600 }}>{m.name}</div>
                <Sparkline points={trend} color={domain.color} width={64} height={20} showLast />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                <div>
                  <div style={{ color: T.textFaint, fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Current</div>
                  <div style={{
                    color: T.text, fontSize: 18, fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums', lineHeight: 1.1
                  }}>{formatMetric(m)}{m.unit}</div>
                </div>
                <ArrowRight size={12} color={T.textFaint} style={{ marginBottom: 4 }} />
                <div>
                  <div style={{ color: T.textFaint, fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Target</div>
                  <div style={{
                    color: domain.color, fontSize: 18, fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums', lineHeight: 1.1
                  }}>{m.format === 'decimal' ? m.target.toFixed(1) : Math.round(m.target)}{m.unit}</div>
                </div>
                <div style={{ flex: 1 }} />
                {onTrack && (
                  <div style={{
                    fontSize: 9, color: T.health, fontWeight: 700,
                    padding: '3px 6px', background: `${T.health}14`, borderRadius: 4,
                    marginBottom: 2, letterSpacing: 0.5
                  }}>ON TRACK</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Top in this domain */}
      {topInDomain.length > 0 && (
        <div style={{
          padding: 18,
          background: T.surface, border: `1px solid ${T.borderDim}`, borderRadius: 12
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
            fontSize: 10, color: T.textDim, fontWeight: 700, letterSpacing: 1.2
          }}>
            <Zap size={11} color={domain.color} /> TOP IN {domain.name.toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {topInDomain.map(p => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 8px', borderRadius: 6, background: T.bg
              }}>
                <div style={{ width: 3, height: 24, borderRadius: 2, background: domain.color }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: T.text, fontSize: 12, fontWeight: 600,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>{p.name}</div>
                  <div style={{ color: T.textDim, fontSize: 10, marginTop: 1 }}>
                    {p.type} · {p.progress}%
                  </div>
                </div>
                <ScoreBadge score={composite(p.scores)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MomentumGauge = ({ value }) => {
  const radius = 38, stroke = 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 70 ? T.health : value >= 40 ? T.wealth : T.danger;
  const label = value >= 80 ? 'Excellent' : value >= 60 ? 'Strong' : value >= 40 ? 'Building' : 'Low';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ position: 'relative', width: 88, height: 88 }}>
        <svg width={88} height={88} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={44} cy={44} r={radius} stroke={`${color}22`} strokeWidth={stroke} fill="none" />
          <circle cx={44} cy={44} r={radius} stroke={color} strokeWidth={stroke} fill="none"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease-out' }} />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            color: T.text, fontSize: 22, fontWeight: 800,
            fontVariantNumeric: 'tabular-nums', lineHeight: 1
          }}>{value}</div>
          <div style={{ color: T.textDim, fontSize: 9, fontWeight: 600, letterSpacing: 0.5 }}>/100</div>
        </div>
      </div>
      <div>
        <div style={{ color, fontSize: 13, fontWeight: 700 }}>{label}</div>
        <div style={{ color: T.textDim, fontSize: 11, marginTop: 2 }}>Across active projects</div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT SHEET (with track picker added)
// ─────────────────────────────────────────────────────────────────────────────
const ProjectSheet = ({ project, data, onClose, onSave, onDelete, onRequestDeploy, isMobile }) => {
  const [draft, setDraft] = useState(project);
  useEffect(() => setDraft(project), [project?.id]);
  if (!project || !draft) return null;

  const domain = data.domains.find(d => d.id === draft.domainId);
  const tracksForDomain = data.tracks.filter(t => t.domainId === draft.domainId);
  const score = composite(draft.scores);
  const cs = compoundScore(draft);
  const kick = needsKick(draft.scores);
  const setScore = (k, v) => setDraft(d => ({ ...d, scores: { ...d.scores, [k]: v } }));

  const containerStyle = isMobile ? {
    position: 'fixed', inset: 0, zIndex: 100,
    display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.6)'
  } : {
    position: 'fixed', inset: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.6)', padding: 24
  };

  const panelStyle = isMobile ? {
    width: '100%', maxHeight: '92vh', background: T.surface,
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
    display: 'flex', flexDirection: 'column'
  } : {
    width: '100%', maxWidth: 720, maxHeight: '88vh',
    background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14,
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
  };

  return (
    <div onClick={onClose} style={containerStyle}>
      <div onClick={e => e.stopPropagation()} style={panelStyle}>
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border }} />
          </div>
        )}

        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${T.borderDim}`,
          display: 'flex', alignItems: 'center', gap: 14
        }}>
          <div style={{ width: 4, height: 36, borderRadius: 2, background: domain?.color || T.creative }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              style={{
                width: '100%', background: 'transparent', border: 'none', outline: 'none',
                color: T.text, fontSize: 18, fontWeight: 700, padding: 0, letterSpacing: -0.3
              }} />
            <div style={{
              fontSize: 11, color: T.textDim, marginTop: 2,
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              <StatusDot status={draft.status} />
              <span>{domain?.name} · {draft.type}</span>
            </div>
          </div>
          <ScoreBadge score={score} size="md" />
          <IconBtn onClick={onClose}><X size={18} /></IconBtn>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <FieldLabel>Description</FieldLabel>
          <textarea
            value={draft.description || ''}
            onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
            placeholder="What this is and why it matters. The outcome for the person using it."
            rows={3}
            style={{
              width: '100%', padding: 12, marginBottom: 18,
              background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10,
              color: T.text, fontSize: 13, lineHeight: 1.5,
              outline: 'none', boxSizing: 'border-box', resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />

          <FieldLabel>Status</FieldLabel>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
            {Object.keys(STATUS).map(s => (
              <Chip key={s} active={draft.status === s} color={STATUS[s].color}
                onClick={() => setDraft(d => ({ ...d, status: s }))}>{STATUS[s].label}</Chip>
            ))}
          </div>

          <FieldLabel>Priority</FieldLabel>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
            {Object.keys(PRIORITY).map(p => (
              <Chip key={p} active={(draft.priority || 'normal') === p} color={PRIORITY[p].color}
                onClick={() => setDraft(d => ({ ...d, priority: p }))}>{PRIORITY[p].label}</Chip>
            ))}
          </div>

          <FieldLabel>Domain</FieldLabel>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
            {data.domains.map(d => (
              <Chip key={d.id} active={draft.domainId === d.id} color={d.color}
                onClick={() => setDraft(x => ({ ...x, domainId: d.id, trackId: null }))}>{d.name}</Chip>
            ))}
          </div>

          {tracksForDomain.length > 0 && (
            <>
              <FieldLabel>Track (sub-lane)</FieldLabel>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
                <Chip active={!draft.trackId} color={T.textDim}
                  onClick={() => setDraft(d => ({ ...d, trackId: null }))}>Uncategorized</Chip>
                {tracksForDomain.map(t => (
                  <Chip key={t.id} active={draft.trackId === t.id} color={domain?.color || T.creative}
                    onClick={() => setDraft(d => ({ ...d, trackId: t.id }))}>{t.name}</Chip>
                ))}
              </div>
            </>
          )}

          <FieldLabel>Type</FieldLabel>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
            {PROJECT_TYPES.map(t => (
              <Chip key={t} active={draft.type === t} color={T.creative}
                onClick={() => setDraft(d => ({ ...d, type: t }))}>{t}</Chip>
            ))}
          </div>

          <FieldLabel>Tags</FieldLabel>
          <div style={{ marginBottom: 18 }}>
            <TagInput
              value={draft.tags || []}
              onChange={tags => setDraft(d => ({ ...d, tags }))}
              placeholder="Type a tag, press Enter…"
            />
          </div>

          <FieldLabel>Dates</FieldLabel>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            <DateInput label="Start" value={draft.startDate} onChange={v => setDraft(d => ({ ...d, startDate: v }))} />
            <DateInput label="End" value={draft.endDate} onChange={v => setDraft(d => ({ ...d, endDate: v }))} />
          </div>

          <FieldLabel>Progress · {draft.progress}%</FieldLabel>
          <div style={{ height: 6, background: T.surfaceHi, borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{
              width: `${draft.progress}%`, height: '100%',
              background: domain?.color || T.creative, transition: 'width 0.2s'
            }} />
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
            {[0, 25, 50, 75, 100].map(v => (
              <Chip key={v} active={draft.progress === v} color={T.knowledge}
                onClick={() => setDraft(d => ({ ...d, progress: v }))}>{v}%</Chip>
            ))}
          </div>

          <FieldLabel>Images</FieldLabel>
          <div style={{ marginBottom: 18 }}>
            <ImageUploader
              images={draft.images || []}
              onChange={images => setDraft(d => ({ ...d, images }))}
              color={domain?.color || T.creative}
            />
          </div>

          <FieldLabel>
            Score breakdown
            {kick && <span style={{
              marginLeft: 8, fontSize: 9, padding: '2px 6px',
              background: `${T.wealth}22`, color: T.wealth, borderRadius: 4,
              fontWeight: 700, letterSpacing: 0.5
            }}>NEEDS KICK</span>}
          </FieldLabel>
          <div style={{
            background: T.bg, borderRadius: 12, padding: '6px 14px', marginBottom: 18,
            border: `1px solid ${T.borderDim}`
          }}>
            <Stepper label="Impact"        value={draft.scores.impact}        onChange={v => setScore('impact', v)} />
            <Stepper label="Ease"          value={draft.scores.ease}          onChange={v => setScore('ease', v)} />
            <Stepper label="Revenue"       value={draft.scores.revenue}       onChange={v => setScore('revenue', v)} />
            <Stepper label="Strategic fit" value={draft.scores.strategicFit}  onChange={v => setScore('strategicFit', v)} />
            <Stepper label="Momentum"      value={draft.scores.momentum}      onChange={v => setScore('momentum', v)} />
            <Stepper label="Excitement"    value={draft.scores.excitement}    onChange={v => setScore('excitement', v)} />
          </div>

          <FieldLabel>Compound ties · +{cs}/10 auto-scored</FieldLabel>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 18
          }}>
            <TieCard icon={Target} label="Skills"   count={draft.keystoneSkills?.length || 0} color={T.knowledge} />
            <TieCard icon={Flag}   label="Builds"   count={draft.builds?.length || 0}         color={T.self} />
            <TieCard icon={Zap}    label="Flywheel" count={draft.flywheelStage ? 1 : 0}        color={T.wealth} />
          </div>

          <FieldLabel>Keystone skills it develops</FieldLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
            {data.keystoneSkills.map(s => {
              const on = draft.keystoneSkills?.includes(s.id);
              return (
                <Chip key={s.id} active={on} color={T.knowledge} onClick={() => setDraft(d => ({
                  ...d,
                  keystoneSkills: on ? d.keystoneSkills.filter(x => x !== s.id) : [...(d.keystoneSkills || []), s.id]
                }))}>{s.name}</Chip>
              );
            })}
          </div>

          <FieldLabel>Builds it contributes to</FieldLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
            {data.builds.map(b => {
              const on = draft.builds?.includes(b.id);
              return (
                <Chip key={b.id} active={on} color={T.self} onClick={() => setDraft(d => ({
                  ...d,
                  builds: on ? d.builds.filter(x => x !== b.id) : [...(d.builds || []), b.id]
                }))}>{b.name}</Chip>
              );
            })}
          </div>

          <FieldLabel>Tech stack</FieldLabel>
          <div style={{ marginBottom: 18 }}>
            <TagInput
              value={draft.techStack || []}
              onChange={techStack => setDraft(d => ({ ...d, techStack }))}
              placeholder="React, Vercel, Supabase…"
            />
          </div>

          <FieldLabel>Links</FieldLabel>
          <div style={{ marginBottom: 12 }}>
            <LinkInput icon={ExternalLink} label="Chat"    value={draft.chatUrl   || ''} onChange={v => setDraft(d => ({ ...d, chatUrl: v }))}   placeholder="https://claude.ai/chat/…" color={T.creative} />
            <LinkInput icon={Globe}        label="Live"    value={draft.liveUrl   || ''} onChange={v => setDraft(d => ({ ...d, liveUrl: v }))}   placeholder="https://name.scottelling.com" color={T.health} />
            <LinkInput icon={Github}       label="GitHub"  value={draft.githubUrl || ''} onChange={v => setDraft(d => ({ ...d, githubUrl: v }))} placeholder="https://github.com/scottelling/…" color={T.textMid} />
          </div>

          <FieldLabel>Deploy</FieldLabel>
          <div style={{
            padding: 14, marginBottom: 8,
            background: T.bg, border: `1px solid ${T.borderDim}`, borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <DeployBadge status={draft.deployStatus || 'none'} />
            <div style={{ flex: 1, color: T.textDim, fontSize: 11 }}>
              {draft.deployStatus === 'live' && draft.liveUrl
                ? <>Serving from <span style={{ color: T.textMid }}>{draft.liveUrl}</span></>
                : draft.deployStatus === 'pending'
                ? 'Build in progress…'
                : 'Push to GitHub, build on Vercel, alias to subdomain.'}
            </div>
            <button onClick={() => onRequestDeploy(draft)} style={{
              padding: '8px 12px', borderRadius: 8,
              background: T.health, color: T.bg, border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 700
            }}>
              <Rocket size={12} /> Deploy
            </button>
          </div>
        </div>

        <div style={{
          display: 'flex', gap: 8, padding: 14,
          borderTop: `1px solid ${T.borderDim}`, background: T.surface
        }}>
          <button onClick={() => onDelete(project.id)} style={{
            padding: '0 16px', height: 44, borderRadius: 10,
            background: 'transparent', color: T.danger, border: `1px solid ${T.danger}44`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600
          }}>
            <Trash2 size={14} /> Delete
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{
            padding: '0 16px', height: 44, borderRadius: 10,
            background: T.surfaceHi, color: T.text, border: 'none',
            cursor: 'pointer', fontSize: 13, fontWeight: 600
          }}>Cancel</button>
          <button onClick={() => onSave(draft)} style={{
            padding: '0 20px', height: 44, borderRadius: 10,
            background: T.text, color: T.bg, border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 13, fontWeight: 700
          }}>
            <Save size={14} /> Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

const FieldLabel = ({ children }) => (
  <div style={{
    color: T.textDim, fontSize: 10, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
    display: 'flex', alignItems: 'center'
  }}>{children}</div>
);

const DateInput = ({ label, value, onChange }) => (
  <div style={{ flex: 1 }}>
    <div style={{
      fontSize: 10, color: T.textFaint, marginBottom: 4,
      letterSpacing: 0.5, textTransform: 'uppercase'
    }}>{label}</div>
    <input type="date" value={value} onChange={e => onChange(e.target.value)} style={{
      width: '100%', padding: '10px 12px',
      background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10,
      color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box',
      fontVariantNumeric: 'tabular-nums', colorScheme: 'dark'
    }} />
  </div>
);

const TieCard = ({ icon: Icon, label, count, color }) => (
  <div style={{
    padding: 12, borderRadius: 10, background: T.bg, textAlign: 'center',
    border: `1px solid ${count > 0 ? `${color}55` : T.borderDim}`
  }}>
    <Icon size={14} color={count > 0 ? color : T.textDim} style={{ margin: '0 auto 4px', display: 'block' }} />
    <div style={{
      color: count > 0 ? color : T.textDim, fontSize: 16, fontWeight: 700,
      fontVariantNumeric: 'tabular-nums'
    }}>{count}</div>
    <div style={{ color: T.textFaint, fontSize: 10, marginTop: 2 }}>{label}</div>
  </div>
);

const LinkInput = ({ icon: Icon, label, value, onChange, placeholder, color }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 10px', marginBottom: 6,
    background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10
  }}>
    <Icon size={14} color={value ? color : T.textFaint} />
    <div style={{
      width: 56, color: T.textDim, fontSize: 10,
      fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase'
    }}>{label}</div>
    <input
      value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        flex: 1, background: 'transparent', border: 'none', outline: 'none',
        color: T.text, fontSize: 13, fontFamily: 'inherit'
      }}
    />
    {value && (
      <a href={value} target="_blank" rel="noreferrer" style={{
        display: 'flex', alignItems: 'center',
        color: color, padding: 4
      }}><ExternalLink size={12} /></a>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ADD PROJECT
// ─────────────────────────────────────────────────────────────────────────────
const AddProjectSheet = ({ data, onClose, onAdd, isMobile, defaultDomainId }) => {
  const [name, setName] = useState('');
  const [domainId, setDomainId] = useState(defaultDomainId || data.domains[0].id);
  const [trackId, setTrackId] = useState(null);
  const [type, setType] = useState('App');
  const tracksForDomain = data.tracks.filter(t => t.domainId === domainId);

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      id: `p${Date.now()}`,
      domainId, trackId, name: name.trim(), type, status: 'planned',
      startDate: monthFromToday(0), endDate: monthFromToday(3),
      progress: 0, scores: { impact: 5, ease: 5, revenue: 5, strategicFit: 5, momentum: 5, excitement: 5 },
      keystoneSkills: [], builds: [], flywheelStage: null, chatUrl: '',
      ...PROJECT_DEFAULTS
    });
  };

  const containerStyle = isMobile ? {
    position: 'fixed', inset: 0, zIndex: 100,
    display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.6)'
  } : {
    position: 'fixed', inset: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.6)', padding: 24
  };

  const panelStyle = isMobile ? {
    width: '100%', background: T.surface,
    borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 20
  } : {
    width: '100%', maxWidth: 520,
    background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: 14, padding: 24
  };

  return (
    <div onClick={onClose} style={containerStyle}>
      <div onClick={e => e.stopPropagation()} style={panelStyle}>
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border }} />
          </div>
        )}
        <div style={{
          color: T.text, fontSize: 18, fontWeight: 700, marginBottom: 18, letterSpacing: -0.3
        }}>New project</div>

        <FieldLabel>Name</FieldLabel>
        <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="What's the project?"
          style={{
            width: '100%', padding: 12, marginBottom: 18,
            background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10,
            color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box'
          }} />

        <FieldLabel>Domain</FieldLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
          {data.domains.map(d => (
            <Chip key={d.id} active={domainId === d.id} color={d.color}
              onClick={() => { setDomainId(d.id); setTrackId(null); }}>{d.name}</Chip>
          ))}
        </div>

        {tracksForDomain.length > 0 && (
          <>
            <FieldLabel>Track</FieldLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
              <Chip active={!trackId} color={T.textDim} onClick={() => setTrackId(null)}>Uncategorized</Chip>
              {tracksForDomain.map(t => (
                <Chip key={t.id} active={trackId === t.id}
                  color={data.domains.find(d => d.id === domainId)?.color}
                  onClick={() => setTrackId(t.id)}>{t.name}</Chip>
              ))}
            </div>
          </>
        )}

        <FieldLabel>Type</FieldLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22 }}>
          {PROJECT_TYPES.map(t => (
            <Chip key={t} active={type === t} color={T.creative} onClick={() => setType(t)}>{t}</Chip>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: 12, borderRadius: 10,
            background: T.surfaceHi, color: T.text, border: 'none',
            fontSize: 13, fontWeight: 600, cursor: 'pointer'
          }}>Cancel</button>
          <button onClick={submit} disabled={!name.trim()} style={{
            flex: 1, padding: 12, borderRadius: 10,
            background: name.trim() ? T.text : T.surfaceHi,
            color: name.trim() ? T.bg : T.textDim, border: 'none',
            fontSize: 13, fontWeight: 700, cursor: name.trim() ? 'pointer' : 'not-allowed'
          }}>Add project</button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FEED PRIMITIVES — priority chip, deploy badge, tag chip, image uploader
// ─────────────────────────────────────────────────────────────────────────────
const PriorityPill = ({ priority }) => {
  const p = PRIORITY[priority] || PRIORITY.normal;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 8px', borderRadius: 999,
      background: `${p.color}14`, color: p.color,
      fontSize: 10, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase'
    }}>
      <Flag size={9} /> {p.label}
    </div>
  );
};

const DeployBadge = ({ status, compact }) => {
  const d = DEPLOY[status] || DEPLOY.none;
  if (compact) {
    return (
      <div title={d.label} style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 10, color: d.color, fontWeight: 700, letterSpacing: 0.4
      }}>
        <div style={{ width: 6, height: 6, borderRadius: 3, background: d.color }} />
        {d.label.toUpperCase()}
      </div>
    );
  }
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999,
      background: `${d.color}14`, color: d.color, border: `1px solid ${d.color}33`,
      fontSize: 11, fontWeight: 700
    }}>
      <Globe size={10} /> {d.label}
    </div>
  );
};

const Tag = ({ label, onRemove }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 8px 3px 8px', borderRadius: 4,
    background: T.surfaceHi, color: T.textMid,
    fontSize: 11, fontWeight: 500
  }}>
    <TagIcon size={9} color={T.textFaint} /> {label}
    {onRemove && (
      <button onClick={onRemove} style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: T.textDim, padding: 0, marginLeft: 2, display: 'flex'
      }}><X size={10} /></button>
    )}
  </div>
);

const TagInput = ({ value = [], onChange, placeholder = 'Add tag…' }) => {
  const [draft, setDraft] = useState('');
  const commit = () => {
    const v = draft.trim();
    if (!v) return;
    if (value.includes(v)) { setDraft(''); return; }
    onChange([...value, v]);
    setDraft('');
  };
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6,
      padding: 8, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`,
      minHeight: 44
    }}>
      {value.map((t, i) => (
        <Tag key={i} label={t} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
      ))}
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); }
          if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
        }}
        placeholder={value.length ? '' : placeholder}
        style={{
          flex: 1, minWidth: 100,
          background: 'transparent', border: 'none', outline: 'none',
          color: T.text, fontSize: 13
        }}
      />
    </div>
  );
};

const ImageUploader = ({ images = [], onChange, color = T.creative }) => {
  const fileRef = useRef(null);
  const handleFiles = async (files) => {
    const next = [...images];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('image/')) continue;
      try {
        const dataUrl = await fileToDataUrl(f);
        next.push({ id: `img${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, dataUrl, caption: f.name.replace(/\.[^.]+$/, '') });
      } catch (e) {}
    }
    onChange(next);
  };
  const removeAt = (i) => onChange(images.filter((_, j) => j !== i));
  const promoteToHero = (i) => {
    if (i === 0) return;
    const next = [...images];
    const [hero] = next.splice(i, 1);
    onChange([hero, ...next]);
  };

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
        gap: 8, marginBottom: 8
      }}>
        {images.map((img, i) => (
          <div key={img.id || i} style={{
            position: 'relative', aspectRatio: '4/3', borderRadius: 8,
            overflow: 'hidden', border: `1px solid ${i === 0 ? color : T.border}`,
            background: T.bg
          }}>
            <img src={img.dataUrl} alt={img.caption || ''} style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block'
            }} />
            {i === 0 && (
              <div style={{
                position: 'absolute', top: 4, left: 4,
                padding: '2px 6px', borderRadius: 4,
                background: color, color: T.bg,
                fontSize: 9, fontWeight: 800, letterSpacing: 0.5
              }}>HERO</div>
            )}
            <div style={{
              position: 'absolute', top: 4, right: 4,
              display: 'flex', gap: 2
            }}>
              {i !== 0 && (
                <button onClick={() => promoteToHero(i)} title="Set as hero" style={{
                  width: 22, height: 22, borderRadius: 4, border: 'none',
                  background: 'rgba(0,0,0,0.6)', color: T.text, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}><Star size={11} /></button>
              )}
              <button onClick={() => removeAt(i)} title="Remove" style={{
                width: 22, height: 22, borderRadius: 4, border: 'none',
                background: 'rgba(0,0,0,0.6)', color: T.text, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}><X size={11} /></button>
            </div>
          </div>
        ))}
        <button onClick={() => fileRef.current?.click()} style={{
          aspectRatio: '4/3', borderRadius: 8,
          background: T.bg, border: `1.5px dashed ${T.border}`,
          color: T.textDim, cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 4, fontSize: 11, fontWeight: 600
        }}>
          <Camera size={18} />
          Add image
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple
        onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
        style={{ display: 'none' }} />
      <div style={{ color: T.textFaint, fontSize: 11 }}>
        Drop screenshots, mockups, or product shots. First image becomes the hero.
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FEED VIEW — grid / cards / compact, with rich filters
// ─────────────────────────────────────────────────────────────────────────────
const FeedView = ({ data, onClipTap, search }) => {
  const [density, setDensity] = useState('grid'); // grid | cards | compact
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('composite'); // composite | momentum | priority | recent | name
  const [filters, setFilters] = useState({
    domains: [], tracks: [], statuses: [], types: [], priorities: [], tags: [],
    hasImages: false, hasDeploy: false, minScore: 0
  });

  const toggleIn = (key, value) => setFilters(f => ({
    ...f,
    [key]: f[key].includes(value) ? f[key].filter(x => x !== value) : [...f[key], value]
  }));
  const clearFilters = () => setFilters({
    domains: [], tracks: [], statuses: [], types: [], priorities: [], tags: [],
    hasImages: false, hasDeploy: false, minScore: 0
  });

  const allTags = useMemo(() => {
    const s = new Set();
    data.projects.forEach(p => (p.tags || []).forEach(t => s.add(t)));
    return Array.from(s).sort();
  }, [data.projects]);

  const filtered = useMemo(() => {
    let list = data.projects.filter(p => {
      if (filters.domains.length && !filters.domains.includes(p.domainId)) return false;
      if (filters.tracks.length && !filters.tracks.includes(p.trackId)) return false;
      if (filters.statuses.length && !filters.statuses.includes(p.status)) return false;
      if (filters.types.length && !filters.types.includes(p.type)) return false;
      if (filters.priorities.length && !filters.priorities.includes(p.priority || 'normal')) return false;
      if (filters.tags.length && !filters.tags.some(t => (p.tags || []).includes(t))) return false;
      if (filters.hasImages && !(p.images && p.images.length)) return false;
      if (filters.hasDeploy && p.deployStatus !== 'live') return false;
      if (filters.minScore && composite(p.scores) < filters.minScore) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')} ${(p.techStack || []).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const priOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    list.sort((a, b) => {
      switch (sortBy) {
        case 'composite': return composite(b.scores) - composite(a.scores);
        case 'momentum':  return b.scores.momentum - a.scores.momentum;
        case 'priority':  return (priOrder[a.priority] ?? 2) - (priOrder[b.priority] ?? 2);
        case 'recent':    return new Date(b.startDate) - new Date(a.startDate);
        case 'name':      return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
    return list;
  }, [data.projects, filters, sortBy, search]);

  const activeFilterCount = filters.domains.length + filters.tracks.length + filters.statuses.length
    + filters.types.length + filters.priorities.length + filters.tags.length
    + (filters.hasImages ? 1 : 0) + (filters.hasDeploy ? 1 : 0) + (filters.minScore ? 1 : 0);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        padding: '14px 24px', borderBottom: `1px solid ${T.borderDim}`,
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'
      }}>
        <div style={{ color: T.text, fontSize: 18, fontWeight: 700, letterSpacing: -0.2 }}>
          Feed
        </div>
        <div style={{ color: T.textDim, fontSize: 12 }}>
          {filtered.length} of {data.projects.length}
        </div>

        <div style={{ flex: 1 }} />

        <button onClick={() => setShowFilters(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 12px', borderRadius: 8,
          background: showFilters || activeFilterCount > 0 ? `${T.creative}1A` : T.surface,
          border: `1px solid ${showFilters || activeFilterCount > 0 ? `${T.creative}55` : T.border}`,
          color: showFilters || activeFilterCount > 0 ? T.creative : T.text,
          fontSize: 12, fontWeight: 600, cursor: 'pointer'
        }}>
          <LayoutGrid size={13} /> Filters
          {activeFilterCount > 0 && (
            <span style={{
              padding: '0 6px', borderRadius: 999,
              background: T.creative, color: T.bg,
              fontSize: 10, fontWeight: 800, minWidth: 16, textAlign: 'center'
            }}>{activeFilterCount}</span>
          )}
        </button>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
          padding: '7px 10px', borderRadius: 8,
          background: T.surface, border: `1px solid ${T.border}`,
          color: T.text, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          outline: 'none'
        }}>
          <option value="composite">Sort: Composite</option>
          <option value="momentum">Sort: Momentum</option>
          <option value="priority">Sort: Priority</option>
          <option value="recent">Sort: Recent</option>
          <option value="name">Sort: Name</option>
        </select>

        <div style={{
          display: 'inline-flex', borderRadius: 8,
          background: T.surface, border: `1px solid ${T.border}`, padding: 2
        }}>
          {[
            { id: 'grid',    icon: LayoutGrid, title: 'Grid'    },
            { id: 'cards',   icon: ImageIcon,  title: 'Cards'   },
            { id: 'compact', icon: Rows3,      title: 'Compact' }
          ].map(opt => {
            const Ic = opt.icon;
            const on = density === opt.id;
            return (
              <button key={opt.id} onClick={() => setDensity(opt.id)} title={opt.title} style={{
                width: 32, height: 28, borderRadius: 6, border: 'none',
                background: on ? T.surfaceHi : 'transparent',
                color: on ? T.text : T.textDim, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}><Ic size={13} /></button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {showFilters && (
          <FilterPanel
            data={data}
            filters={filters}
            setFilters={setFilters}
            toggleIn={toggleIn}
            allTags={allTags}
            clearFilters={clearFilters}
            onClose={() => setShowFilters(false)}
          />
        )}

        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px 40px' }}>
          {filtered.length === 0 ? (
            <div style={{
              padding: 60, textAlign: 'center', color: T.textDim,
              background: T.surface, borderRadius: 12, border: `1px solid ${T.borderDim}`,
              maxWidth: 480, margin: '40px auto'
            }}>
              <Eye size={24} color={T.textFaint} style={{ marginBottom: 12 }} />
              <div style={{ color: T.text, fontWeight: 600, marginBottom: 4 }}>Nothing matches</div>
              <div style={{ fontSize: 13 }}>Try clearing filters or widening the search.</div>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} style={{
                  marginTop: 16, padding: '8px 16px', borderRadius: 8,
                  background: T.surfaceHi, color: T.text, border: 'none',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}>Clear filters</button>
              )}
            </div>
          ) : density === 'compact' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {filtered.map(p => {
                const d = data.domains.find(x => x.id === p.domainId);
                return <ProjectRowCompact key={p.id} project={p} domain={d} onClick={() => onClipTap(p)} />;
              })}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: density === 'cards'
                ? 'repeat(auto-fill, minmax(320px, 1fr))'
                : 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: density === 'cards' ? 18 : 14
            }}>
              {filtered.map(p => {
                const d = data.domains.find(x => x.id === p.domainId);
                return density === 'cards'
                  ? <ProjectCardLarge key={p.id} project={p} domain={d} onClick={() => onClipTap(p)} />
                  : <ProjectCardGrid  key={p.id} project={p} domain={d} onClick={() => onClipTap(p)} />;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FilterPanel = ({ data, filters, setFilters, toggleIn, allTags, clearFilters, onClose }) => {
  const tracksByDomain = data.tracks;
  const visibleTracks = filters.domains.length
    ? tracksByDomain.filter(t => filters.domains.includes(t.domainId))
    : tracksByDomain;

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontSize: 10, color: T.textDim, fontWeight: 700,
        letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8
      }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{children}</div>
    </div>
  );

  return (
    <div style={{
      width: 280, flexShrink: 0,
      background: T.bg, borderRight: `1px solid ${T.borderDim}`,
      overflowY: 'auto', padding: 18
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16
      }}>
        <div style={{ color: T.text, fontSize: 14, fontWeight: 700 }}>Filters</div>
        <button onClick={clearFilters} style={{
          background: 'transparent', border: 'none', color: T.textDim,
          fontSize: 11, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline'
        }}>Clear all</button>
      </div>

      <Section title="Domain">
        {data.domains.map(d => (
          <Chip key={d.id} active={filters.domains.includes(d.id)} color={d.color}
            onClick={() => toggleIn('domains', d.id)}>{d.name}</Chip>
        ))}
      </Section>

      {visibleTracks.length > 0 && (
        <Section title="Track">
          {visibleTracks.map(t => {
            const dom = data.domains.find(d => d.id === t.domainId);
            return (
              <Chip key={t.id} active={filters.tracks.includes(t.id)} color={dom?.color}
                onClick={() => toggleIn('tracks', t.id)}>{t.name}</Chip>
            );
          })}
        </Section>
      )}

      <Section title="Status">
        {Object.keys(STATUS).map(s => (
          <Chip key={s} active={filters.statuses.includes(s)} color={STATUS[s].color}
            onClick={() => toggleIn('statuses', s)}>{STATUS[s].label}</Chip>
        ))}
      </Section>

      <Section title="Type">
        {PROJECT_TYPES.map(t => (
          <Chip key={t} active={filters.types.includes(t)} color={T.creative}
            onClick={() => toggleIn('types', t)}>{t}</Chip>
        ))}
      </Section>

      <Section title="Priority">
        {Object.keys(PRIORITY).map(p => (
          <Chip key={p} active={filters.priorities.includes(p)} color={PRIORITY[p].color}
            onClick={() => toggleIn('priorities', p)}>{PRIORITY[p].label}</Chip>
        ))}
      </Section>

      {allTags.length > 0 && (
        <Section title="Tags">
          {allTags.map(t => (
            <Chip key={t} active={filters.tags.includes(t)} color={T.knowledge}
              onClick={() => toggleIn('tags', t)}>{t}</Chip>
          ))}
        </Section>
      )}

      <Section title="Flags">
        <Chip active={filters.hasImages} color={T.network}
          onClick={() => setFilters(f => ({ ...f, hasImages: !f.hasImages }))}>
          <ImageIcon size={11} /> Has images
        </Chip>
        <Chip active={filters.hasDeploy} color={T.health}
          onClick={() => setFilters(f => ({ ...f, hasDeploy: !f.hasDeploy }))}>
          <Globe size={11} /> Live deploy
        </Chip>
      </Section>

      <Section title={`Min composite · ${filters.minScore || 0}`}>
        <div style={{ width: '100%' }}>
          <input type="range" min={0} max={100} step={5}
            value={filters.minScore}
            onChange={e => setFilters(f => ({ ...f, minScore: +e.target.value }))}
            style={{ width: '100%', accentColor: T.creative }} />
        </div>
      </Section>
    </div>
  );
};

// Card variants
const ProjectCardLarge = ({ project, domain, onClick }) => {
  const score = composite(project.scores);
  const hero = heroImageFor(project, domain);
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', padding: 0, cursor: 'pointer',
      background: T.surface, border: `1px solid ${T.borderDim}`,
      borderRadius: 14, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      transition: 'transform 0.12s, border-color 0.12s'
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = T.border; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = T.borderDim; }}>
      <div style={{ position: 'relative', aspectRatio: '16/9', background: T.bg }}>
        <img src={hero} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{
          position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6
        }}>
          <PriorityPill priority={project.priority || 'normal'} />
        </div>
        <div style={{
          position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6
        }}>
          <DeployBadge status={project.deployStatus || 'none'} />
        </div>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
          background: 'linear-gradient(to top, rgba(10,11,15,0.85), transparent)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: 10, left: 14, right: 14,
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: domain?.color }} />
          <div style={{ color: T.textMid, fontSize: 11, fontWeight: 600 }}>{domain?.name} · {project.type}</div>
        </div>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{
            flex: 1, color: T.text, fontSize: 16, fontWeight: 700,
            letterSpacing: -0.2, lineHeight: 1.25
          }}>{project.name}</div>
          <ScoreBadge score={score} size="md" />
        </div>
        {project.description && (
          <div style={{
            color: T.textMid, fontSize: 12, lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>{project.description}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
          <StatusPill status={project.status} />
          <div style={{ flex: 1 }} />
          <div style={{ color: T.textDim, fontSize: 11, fontWeight: 600 }}>{project.progress}%</div>
        </div>
        <div style={{
          height: 3, background: T.surfaceHi, borderRadius: 2, overflow: 'hidden'
        }}>
          <div style={{
            width: `${project.progress}%`, height: '100%',
            background: domain?.color || T.creative, borderRadius: 2
          }} />
        </div>
        {(project.tags && project.tags.length > 0) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {project.tags.slice(0, 4).map(t => <Tag key={t} label={t} />)}
            {project.tags.length > 4 && (
              <div style={{ color: T.textDim, fontSize: 10, padding: '3px 0' }}>+{project.tags.length - 4}</div>
            )}
          </div>
        )}
      </div>
    </button>
  );
};

const ProjectCardGrid = ({ project, domain, onClick }) => {
  const score = composite(project.scores);
  const hero = heroImageFor(project, domain);
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', padding: 0, cursor: 'pointer',
      background: T.surface, border: `1px solid ${T.borderDim}`,
      borderRadius: 12, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      transition: 'border-color 0.12s'
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = T.border}
    onMouseLeave={e => e.currentTarget.style.borderColor = T.borderDim}>
      <div style={{ position: 'relative', aspectRatio: '4/3', background: T.bg }}>
        <img src={hero} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{
          position: 'absolute', top: 8, left: 8, padding: '2px 7px',
          background: 'rgba(10,11,15,0.8)', borderRadius: 4,
          fontSize: 10, fontWeight: 700, color: domain?.color, letterSpacing: 0.4
        }}>{project.type.toUpperCase()}</div>
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <DeployBadge status={project.deployStatus || 'none'} compact />
        </div>
      </div>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <div style={{
            flex: 1, color: T.text, fontSize: 13, fontWeight: 700,
            lineHeight: 1.25, overflow: 'hidden',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
          }}>{project.name}</div>
          <ScoreBadge score={score} size="sm" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: domain?.color }} />
          <div style={{ color: T.textDim, fontSize: 11, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {domain?.name}
          </div>
          <StatusDot status={project.status} />
        </div>
        <div style={{ height: 2, background: T.surfaceHi, borderRadius: 1, overflow: 'hidden' }}>
          <div style={{ width: `${project.progress}%`, height: '100%', background: domain?.color || T.creative }} />
        </div>
      </div>
    </button>
  );
};

const ProjectRowCompact = ({ project, domain, onClick }) => {
  const score = composite(project.scores);
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px', borderRadius: 8,
      background: 'transparent', border: 'none', cursor: 'pointer',
      textAlign: 'left', transition: 'background 0.12s'
    }}
    onMouseEnter={e => e.currentTarget.style.background = T.surface}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <div style={{
        width: 36, height: 28, borderRadius: 5, overflow: 'hidden',
        background: T.surfaceHi, flexShrink: 0,
        border: `1px solid ${T.borderDim}`
      }}>
        <img src={heroImageFor(project, domain)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ width: 3, height: 24, borderRadius: 2, background: domain?.color, flexShrink: 0 }} />
      <StatusDot status={project.status} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: T.text, fontSize: 13, fontWeight: 600,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>{project.name}</div>
        <div style={{ color: T.textDim, fontSize: 11, marginTop: 1 }}>
          {domain?.name} · {project.type}
        </div>
      </div>
      {project.priority && project.priority !== 'normal' && <PriorityPill priority={project.priority} />}
      <DeployBadge status={project.deployStatus || 'none'} compact />
      <div style={{ color: T.textDim, fontSize: 11, fontWeight: 600, fontVariantNumeric: 'tabular-nums', minWidth: 32, textAlign: 'right' }}>
        {project.progress}%
      </div>
      <ScoreBadge score={score} />
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS MODAL — JSON I/O, deploy config, about
// ─────────────────────────────────────────────────────────────────────────────
const SettingsModal = ({ data, onClose, onImport, onReset, onSaveConfig, isMobile }) => {
  const [tab, setTab] = useState('data');
  const [importErr, setImportErr] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const [config, setConfig] = useState(data.deployConfig || DEFAULT_DEPLOY_CONFIG);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef(null);

  const handleImportFile = async (file, mode) => {
    setImportErr(''); setImportMsg('');
    try {
      const text = await file.text();
      const result = validateImport(text);
      if (!result.ok) { setImportErr(result.error); return; }
      onImport(result.data, mode);
      setImportMsg(`Imported ${result.data.projects.length} projects (${mode}).`);
    } catch (e) {
      setImportErr(e.message);
    }
  };

  const exportFull   = () => downloadJson(data, `project-edit-${new Date().toISOString().slice(0,10)}.json`);
  const exportProjects = () => downloadJson({ projects: data.projects }, `projects-${new Date().toISOString().slice(0,10)}.json`);
  const exportTemplate = () => downloadJson({
    projects: [{
      id: 'p-new-1',
      domainId: 'health',
      trackId: 'th1',
      name: 'My new project',
      type: 'App',
      status: 'planned',
      startDate: monthFromToday(0),
      endDate: monthFromToday(3),
      progress: 0,
      scores: { impact: 5, ease: 5, revenue: 5, strategicFit: 5, momentum: 5, excitement: 5 },
      keystoneSkills: [],
      builds: [],
      flywheelStage: null,
      chatUrl: '',
      description: 'What this is and why it matters.',
      tags: ['example'],
      priority: 'normal',
      images: [],
      techStack: ['React'],
      liveUrl: '',
      githubUrl: '',
      deployStatus: 'none'
    }]
  }, 'project-edit-template.json');

  const panelStyle = isMobile ? {
    width: '100%', maxHeight: '92vh', background: T.surface,
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
    display: 'flex', flexDirection: 'column'
  } : {
    width: '100%', maxWidth: 720, maxHeight: '88vh',
    background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14,
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
  };
  const containerStyle = isMobile ? {
    position: 'fixed', inset: 0, zIndex: 100,
    display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.6)'
  } : {
    position: 'fixed', inset: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.6)', padding: 24
  };

  return (
    <div onClick={onClose} style={containerStyle}>
      <div onClick={e => e.stopPropagation()} style={panelStyle}>
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border }} />
          </div>
        )}
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${T.borderDim}`,
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <Settings size={18} color={T.textMid} />
          <div style={{ flex: 1, color: T.text, fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>Settings</div>
          <IconBtn onClick={onClose}><X size={18} /></IconBtn>
        </div>

        <div style={{
          display: 'flex', gap: 0, padding: '0 8px',
          borderBottom: `1px solid ${T.borderDim}`
        }}>
          {[
            { id: 'data',   label: 'Data',   icon: FileJson },
            { id: 'deploy', label: 'Deploy', icon: Rocket },
            { id: 'about',  label: 'About',  icon: Compass }
          ].map(t => {
            const Ic = t.icon;
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '12px 16px', background: 'transparent', border: 'none',
                color: on ? T.text : T.textDim, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                borderBottom: `2px solid ${on ? T.text : 'transparent'}`,
                marginBottom: -1
              }}>
                <Ic size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {tab === 'data' && (
            <>
              <FieldLabel>Export</FieldLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 22 }}>
                <SettingsAction icon={Download} title="Full backup" subtitle="Everything as JSON" onClick={exportFull} color={T.health} />
                <SettingsAction icon={Download} title="Projects only" subtitle="Just the projects" onClick={exportProjects} color={T.network} />
                <SettingsAction icon={FileJson} title="Template" subtitle="Sample JSON shape" onClick={exportTemplate} color={T.knowledge} />
              </div>

              <FieldLabel>Import</FieldLabel>
              <div style={{
                padding: 16, background: T.bg, borderRadius: 12,
                border: `1.5px dashed ${T.border}`, marginBottom: 12
              }}>
                <div style={{ color: T.text, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  Upload a JSON file
                </div>
                <div style={{ color: T.textDim, fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
                  Merge adds new projects (by id) without touching existing ones. Replace swaps the whole dataset for what's in the file.
                </div>
                <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleImportFile(f, fileRef.current.dataset.mode || 'merge');
                    e.target.value = '';
                  }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { fileRef.current.dataset.mode = 'merge';   fileRef.current.click(); }} style={btnPrimary}>
                    <Upload size={13} /> Merge
                  </button>
                  <button onClick={() => { fileRef.current.dataset.mode = 'replace'; fileRef.current.click(); }} style={btnSecondary}>
                    <RefreshCw size={13} /> Replace all
                  </button>
                </div>
                {importErr && (
                  <div style={{
                    marginTop: 12, padding: 10, borderRadius: 8,
                    background: `${T.danger}14`, color: T.danger, fontSize: 12
                  }}>{importErr}</div>
                )}
                {importMsg && (
                  <div style={{
                    marginTop: 12, padding: 10, borderRadius: 8,
                    background: `${T.health}14`, color: T.health, fontSize: 12
                  }}>{importMsg}</div>
                )}
              </div>

              <FieldLabel>Reset</FieldLabel>
              {!confirmReset ? (
                <button onClick={() => setConfirmReset(true)} style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: 'transparent', color: T.danger,
                  border: `1px solid ${T.danger}44`, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 12, fontWeight: 600
                }}>
                  <Trash2 size={13} /> Reset to default seed data
                </button>
              ) : (
                <div style={{
                  padding: 14, borderRadius: 12,
                  background: `${T.danger}0A`, border: `1px solid ${T.danger}33`
                }}>
                  <div style={{ color: T.text, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    This wipes all changes and restores the original seed.
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { onReset(); setConfirmReset(false); }} style={{
                      padding: '8px 12px', borderRadius: 8,
                      background: T.danger, color: T.bg, border: 'none',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer'
                    }}>Yes, reset</button>
                    <button onClick={() => setConfirmReset(false)} style={btnSecondary}>Cancel</button>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'deploy' && (
            <>
              <FieldLabel>Domain & repos</FieldLabel>
              <ConfigInput label="Root domain"     value={config.rootDomain}    onChange={v => setConfig(c => ({ ...c, rootDomain: v }))}    placeholder="scottelling.com" />
              <ConfigInput label="GitHub org/user" value={config.githubOrg}     onChange={v => setConfig(c => ({ ...c, githubOrg: v }))}     placeholder="scottelling" />
              <ConfigInput label="Vercel team"     value={config.vercelTeam}    onChange={v => setConfig(c => ({ ...c, vercelTeam: v }))}    placeholder="scott" />
              <ConfigInput label="Default branch"  value={config.defaultBranch} onChange={v => setConfig(c => ({ ...c, defaultBranch: v }))} placeholder="main" />

              <div style={{
                padding: 14, marginTop: 8, marginBottom: 18,
                background: T.bg, border: `1px solid ${T.borderDim}`, borderRadius: 10,
                display: 'flex', alignItems: 'center', gap: 12
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>Auto-deploy on save</div>
                  <div style={{ color: T.textDim, fontSize: 11, marginTop: 2 }}>
                    Push to GitHub triggers Vercel build, alias to subdomain.
                  </div>
                </div>
                <button onClick={() => setConfig(c => ({ ...c, autoDeploy: !c.autoDeploy }))} style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: config.autoDeploy ? T.health : T.surfaceHi,
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'background 0.15s'
                }}>
                  <div style={{
                    position: 'absolute', top: 2, left: config.autoDeploy ? 22 : 2,
                    width: 20, height: 20, borderRadius: 10, background: T.text,
                    transition: 'left 0.15s'
                  }} />
                </button>
              </div>

              <button onClick={() => onSaveConfig(config)} style={btnPrimary}>
                <Save size={13} /> Save config
              </button>

              <div style={{
                marginTop: 22, padding: 14, borderRadius: 10,
                background: `${T.network}0A`, border: `1px solid ${T.network}33`
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <AlertCircle size={14} color={T.network} style={{ marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: T.text, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      Demo wiring
                    </div>
                    <div style={{ color: T.textMid, fontSize: 11, lineHeight: 1.5 }}>
                      Deploy actions are simulated in this prototype. Connect a real GitHub token + Vercel API key in a server function to flip the switch to production.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'about' && (
            <>
              <div style={{
                padding: 18, marginBottom: 16,
                background: T.bg, border: `1px solid ${T.borderDim}`, borderRadius: 12
              }}>
                <div style={{ color: T.text, fontSize: 18, fontWeight: 800, letterSpacing: 1.5, marginBottom: 4 }}>
                  PROJECT EDIT
                </div>
                <div style={{ color: T.textDim, fontSize: 12 }}>v0.5 · Empire cockpit prototype</div>
              </div>
              <div style={{ color: T.textMid, fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
                Project Edit is the cockpit for the empire — every project, every connection, every flywheel from one timeline. This is a prototype: data lives in your browser via localStorage, deploys are simulated, and image uploads are stored as data URLs.
              </div>
              <FieldLabel>What's new in 0.5</FieldLabel>
              <ul style={{ color: T.textMid, fontSize: 12, lineHeight: 1.8, paddingLeft: 18, margin: 0 }}>
                <li>Feed view — grid, cards, compact rows</li>
                <li>Rich filters by domain, track, type, priority, tag, score</li>
                <li>Image uploads per project</li>
                <li>Tags, priority, tech stack, live URL, GitHub URL</li>
                <li>JSON import / export / template</li>
                <li>Deploy flow scaffolding (GitHub → Vercel → subdomain)</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const btnPrimary = {
  padding: '10px 14px', borderRadius: 10,
  background: T.text, color: T.bg, border: 'none',
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
  fontSize: 12, fontWeight: 700
};
const btnSecondary = {
  padding: '10px 14px', borderRadius: 10,
  background: T.surfaceHi, color: T.text, border: 'none',
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
  fontSize: 12, fontWeight: 600
};

const SettingsAction = ({ icon: Icon, title, subtitle, onClick, color }) => (
  <button onClick={onClick} style={{
    padding: 14, borderRadius: 12,
    background: T.bg, border: `1px solid ${T.borderDim}`,
    cursor: 'pointer', textAlign: 'left',
    display: 'flex', flexDirection: 'column', gap: 6,
    transition: 'border-color 0.12s'
  }}
  onMouseEnter={e => e.currentTarget.style.borderColor = color + '55'}
  onMouseLeave={e => e.currentTarget.style.borderColor = T.borderDim}>
    <Icon size={16} color={color} />
    <div style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>{title}</div>
    <div style={{ color: T.textDim, fontSize: 11 }}>{subtitle}</div>
  </button>
);

const ConfigInput = ({ label, value, onChange, placeholder }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{
      fontSize: 10, color: T.textDim, fontWeight: 700,
      letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6
    }}>{label}</div>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
      width: '100%', padding: 10,
      background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8,
      color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box'
    }} />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// DEPLOY MODAL — site-level deploy, mocked flow with realistic stages
// ─────────────────────────────────────────────────────────────────────────────
const DEPLOY_STEPS = [
  { id: 'build',  label: 'Building bundle',         duration: 1200 },
  { id: 'git',    label: 'Pushing to GitHub',       duration: 900 },
  { id: 'vercel', label: 'Triggering Vercel build', duration: 1500 },
  { id: 'alias',  label: 'Aliasing to domain',      duration: 700 },
  { id: 'verify', label: 'Verifying SSL',           duration: 500 }
];

const DeployModal = ({ data, project, onClose, onDeployComplete, isMobile }) => {
  const [stage, setStage] = useState('idle'); // idle | running | done | failed
  const [step, setStep] = useState(-1);
  const [logs, setLogs] = useState([]);
  const target = project
    ? `${project.id}.${data.deployConfig.rootDomain}`
    : data.deployConfig.rootDomain;
  const repo = project?.githubUrl || `https://github.com/${data.deployConfig.githubOrg}/${project?.id || 'portfolio'}`;

  const log = (m) => setLogs(l => [...l, { t: new Date().toLocaleTimeString(), m }]);

  const start = async () => {
    setStage('running'); setStep(0); setLogs([]);
    log(`Deploy started → ${target}`);
    for (let i = 0; i < DEPLOY_STEPS.length; i++) {
      setStep(i);
      log(`▸ ${DEPLOY_STEPS[i].label}…`);
      await new Promise(r => setTimeout(r, DEPLOY_STEPS[i].duration));
      log(`✓ ${DEPLOY_STEPS[i].label}`);
    }
    log(`Live at https://${target}`);
    setStage('done');
    onDeployComplete && onDeployComplete(project?.id, target);
  };

  const panelStyle = isMobile ? {
    width: '100%', maxHeight: '92vh', background: T.surface,
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
    display: 'flex', flexDirection: 'column'
  } : {
    width: '100%', maxWidth: 540, background: T.surface,
    border: `1px solid ${T.border}`, borderRadius: 14,
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
  };
  const containerStyle = isMobile ? {
    position: 'fixed', inset: 0, zIndex: 110,
    display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.7)'
  } : {
    position: 'fixed', inset: 0, zIndex: 110,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.7)', padding: 24
  };

  return (
    <div onClick={stage !== 'running' ? onClose : undefined} style={containerStyle}>
      <div onClick={e => e.stopPropagation()} style={panelStyle}>
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border }} />
          </div>
        )}
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${T.borderDim}`,
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <Rocket size={18} color={T.health} />
          <div style={{ flex: 1, color: T.text, fontSize: 17, fontWeight: 700 }}>
            Deploy {project ? project.name : 'site'}
          </div>
          {stage !== 'running' && <IconBtn onClick={onClose}><X size={18} /></IconBtn>}
        </div>

        <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
          <div style={{
            padding: 14, marginBottom: 18,
            background: T.bg, border: `1px solid ${T.borderDim}`, borderRadius: 10
          }}>
            <Row label="Target"  value={`https://${target}`} icon={Globe}  color={T.health} />
            <Row label="Source"  value={repo}                icon={Github} color={T.textMid} />
            <Row label="Branch"  value={data.deployConfig.defaultBranch} icon={null} color={T.textMid} />
          </div>

          {stage === 'idle' && (
            <div style={{ color: T.textMid, fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>
              This will build the bundle, push to GitHub, trigger a Vercel build, alias to the subdomain, and verify SSL. The flow is simulated in this prototype.
            </div>
          )}

          {stage !== 'idle' && (
            <div style={{
              padding: 14, marginBottom: 16,
              background: T.bg, border: `1px solid ${T.borderDim}`, borderRadius: 10
            }}>
              {DEPLOY_STEPS.map((s, i) => {
                const done = step > i || stage === 'done';
                const active = step === i && stage === 'running';
                return (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '6px 0', color: done ? T.health : active ? T.text : T.textFaint,
                    fontSize: 12, fontWeight: 500
                  }}>
                    {done ? <Check size={14} />
                      : active ? <Loader size={14} className="spin" />
                      : <Circle size={12} />}
                    {s.label}
                  </div>
                );
              })}
            </div>
          )}

          {logs.length > 0 && (
            <div style={{
              padding: 12, background: T.bg, borderRadius: 10,
              border: `1px solid ${T.borderDim}`,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 11, lineHeight: 1.6, color: T.textMid,
              maxHeight: 160, overflowY: 'auto', marginBottom: 16
            }}>
              {logs.map((l, i) => (
                <div key={i}><span style={{ color: T.textFaint }}>{l.t}</span> {l.m}</div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            {stage === 'idle' && (
              <button onClick={start} style={{
                ...btnPrimary, background: T.health, color: T.bg
              }}>
                <Rocket size={14} /> Deploy now
              </button>
            )}
            {stage === 'done' && (
              <>
                <a href={`https://${target}`} target="_blank" rel="noreferrer" style={{
                  ...btnPrimary, textDecoration: 'none'
                }}>
                  <ExternalLink size={13} /> Open site
                </a>
                <button onClick={onClose} style={btnSecondary}>Close</button>
              </>
            )}
            {stage === 'running' && (
              <div style={{ color: T.textDim, fontSize: 12, padding: '10px 0' }}>
                Deploying… don't close this window.
              </div>
            )}
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
      </div>
    </div>
  );
};

const Row = ({ label, value, icon: Icon, color }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '5px 0', fontSize: 12
  }}>
    <div style={{
      color: T.textDim, fontWeight: 600, fontSize: 10,
      letterSpacing: 0.6, textTransform: 'uppercase', width: 56
    }}>{label}</div>
    {Icon && <Icon size={12} color={color} />}
    <div style={{
      color, fontWeight: 500, flex: 1,
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
    }}>{value}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function ProjectEdit() {
  const [data, setData] = useState(loadData);
  const [view, setView] = useState('horizon'); // 'horizon' | 'feed' | 'dailies' | 'vision' | 'domain'
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState({ activeOnly: false, kick: false, search: '' });
  const [expanded, setExpanded] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deployTarget, setDeployTarget] = useState(undefined); // undefined = closed, null = site, project = project deploy

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1200);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }, [data]);

  // ⌘K focuses search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const inp = document.querySelector('input[placeholder^="Search projects"]');
        if (inp) inp.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleExpanded = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const openDomain = (id) => {
    setSelectedDomain(id);
    setView('domain');
    if (isMobile) setSidebarOpen(false);
  };

  const handleTabSwitch = (newView) => {
    setView(newView);
    if (newView !== 'domain') setSelectedDomain(null);
  };

  const handleBack = () => {
    setView('horizon');
    setSelectedDomain(null);
  };

  const handleSave = (updated) => {
    setData(d => ({ ...d, projects: d.projects.map(p => p.id === updated.id ? updated : p) }));
    setSelected(null);
  };
  const handleDelete = (id) => {
    setData(d => ({ ...d, projects: d.projects.filter(p => p.id !== id) }));
    setSelected(null);
  };
  const handleAdd = (newP) => {
    setData(d => ({ ...d, projects: [...d.projects, newP] }));
    setAdding(false);
    setSelected(newP);
  };

  // JSON import — merge keeps existing, adds new by id. Replace swaps entire dataset.
  const handleImport = (incoming, mode) => {
    setData(curr => {
      if (mode === 'replace') {
        return {
          ...curr,
          ...incoming,
          projects: (incoming.projects || []).map(migrateProject)
        };
      }
      // merge mode: add projects whose id is not already present
      const existingIds = new Set(curr.projects.map(p => p.id));
      const additions = (incoming.projects || [])
        .filter(p => !existingIds.has(p.id))
        .map(migrateProject);
      const merged = { ...curr, projects: [...curr.projects, ...additions] };
      // merge other arrays similarly if provided
      ['milestones','tracks','keystoneSkills','builds','flywheels'].forEach(key => {
        if (Array.isArray(incoming[key])) {
          const ids = new Set((curr[key] || []).map(x => x.id));
          merged[key] = [...(curr[key] || []), ...incoming[key].filter(x => !ids.has(x.id))];
        }
      });
      return merged;
    });
  };
  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    LEGACY_KEYS.forEach(k => localStorage.removeItem(k));
    setData({
      domains: DEFAULT_DOMAINS,
      tracks: DEFAULT_TRACKS,
      projects: DEFAULT_PROJECTS.map(migrateProject),
      milestones: DEFAULT_MILESTONES,
      keystoneSkills: DEFAULT_KEYSTONE_SKILLS,
      builds: DEFAULT_BUILDS,
      flywheels: DEFAULT_FLYWHEELS,
      workBlocks: DEFAULT_WORK_BLOCKS,
      deployConfig: DEFAULT_DEPLOY_CONFIG,
      vision: { global: 'Build an empire of compounding tools by 2030. Financial freedom + global mobility.' }
    });
  };
  const handleSaveConfig = (config) => {
    setData(d => ({ ...d, deployConfig: config }));
  };

  // Deploy handler: from project sheet → save updates first, then open deploy modal
  const handleRequestDeploy = (draft) => {
    handleSave({ ...draft, deployStatus: 'pending' });
    setDeployTarget(draft);
  };
  const handleDeployComplete = (projectId, target) => {
    if (!projectId) return;
    setData(d => ({
      ...d,
      projects: d.projects.map(p => p.id === projectId
        ? { ...p, deployStatus: 'live', liveUrl: p.liveUrl || `https://${target}` }
        : p)
    }));
  };

  const showSidebar = !isMobile || sidebarOpen;
  const showRail = (!isMobile && !isTablet) || railOpen;
  const currentDomain = data.domains.find(d => d.id === selectedDomain);

  return (
    <div style={{
      width: '100%', height: '100vh', maxHeight: '100dvh',
      background: T.bg, color: T.text,
      fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
      fontSize: 14, lineHeight: 1.4,
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative'
    }}>
      <TopNav view={view} setView={handleTabSwitch}
        isMobile={isMobile}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        onToggleRail={() => setRailOpen(o => !o)}
        searchValue={filter.search}
        onSearchChange={(v) => setFilter(f => ({ ...f, search: v }))}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenDeploy={() => setDeployTarget(null)}
      />

      {view === 'domain' && currentDomain && (
        <Breadcrumb
          onBack={handleBack}
          items={[
            { label: 'Timeline', onClick: handleBack },
            { label: currentDomain.name }
          ]}
        />
      )}

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {showSidebar && view !== 'feed' && (
          <>
            {isMobile && (
              <div onClick={() => setSidebarOpen(false)} style={{
                position: 'fixed', inset: 0, top: 60,
                background: 'rgba(0,0,0,0.5)', zIndex: 20
              }} />
            )}
            <div style={isMobile ? {
              position: 'fixed', top: 60, left: 0, bottom: 0, zIndex: 25,
              boxShadow: '4px 0 24px rgba(0,0,0,0.5)'
            } : {}}>
              <PillarSidebar
                data={data}
                expanded={expanded}
                toggleExpanded={toggleExpanded}
                onQuickAdd={() => setAdding(true)}
                selectedDomain={selectedDomain}
                onSelectDomain={(id) => setSelectedDomain(id === selectedDomain ? null : id)}
                onOpenDomain={openDomain}
              />
            </div>
          </>
        )}

        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', minWidth: 0
        }}>
          {view === 'horizon' && (
            <TimelineCanvas
              data={data}
              onClipTap={setSelected}
              filter={{ ...filter, setFilter }}
              isMobile={isMobile}
              onOpenDomain={openDomain}
            />
          )}
          {view === 'feed' && (
            <FeedView
              data={data}
              onClipTap={setSelected}
              search={filter.search}
            />
          )}
          {view === 'domain' && selectedDomain && (
            <DomainDetailView
              data={data}
              domainId={selectedDomain}
              onClipTap={setSelected}
              isMobile={isMobile}
            />
          )}
          {view === 'dailies' && <DailiesView data={data} onClipTap={setSelected} />}
          {view === 'vision' && <VisionView data={data} onClipTap={setSelected} />}
        </div>

        {showRail && view !== 'feed' && (
          <>
            {(isMobile || isTablet) && railOpen && (
              <div onClick={() => setRailOpen(false)} style={{
                position: 'fixed', inset: 0, top: 60,
                background: 'rgba(0,0,0,0.5)', zIndex: 20
              }} />
            )}
            <div style={(isMobile || isTablet) ? {
              position: 'fixed', top: 60, right: 0, bottom: 0, zIndex: 25,
              boxShadow: '-4px 0 24px rgba(0,0,0,0.5)'
            } : {}}>
              <RightRail data={data} view={view} selectedDomain={selectedDomain} />
            </div>
          </>
        )}
      </div>

      <button onClick={() => setAdding(true)} style={{
        position: 'absolute', bottom: 80, right: 24, zIndex: 30,
        width: 52, height: 52, borderRadius: 26,
        background: T.text, color: T.bg, border: 'none', cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}><Plus size={22} strokeWidth={2.5} /></button>

      {selected && (
        <ProjectSheet project={selected} data={data}
          onClose={() => setSelected(null)} onSave={handleSave} onDelete={handleDelete}
          onRequestDeploy={handleRequestDeploy}
          isMobile={isMobile} />
      )}
      {adding && (
        <AddProjectSheet data={data} onClose={() => setAdding(false)} onAdd={handleAdd}
          isMobile={isMobile} defaultDomainId={selectedDomain} />
      )}
      {settingsOpen && (
        <SettingsModal
          data={data}
          onClose={() => setSettingsOpen(false)}
          onImport={handleImport}
          onReset={handleReset}
          onSaveConfig={handleSaveConfig}
          isMobile={isMobile}
        />
      )}
      {deployTarget !== undefined && (
        <DeployModal
          data={data}
          project={deployTarget}
          onClose={() => setDeployTarget(undefined)}
          onDeployComplete={handleDeployComplete}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
