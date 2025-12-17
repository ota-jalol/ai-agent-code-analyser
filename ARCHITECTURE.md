# AI Agent Code Analyser - System Architecture

## Overview

This document describes the architecture and implementation details of the multi-agent AI system for code analysis, testing, and auto-fixing.

## Agent Architecture

### 1. Ingestor Agent (`IngestorAgent.ts`)

**Responsibility**: Project structure ingestion and AST generation

**Key Features**:
- Recursively scans project directories
- Identifies JavaScript, TypeScript, and Dart files
- Generates Abstract Syntax Trees (AST) using Babel parser
- Extracts dependencies and imports
- Creates project metadata with unique IDs

**Output**: `ProjectStructure` object containing:
- File metadata (path, language, size, dependencies)
- Dependency graph (Map<file, dependencies[]>)
- AST map (Map<file, AST>)

### 2. Analyzer Agent (`AnalyzerAgent.ts`)

**Responsibility**: Static code analysis and quality metrics

**Checks**:
- Console statements in production
- Unused variables
- Magic numbers
- Long functions (>50 lines)
- Deep nesting (>4 levels)
- Empty catch blocks
- TODO comments
- Use of `var` keyword
- Double equals (`==`)

**Metrics**:
- Cyclomatic complexity
- Lines of code
- Maintainability index

**Output**: `AnalysisReport` with issues, severity, and suggestions

### 3. Vulnerability Agent (`VulnerabilityAgent.ts`)

**Responsibility**: Security vulnerability scanning

**OWASP Top 10 Checks**:
- A01: Broken Access Control (Path Traversal)
- A02: Cryptographic Failures (Weak crypto, insecure HTTP)
- A03: Injection (SQL, XSS, Command injection)
- A07: Authentication Failures (Hardcoded credentials)
- A08: Data Integrity (Insecure deserialization, prototype pollution)

**CWE Patterns**:
- CWE-22: Path Traversal
- CWE-78: Command Injection
- CWE-79: Cross-Site Scripting (XSS)
- CWE-89: SQL Injection
- CWE-95: Code Injection (eval)
- CWE-327: Weak Cryptography
- CWE-330: Insecure Randomness
- CWE-502: Insecure Deserialization
- CWE-798: Hardcoded Credentials
- CWE-1321: Prototype Pollution

**Output**: `VulnerabilityReport` with severity-scored vulnerabilities

### 4. Test Writer Agent (`TestWriterAgent.ts`)

**Responsibility**: Automated test generation

**Features**:
- Generates Vitest tests for JS/TS
- Generates flutter_test tests for Dart
- Creates tests for functions and classes
- Includes edge case handling
- Supports async operations
- 80% coverage goal

**Test Types**:
- Unit tests for functions
- Constructor tests
- Method tests with setup
- Edge case tests
- Error handling tests

**Output**: `TestSuite[]` with generated test code

### 5. Execution Agent (`ExecutionAgent.ts`)

**Responsibility**: Test execution and result collection

**Features**:
- Runs Vitest/Jest tests
- Runs Dart tests
- Captures logs and errors
- Collects stack traces
- Calculates coverage

**Output**: `TestExecutionReport` with pass/fail statistics

### 6. Patch Agent (`PatchAgent.ts`)

**Responsibility**: Automated code fixing

**Fix Types**:
- Code quality fixes (no-console, no-var, eqeqeq)
- Security fixes (XSS, weak crypto, insecure HTTP)
- Generates unified diffs
- Validates changes

**Features**:
- Safe, incremental fixes
- Diff generation
- Validation flags
- Patch file output

**Output**: `PatchReport` with generated patches

### 7. Supervisor Agent (`SupervisorAgent.ts`)

**Responsibility**: Workflow orchestration and coordination, powered by Nemotron 3 nano AI

**Features**:
- Manages all agents with AI-powered decision making
- Controls execution flow dynamically based on analysis results
- Progress tracking with intelligent prioritization
- Error handling and recovery
- Report generation (JSON/HTML/Markdown)
- Nemotron 3 nano integration for adaptive workflow management

**AI-Powered Capabilities**:
- Intelligent prioritization of issues and vulnerabilities
- Context-aware decision making at each workflow stage
- Adaptive workflow based on analysis results
- Smart recommendations for next actions
- Reduced false positives through AI verification

**Workflow**:
1. Initialize agents and Nemotron client (if configured)
2. Ingest project (10% progress)
3. Analyze code (25% progress)
4. **AI Decision Point**: Assess analysis results
5. Scan vulnerabilities (40% progress)
6. **AI Decision Point**: Prioritize security issues
7. Generate tests (55% progress)
8. Execute tests (70% progress)
9. Generate patches (85% progress)
10. Generate final report (100% progress)

**Output**: `FinalReport` with all analysis results and AI insights

## Data Flow

```
User Input (Project Path, Config)
    ↓
Supervisor Agent (with Nemotron AI)
    ↓
[Ingestor Agent] → ProjectStructure
    ↓
[Analyzer Agent] → AnalysisReport
    ↓
[Nemotron AI Decision] → Assessment & Prioritization
    ↓
[Vulnerability Agent] → VulnerabilityReport
    ↓
[Nemotron AI Decision] → Security Priority Assessment
    ↓
[Test Writer Agent] → TestSuite[] (AI-enhanced)
    ↓
[Execution Agent] → TestExecutionReport
    ↓
[Patch Agent] → PatchReport
    ↓
Supervisor Agent → FinalReport (with AI insights)
    ↓
Report Files (JSON/HTML/Markdown)
```

## AI Model Integration

### Nemotron 3 nano

The system integrates NVIDIA's Nemotron 3 nano model for intelligent decision-making:

**Key Features**:
- Small, efficient model optimized for code understanding
- Low latency inference for real-time analysis
- Context-aware code analysis
- Intelligent vulnerability assessment
- Adaptive workflow management

**Usage**:
- Optional: System works with or without AI model
- Fallback: Rule-based analysis when AI is unavailable
- API: Compatible with NVIDIA AI Endpoints or local deployment
- Security: API keys stored in environment variables

## Configuration

### SystemConfig Interface

```typescript
{
  projectPath: string;           // Project to analyze
  outputPath: string;            // Output directory
  targetLanguages: string[];     // Languages to analyze
  model?: {                      // AI Model configuration (optional)
    provider: 'nemotron' | 'openai' | 'local';
    modelName: string;           // e.g., 'nemotron-3-nano'
    apiEndpoint?: string;        // API endpoint URL
    apiKey?: string;             // API authentication key
    temperature?: number;        // Model temperature (0-1)
    maxTokens?: number;          // Max tokens per request
    enabled: boolean;            // Enable/disable AI features
  };
  agents: {                      // Agent enable/disable
    ingestor: AgentConfig;
    analyzer: AgentConfig;
    vulnerability: AgentConfig;
    testWriter: AgentConfig;
    executor: AgentConfig;
    patcher: AgentConfig;
  };
  generateTests: boolean;        // Generate tests
  runTests: boolean;             // Execute tests
  applyFixes: boolean;           // Apply patches
  reportFormat: string;          // json|html|markdown
}
```

## Report Formats

### JSON Report
Complete structured data for programmatic access and CI/CD integration.

### HTML Report
Interactive visual report with:
- Metrics dashboard
- Color-coded severity
- Tables and charts
- Responsive design

### Markdown Report
Human-readable documentation with:
- Executive summary
- Categorized issues
- Vulnerability details
- Recommendations

## Performance Considerations

- Parallel file processing
- Efficient AST caching
- Streaming for large files
- Incremental analysis
- Memory-efficient data structures

## Extensibility

### Adding New Agents
1. Create agent class implementing common interface
2. Add to Supervisor workflow
3. Update configuration types
4. Add to CLI options

### Adding New Checks
1. Add check method to respective agent
2. Define new vulnerability/issue types
3. Update report formats
4. Add to documentation

### Adding New Languages
1. Add language detection
2. Implement AST parser
3. Add language-specific checks
4. Update test generation

## Security Best Practices

- All patches marked for manual review
- No automatic execution of generated code
- Sandboxed test execution
- Validation of all fixes
- Clear severity scoring

## Future Enhancements

1. Machine learning-based issue detection
2. Integration with vector databases (Qdrant/Weaviate)
3. RAG-based code understanding
4. Real-time monitoring
5. IDE integration
6. Custom rule definitions
7. Advanced refactoring suggestions
8. Performance profiling
9. Dependency vulnerability scanning
10. License compliance checking
