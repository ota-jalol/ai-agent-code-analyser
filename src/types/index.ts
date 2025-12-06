// Core types and interfaces for the multi-agent system

export interface FileMetadata {
  id: string;
  path: string;
  language: 'javascript' | 'typescript' | 'dart';
  size: number;
  lastModified: Date;
  dependencies: string[];
}

export interface ASTNode {
  type: string;
  name?: string;
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  children?: ASTNode[];
}

export interface ProjectStructure {
  rootPath: string;
  files: FileMetadata[];
  dependencyGraph: Map<string, string[]>;
  astMap: Map<string, ASTNode>;
}

export interface AnalysisIssue {
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  rule: string;
  suggestion?: string;
}

export interface AnalysisReport {
  timestamp: Date;
  totalFiles: number;
  totalIssues: number;
  issues: AnalysisIssue[];
  metrics: {
    complexity: number;
    maintainability: number;
    linesOfCode: number;
  };
}

export interface Vulnerability {
  id: string;
  file: string;
  line: number;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  cwe?: string;
  owasp?: string;
  recommendation: string;
}

export interface VulnerabilityReport {
  timestamp: Date;
  totalVulnerabilities: number;
  vulnerabilities: Vulnerability[];
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface TestCase {
  name: string;
  code: string;
  framework: 'vitest' | 'jest' | 'flutter_test';
  targetFile: string;
  targetFunction?: string;
}

export interface TestSuite {
  file: string;
  framework: string;
  tests: TestCase[];
  coverageGoal: number;
}

export interface TestResult {
  suite: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  failures: {
    test: string;
    error: string;
    stackTrace: string;
  }[];
}

export interface TestExecutionReport {
  timestamp: Date;
  totalTests: number;
  passed: number;
  failed: number;
  coverage: number;
  results: TestResult[];
}

export interface CodePatch {
  file: string;
  diff: string;
  description: string;
  validated: boolean;
}

export interface PatchReport {
  timestamp: Date;
  totalPatches: number;
  patches: CodePatch[];
}

export interface WorkflowStatus {
  stage: 'ingest' | 'analyze' | 'scan' | 'test' | 'execute' | 'patch' | 'complete';
  progress: number;
  message: string;
  errors: string[];
}

export interface FinalReport {
  timestamp: Date;
  projectPath: string;
  projectStructure: ProjectStructure;
  analysisReport: AnalysisReport;
  vulnerabilityReport: VulnerabilityReport;
  testReport?: TestExecutionReport;
  patchReport?: PatchReport;
  workflowStatus: WorkflowStatus;
}

export interface AgentConfig {
  name: string;
  enabled: boolean;
  options?: Record<string, unknown>;
}

export interface SystemConfig {
  projectPath: string;
  outputPath: string;
  targetLanguages: ('javascript' | 'typescript' | 'dart')[];
  agents: {
    ingestor: AgentConfig;
    analyzer: AgentConfig;
    vulnerability: AgentConfig;
    testWriter: AgentConfig;
    executor: AgentConfig;
    patcher: AgentConfig;
  };
  generateTests: boolean;
  runTests: boolean;
  applyFixes: boolean;
  reportFormat: 'json' | 'html' | 'markdown';
}
