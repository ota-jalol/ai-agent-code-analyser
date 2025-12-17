import type { SystemConfig } from './types/index.js';
import { SupervisorAgent } from './agents/SupervisorAgent.js';

export * from './types/index.js';
export * from './agents/IngestorAgent.js';
export * from './agents/AnalyzerAgent.js';
export * from './agents/VulnerabilityAgent.js';
export * from './agents/TestWriterAgent.js';
export * from './agents/ExecutionAgent.js';
export * from './agents/PatchAgent.js';
export * from './agents/SupervisorAgent.js';

/**
 * Main entry point for the multi-agent AI system
 */
export async function analyzeProject(config: SystemConfig) {
  const supervisor = new SupervisorAgent(config);
  return await supervisor.execute();
}

export function createDefaultConfig(projectPath: string): SystemConfig {
  return {
    projectPath,
    outputPath: './output',
    targetLanguages: ['javascript', 'typescript', 'dart'],
    model: {
      provider: 'nemotron',
      modelName: 'nemotron-3-nano',
      apiEndpoint: process.env.NEMOTRON_API_ENDPOINT || 'http://localhost:8000',
      apiKey: process.env.NEMOTRON_API_KEY,
      temperature: 0.7,
      maxTokens: 2048,
      enabled: !!process.env.NEMOTRON_API_KEY,
    },
    agents: {
      ingestor: { name: 'Ingestor', enabled: true },
      analyzer: { name: 'Analyzer', enabled: true },
      vulnerability: { name: 'Vulnerability Scanner', enabled: true },
      testWriter: { name: 'Test Writer', enabled: true },
      executor: { name: 'Test Executor', enabled: false },
      patcher: { name: 'Patch Generator', enabled: false },
    },
    generateTests: true,
    runTests: false,
    applyFixes: false,
    reportFormat: 'json',
  };
}
