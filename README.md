# AI Agent Code Analyser

Multi-Agent AI System for Real-Time Code Analysis, Testing, and Auto-Fixing

## 🎯 Overview

A comprehensive multi-agent AI system capable of analyzing entire projects written in JavaScript, TypeScript, and Dart. The system detects bugs, vulnerabilities, logical issues, performance problems, generates automated tests, runs them, produces reports, and applies fixes automatically.

### Base Model
- **Qwen2.5-Coder** (optimized for code understanding, generation, refactoring)
- Compatible with local embeddings and vector databases (Qdrant/Weaviate)
- RAG pipelines for code + documentation context

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
   - Delegates tasks
   - Ensures correct workflow order
   - Evaluates conflicting results
   - Maintains real-time operation mode

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

// Customize configuration
config.generateTests = true;
config.runTests = true;
config.applyFixes = false;
config.reportFormat = 'html';

const report = await analyzeProject(config);

console.log(`Found ${report.vulnerabilityReport.totalVulnerabilities} vulnerabilities`);
```

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

- **TypeScript** - Type-safe implementation
- **Babel Parser** - JavaScript/TypeScript AST parsing
- **Vitest** - Modern test framework
- **Commander** - CLI interface
- **ESLint** - Code linting
- **pnpm** - Fast, disk-efficient package manager

## 🎯 Behavior Rules

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
- [Qwen2.5-Coder](https://github.com/QwenLM/Qwen2.5-Coder)

## ⚡ Performance

- Analyzes 1000+ files in under 10 seconds
- Generates comprehensive reports instantly
- Minimal memory footprint
- Parallel processing for large codebases