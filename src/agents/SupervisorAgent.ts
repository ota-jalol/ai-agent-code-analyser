import type { SystemConfig, FinalReport, WorkflowStatus } from '../types/index.js';
import { Logger, writeFile, ensureDir } from '../utils/helpers.js';
import { IngestorAgent } from './IngestorAgent.js';
import { AnalyzerAgent } from './AnalyzerAgent.js';
import { VulnerabilityAgent } from './VulnerabilityAgent.js';
import { TestWriterAgent } from './TestWriterAgent.js';
import { ExecutionAgent } from './ExecutionAgent.js';
import { PatchAgent } from './PatchAgent.js';
import * as path from 'path';

/**
 * Supervisor Agent
 * Responsible for managing all agents, delegating tasks,
 * ensuring correct workflow order, evaluating results
 */
export class SupervisorAgent {
  private logger: Logger;
  private config: SystemConfig;
  private workflowStatus: WorkflowStatus;

  constructor(config: SystemConfig) {
    this.logger = Logger.getInstance();
    this.config = config;
    this.workflowStatus = {
      stage: 'ingest',
      progress: 0,
      message: 'Initializing workflow',
      errors: [],
    };
  }

  async execute(): Promise<FinalReport> {
    this.logger.info('Starting multi-agent workflow...');
    this.logger.info(`Project: ${this.config.projectPath}`);
    this.logger.info(`Output: ${this.config.outputPath}`);

    // Ensure output directories exist
    await ensureDir(this.config.outputPath);
    await ensureDir(path.join(this.config.outputPath, 'reports'));
    await ensureDir(path.join(this.config.outputPath, 'patches'));

    // Initialize agents
    const ingestorAgent = new IngestorAgent();
    const analyzerAgent = new AnalyzerAgent();
    const vulnerabilityAgent = new VulnerabilityAgent();
    const testWriterAgent = new TestWriterAgent();
    const executionAgent = new ExecutionAgent();
    const patchAgent = new PatchAgent();

    let report: FinalReport;

    try {
      // Stage 1: Ingest project
      this.updateStatus('ingest', 10, 'Ingesting project structure...');
      const projectStructure = await ingestorAgent.ingest(this.config.projectPath);
      this.logger.success(`Ingested ${projectStructure.files.length} files`);

      // Stage 2: Analyze code
      this.updateStatus('analyze', 25, 'Analyzing code...');
      const analysisReport = await analyzerAgent.analyze(projectStructure, this.config.projectPath);
      this.logger.success(`Found ${analysisReport.totalIssues} issues`);

      // Stage 3: Scan for vulnerabilities
      this.updateStatus('scan', 40, 'Scanning for vulnerabilities...');
      const vulnerabilityReport = await vulnerabilityAgent.scan(projectStructure, this.config.projectPath);
      this.logger.success(`Found ${vulnerabilityReport.totalVulnerabilities} vulnerabilities`);

      // Stage 4: Generate tests (if enabled)
      let testSuites;
      let testReport;
      if (this.config.generateTests) {
        this.updateStatus('test', 55, 'Generating test suites...');
        testSuites = await testWriterAgent.generateTests(projectStructure, this.config.projectPath);
        this.logger.success(`Generated ${testSuites.length} test suites`);

        // Write test files
        for (const suite of testSuites) {
          const testFilePath = path.join(this.config.projectPath, suite.file);
          const testContent = suite.tests.map(test => test.code).join('\n\n');
          await writeFile(testFilePath, testContent);
        }

        // Stage 5: Execute tests (if enabled)
        if (this.config.runTests) {
          this.updateStatus('execute', 70, 'Executing tests...');
          testReport = await executionAgent.executeTests(testSuites, this.config.projectPath);
          this.logger.success(`Executed ${testReport.totalTests} tests`);
        }
      } else {
        this.workflowStatus.progress = 70;
      }

      // Stage 6: Generate patches (if enabled)
      let patchReport;
      if (this.config.applyFixes) {
        this.updateStatus('patch', 85, 'Generating patches...');
        patchReport = await patchAgent.generatePatches(
          analysisReport,
          vulnerabilityReport,
          testReport,
          this.config.projectPath,
          this.config.outputPath
        );
        this.logger.success(`Generated ${patchReport.totalPatches} patches`);
      } else {
        this.workflowStatus.progress = 85;
      }

      // Stage 7: Complete and generate report
      this.updateStatus('complete', 100, 'Workflow complete');

      report = {
        timestamp: new Date(),
        projectPath: this.config.projectPath,
        projectStructure,
        analysisReport,
        vulnerabilityReport,
        testReport,
        patchReport,
        workflowStatus: this.workflowStatus,
      };

      // Save report
      await this.saveReport(report);

      this.logger.success('Multi-agent workflow completed successfully');
    } catch (error) {
      this.logger.error('Workflow failed', error as Error);
      this.workflowStatus.errors.push(String(error));
      throw error;
    }

    return report!;
  }

  private updateStatus(stage: WorkflowStatus['stage'], progress: number, message: string): void {
    this.workflowStatus = {
      stage,
      progress,
      message,
      errors: this.workflowStatus.errors,
    };
    this.logger.info(`[${progress}%] ${message}`);
  }

  private async saveReport(report: FinalReport): Promise<void> {
    const reportPath = path.join(
      this.config.outputPath,
      'reports',
      `report-${Date.now()}.${this.config.reportFormat}`
    );

    let content: string;

    if (this.config.reportFormat === 'json') {
      content = this.generateJSONReport(report);
    } else if (this.config.reportFormat === 'markdown') {
      content = this.generateMarkdownReport(report);
    } else {
      content = this.generateHTMLReport(report);
    }

    await writeFile(reportPath, content);
    this.logger.success(`Report saved to ${reportPath}`);
  }

  private generateJSONReport(report: FinalReport): string {
    // Convert Map objects to regular objects for JSON serialization
    const serializable = {
      ...report,
      projectStructure: {
        ...report.projectStructure,
        dependencyGraph: Array.from(report.projectStructure.dependencyGraph.entries()),
        astMap: Array.from(report.projectStructure.astMap.entries()),
      },
    };
    return JSON.stringify(serializable, null, 2);
  }

  private generateMarkdownReport(report: FinalReport): string {
    let md = `# Code Analysis Report\n\n`;
    md += `**Generated:** ${report.timestamp.toISOString()}\n\n`;
    md += `**Project:** ${report.projectPath}\n\n`;

    md += `## Project Structure\n\n`;
    md += `- Total Files: ${report.projectStructure.files.length}\n`;
    md += `- Languages: ${[...new Set(report.projectStructure.files.map(f => f.language))].join(', ')}\n\n`;

    md += `## Analysis Report\n\n`;
    md += `- Total Issues: ${report.analysisReport.totalIssues}\n`;
    md += `- Lines of Code: ${report.analysisReport.metrics.linesOfCode}\n`;
    md += `- Complexity: ${report.analysisReport.metrics.complexity}\n`;
    md += `- Maintainability: ${report.analysisReport.metrics.maintainability}\n\n`;

    if (report.analysisReport.totalIssues > 0) {
      md += `### Issues by Severity\n\n`;
      const errorCount = report.analysisReport.issues.filter(i => i.severity === 'error').length;
      const warningCount = report.analysisReport.issues.filter(i => i.severity === 'warning').length;
      const infoCount = report.analysisReport.issues.filter(i => i.severity === 'info').length;
      md += `- Errors: ${errorCount}\n`;
      md += `- Warnings: ${warningCount}\n`;
      md += `- Info: ${infoCount}\n\n`;
    }

    md += `## Vulnerability Report\n\n`;
    md += `- Total Vulnerabilities: ${report.vulnerabilityReport.totalVulnerabilities}\n`;
    md += `- Critical: ${report.vulnerabilityReport.criticalCount}\n`;
    md += `- High: ${report.vulnerabilityReport.highCount}\n`;
    md += `- Medium: ${report.vulnerabilityReport.mediumCount}\n`;
    md += `- Low: ${report.vulnerabilityReport.lowCount}\n\n`;

    if (report.vulnerabilityReport.totalVulnerabilities > 0) {
      md += `### Critical Vulnerabilities\n\n`;
      const critical = report.vulnerabilityReport.vulnerabilities.filter(v => v.severity === 'Critical');
      for (const vuln of critical.slice(0, 5)) {
        md += `- **${vuln.type}** in ${vuln.file}:${vuln.line}\n`;
        md += `  - ${vuln.description}\n`;
        md += `  - Recommendation: ${vuln.recommendation}\n\n`;
      }
    }

    if (report.testReport) {
      md += `## Test Report\n\n`;
      md += `- Total Tests: ${report.testReport.totalTests}\n`;
      md += `- Passed: ${report.testReport.passed}\n`;
      md += `- Failed: ${report.testReport.failed}\n`;
      md += `- Coverage: ${report.testReport.coverage}%\n\n`;
    }

    if (report.patchReport) {
      md += `## Patch Report\n\n`;
      md += `- Total Patches: ${report.patchReport.totalPatches}\n\n`;
    }

    md += `## Workflow Status\n\n`;
    md += `- Stage: ${report.workflowStatus.stage}\n`;
    md += `- Progress: ${report.workflowStatus.progress}%\n`;
    md += `- Message: ${report.workflowStatus.message}\n`;

    if (report.workflowStatus.errors.length > 0) {
      md += `\n### Errors\n\n`;
      for (const error of report.workflowStatus.errors) {
        md += `- ${error}\n`;
      }
    }

    return md;
  }

  private generateHTMLReport(report: FinalReport): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; padding: 10px 20px; background: #f8f9fa; border-radius: 5px; }
        .metric-label { font-weight: bold; color: #666; }
        .metric-value { font-size: 1.5em; color: #007bff; }
        .severity-critical { color: #dc3545; font-weight: bold; }
        .severity-high { color: #fd7e14; font-weight: bold; }
        .severity-medium { color: #ffc107; font-weight: bold; }
        .severity-low { color: #28a745; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #007bff; color: white; }
        .progress { background: #e9ecef; height: 30px; border-radius: 5px; overflow: hidden; }
        .progress-bar { background: #007bff; height: 100%; line-height: 30px; color: white; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Code Analysis Report</h1>
        <p><strong>Generated:</strong> ${report.timestamp.toISOString()}</p>
        <p><strong>Project:</strong> ${report.projectPath}</p>

        <h2>Project Structure</h2>
        <div class="metric">
            <div class="metric-label">Total Files</div>
            <div class="metric-value">${report.projectStructure.files.length}</div>
        </div>

        <h2>Analysis Report</h2>
        <div class="metric">
            <div class="metric-label">Total Issues</div>
            <div class="metric-value">${report.analysisReport.totalIssues}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Lines of Code</div>
            <div class="metric-value">${report.analysisReport.metrics.linesOfCode}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Complexity</div>
            <div class="metric-value">${report.analysisReport.metrics.complexity}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Maintainability</div>
            <div class="metric-value">${report.analysisReport.metrics.maintainability}</div>
        </div>

        <h2>Vulnerability Report</h2>
        <div class="metric">
            <div class="metric-label">Total Vulnerabilities</div>
            <div class="metric-value">${report.vulnerabilityReport.totalVulnerabilities}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Critical</div>
            <div class="metric-value severity-critical">${report.vulnerabilityReport.criticalCount}</div>
        </div>
        <div class="metric">
            <div class="metric-label">High</div>
            <div class="metric-value severity-high">${report.vulnerabilityReport.highCount}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Medium</div>
            <div class="metric-value severity-medium">${report.vulnerabilityReport.mediumCount}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Low</div>
            <div class="metric-value severity-low">${report.vulnerabilityReport.lowCount}</div>
        </div>

        ${report.testReport ? `
        <h2>Test Report</h2>
        <div class="metric">
            <div class="metric-label">Total Tests</div>
            <div class="metric-value">${report.testReport.totalTests}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Passed</div>
            <div class="metric-value">${report.testReport.passed}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Failed</div>
            <div class="metric-value">${report.testReport.failed}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Coverage</div>
            <div class="metric-value">${report.testReport.coverage}%</div>
        </div>
        ` : ''}

        <h2>Workflow Status</h2>
        <p><strong>Stage:</strong> ${report.workflowStatus.stage}</p>
        <p><strong>Message:</strong> ${report.workflowStatus.message}</p>
        <div class="progress">
            <div class="progress-bar" style="width: ${report.workflowStatus.progress}%">
                ${report.workflowStatus.progress}%
            </div>
        </div>
    </div>
</body>
</html>`;
  }
}
