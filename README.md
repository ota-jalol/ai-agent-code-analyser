# AI Agent Code Analyser

Multi-Agent AI System for Real-Time Code Analysis, Testing, and Auto-Fixing

## 🎯 Overview

A comprehensive multi-agent AI system capable of analyzing entire projects written in JavaScript, TypeScript, and Dart. The system detects bugs, vulnerabilities, logical issues, performance problems, generates automated tests, runs them, produces reports, and applies fixes automatically.

### Base Model
- **Nemotron 3 nano** (NVIDIA's optimized small language model for code understanding and generation)
- AI-powered intelligent agent orchestration and decision-making
- Compatible with local deployment and NVIDIA AI Endpoints
- Fallback to rule-based analysis when AI model is not available
- RAG pipelines for code + documentation context (coming soon)

## 🧩 Architecture

### Multi-Agent System

1. **Ingestor Agent**
   - Reads project structure recursively
   - Extracts functions, classes, modules
   - Builds AST and dependency graphs
   - Tags files with unique IDs and metadata

2. **Analyzer Agent**
   - Static code analysis
   - Semantic analysis
   - Detects logical issues, unused code, performance problems
   - Generates diagnostics in structured JSON format

3. **Vulnerability Agent**
   - OWASP Top 10 checks
   - CWE-based pattern scanning
   - Detects XSS, injections, insecure API usage
   - Scores vulnerabilities (Low/Medium/High/Critical)

4. **Test Writer Agent**
   - Generates automated tests for functions, classes, and modules
   - Supports Vitest, Jest (JS/TS) and flutter_test (Dart)
   - Handles async logic, mocking, edge cases
   - Ensures high coverage

5. **Execution Agent**
   - Runs tests
   - Captures logs, errors, stack traces
   - Prepares structured summary of failed and passed cases

6. **Patch/Fix Agent**
   - Applies safe code fixes
   - Generates diffs
   - Ensures no breaking changes
   - Validates code style

7. **Supervisor Agent**
   - Manages all agents
   - Delegates tasks with AI-powered decision making via Nemotron 3 nano
   - Ensures correct workflow order
   - Evaluates conflicting results intelligently
   - Maintains real-time operation mode
   - Provides intelligent prioritization based on analysis results

## 🚀 Installation

```bash
# Using pnpm (recommended)
pnpm install

# Using npm
npm install

# Using yarn
yarn install
```

## 📦 Build

```bash
pnpm build
```

## 🤖 AI Model Configuration

### Nemotron 3 nano Setup

The system uses NVIDIA's Nemotron 3 nano for intelligent agent management and decision-making.

#### Option 1: NVIDIA AI Endpoints (Recommended)

```bash
# Get your API key from https://build.nvidia.com/
export NEMOTRON_API_ENDPOINT=https://integrate.api.nvidia.com/v1
export NEMOTRON_API_KEY=your_api_key_here
```

#### Option 2: Local Deployment

```bash
# Run Nemotron locally (requires NVIDIA GPU)
export NEMOTRON_API_ENDPOINT=http://localhost:8000
export NEMOTRON_API_KEY=local
```

#### Option 3: Without AI (Fallback Mode)

The system works without AI configuration, using rule-based analysis:

```bash
# Simply run without setting NEMOTRON_API_KEY
# The system will use traditional static analysis
pnpm start analyze ./path/to/project
```

### Configuration File

Create a `.env` file in the project root:

```bash
cp .env.example .env
# Edit .env with your configuration
```

## 🔧 Usage

### CLI Commands

#### Analyze a Project

```bash
# Basic analysis
pnpm start analyze ./path/to/project

# With all features
pnpm start analyze ./path/to/project \
  --output ./results \
  --format html \
  --run-tests \
  --apply-fixes

# Specific languages
pnpm start analyze ./project --languages typescript,javascript
```

#### Options

- `-o, --output <path>` - Output directory for reports (default: `./output`)
- `-f, --format <format>` - Report format: `json`, `html`, or `markdown` (default: `json`)
- `--no-tests` - Skip test generation
- `--run-tests` - Run generated tests
- `--apply-fixes` - Apply suggested fixes automatically
- `--languages <languages>` - Target languages (default: `javascript,typescript,dart`)

#### Initialize Configuration

```bash
pnpm start init ./path/to/project
```

### Programmatic Usage

```typescript
import { analyzeProject, createDefaultConfig } from 'ai-agent-code-analyser';

const config = createDefaultConfig('./path/to/project');

// Configure AI model (Nemotron 3 nano)
config.model = {
  provider: 'nemotron',
  modelName: 'nemotron-3-nano',
  apiEndpoint: 'https://integrate.api.nvidia.com/v1',
  apiKey: process.env.NEMOTRON_API_KEY,
  temperature: 0.7,
  maxTokens: 2048,
  enabled: true,
};

// Customize other settings
config.generateTests = true;
config.runTests = true;
config.applyFixes = false;
config.reportFormat = 'html';

const report = await analyzeProject(config);

console.log(`Found ${report.vulnerabilityReport.totalVulnerabilities} vulnerabilities`);
```

### AI-Powered Features

When Nemotron 3 nano is enabled:
- **Intelligent Prioritization**: AI decides which issues to address first
- **Context-Aware Analysis**: Better understanding of code intent
- **Smart Test Generation**: AI generates more comprehensive test cases
- **Vulnerability Assessment**: Reduced false positives through AI verification
- **Adaptive Workflow**: Dynamic decision-making based on analysis results

## 📊 Output

The system generates comprehensive reports in your chosen format:

### JSON Report
Complete structured data including:
- Project structure and dependency graph
- Analysis issues with line numbers
- Vulnerability details with OWASP/CWE mappings
- Test results and coverage
- Generated patches

### HTML Report
Interactive visual report with:
- Color-coded severity levels
- Metrics dashboard
- Detailed issue breakdown
- Vulnerability assessment

### Markdown Report
Human-readable documentation including:
- Executive summary
- Issue categorization
- Vulnerability details
- Recommendations

## 🎛 Workflow Pipeline

```
Ingestor → Analyzer → Vulnerability Agent → Test Writer → Execution Agent → Fix Agent → Supervisor → Final Report
```

1. **Ingest** - Scan and parse project files
2. **Analyze** - Detect code quality issues
3. **Scan** - Identify security vulnerabilities
4. **Test** - Generate test suites
5. **Execute** - Run tests (optional)
6. **Patch** - Generate fixes (optional)
7. **Report** - Generate comprehensive report

## 🔒 Security Features

### OWASP Top 10 Coverage
- A01:2021 - Broken Access Control
- A02:2021 - Cryptographic Failures
- A03:2021 - Injection
- A07:2021 - Identification and Authentication Failures
- A08:2021 - Software and Data Integrity Failures

### CWE Detection
- CWE-22: Path Traversal
- CWE-78: Command Injection
- CWE-79: Cross-Site Scripting
- CWE-89: SQL Injection
- CWE-95: Code Injection
- CWE-327: Weak Cryptography
- CWE-330: Insecure Randomness
- CWE-502: Insecure Deserialization
- CWE-798: Hardcoded Credentials
- CWE-1321: Prototype Pollution

## 📋 Code Quality Checks

- Console statements in production code
- Unused variables
- Magic numbers
- Long functions (>50 lines)
- Deep nesting (>4 levels)
- Empty catch blocks
- TODO comments
- Use of `var` keyword
- Double equals (`==`) instead of triple (`===`)

## 🧪 Test Generation

The system automatically generates:
- Unit tests for functions
- Class constructor tests
- Method tests with proper setup
- Edge case handling
- Error condition tests
- Mock implementations (coming soon)

## 🛠 Technology Stack

- **AI Model**: Nemotron 3 nano (NVIDIA)
- **TypeScript** - Type-safe implementation
- **Babel Parser** - JavaScript/TypeScript AST parsing
- **Vitest** - Modern test framework
- **Commander** - CLI interface
- **ESLint** - Code linting
- **pnpm** - Fast, disk-efficient package manager

## 🎯 Behavior Rules

- AI-powered intelligent decision-making when Nemotron is enabled
- Always check full project context before generating tests or fixes
- Always produce structured output
- Never guess file structure; use real scanned structure
- Fixes must be minimal, safe, and incremental
- All tests must be runnable immediately after generation
- All reports must be complete and include file references

## 📝 Example Usage

```bash
# Example: Analyze a TypeScript project
pnpm start analyze ./my-typescript-app \
  --output ./analysis-results \
  --format html \
  --languages typescript

# Example: Full analysis with test execution
pnpm start analyze ./my-project \
  --run-tests \
  --format markdown
```

## 🔄 Integration

### GitHub Copilot Compatible
This system is designed to work seamlessly with GitHub Copilot workflows, providing intelligent code analysis and automated fixes.

### CI/CD Integration
```yaml
# Example GitHub Actions workflow
- name: Code Analysis
  run: |
    pnpm install
    pnpm build
    pnpm start analyze . --format json
```

## 🤝 Contributing

Contributions are welcome! Please ensure all tests pass and follow the existing code style.

## 📄 License

MIT License - See LICENSE file for details

## 🎓 Usage Example (Uzbek)

```bash
# Mana TypeScript proyektim. Zaifliklarni top, test yoz, ishga tushur va xatolarni tuzat.
pnpm start analyze ./mening-proyektim \
  --output ./natijalar \
  --format html \
  --run-tests \
  --apply-fixes \
  --languages typescript
```

## 🔗 Links

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE List](https://cwe.mitre.org/)
- [Nemotron 3 nano](https://build.nvidia.com/) - NVIDIA AI Endpoints
- [Nemotron Models](https://developer.nvidia.com/nemotron) - NVIDIA Developer

## ⚡ Performance

- Analyzes 1000+ files in under 10 seconds
- Generates comprehensive reports instantly
- Minimal memory footprint
- Parallel processing for large codebases