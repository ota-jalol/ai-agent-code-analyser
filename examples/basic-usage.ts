// Example: Using the AI Agent Code Analyser programmatically

import { analyzeProject, createDefaultConfig } from 'ai-agent-code-analyser';

async function main() {
  // Create default configuration
  const config = createDefaultConfig('./path/to/your/project');

  // Customize configuration
  config.outputPath = './analysis-output';
  config.reportFormat = 'html';
  config.generateTests = true;
  config.runTests = false;
  config.applyFixes = false;

  // Run analysis
  console.log('Starting analysis...');
  const report = await analyzeProject(config);

  // Print results
  console.log('\n=== Analysis Results ===');
  console.log(`Files analyzed: ${report.projectStructure.files.length}`);
  console.log(`Total issues: ${report.analysisReport.totalIssues}`);
  console.log(`Total vulnerabilities: ${report.vulnerabilityReport.totalVulnerabilities}`);
  
  console.log('\n=== Vulnerability Breakdown ===');
  console.log(`Critical: ${report.vulnerabilityReport.criticalCount}`);
  console.log(`High: ${report.vulnerabilityReport.highCount}`);
  console.log(`Medium: ${report.vulnerabilityReport.mediumCount}`);
  console.log(`Low: ${report.vulnerabilityReport.lowCount}`);

  console.log('\n=== Code Metrics ===');
  console.log(`Lines of code: ${report.analysisReport.metrics.linesOfCode}`);
  console.log(`Complexity: ${report.analysisReport.metrics.complexity}`);
  console.log(`Maintainability: ${report.analysisReport.metrics.maintainability}`);

  if (report.testReport) {
    console.log('\n=== Test Results ===');
    console.log(`Total tests: ${report.testReport.totalTests}`);
    console.log(`Passed: ${report.testReport.passed}`);
    console.log(`Failed: ${report.testReport.failed}`);
    console.log(`Coverage: ${report.testReport.coverage}%`);
  }

  if (report.patchReport) {
    console.log('\n=== Patches Generated ===');
    console.log(`Total patches: ${report.patchReport.totalPatches}`);
  }

  // Check for critical issues
  if (report.vulnerabilityReport.criticalCount > 0) {
    console.error('\n⚠️  Critical vulnerabilities found!');
    process.exit(1);
  }

  console.log('\n✅ Analysis complete!');
}

main().catch(console.error);
