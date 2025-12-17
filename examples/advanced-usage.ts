// Example: Advanced configuration with all features

import { analyzeProject } from 'ai-agent-code-analyser';
import type { SystemConfig } from 'ai-agent-code-analyser';

async function advancedAnalysis() {
  const config: SystemConfig = {
    projectPath: './my-project',
    outputPath: './detailed-analysis',
    targetLanguages: ['typescript', 'javascript'],
    
    // Optional: Enable Nemotron 3 nano for AI-powered analysis
    model: {
      provider: 'nemotron',
      modelName: 'nemotron-3-nano',
      apiEndpoint: process.env.NEMOTRON_API_ENDPOINT,
      apiKey: process.env.NEMOTRON_API_KEY,
      temperature: 0.7,
      maxTokens: 2048,
      enabled: !!process.env.NEMOTRON_API_KEY,
    },
    
    agents: {
      ingestor: { 
        name: 'Ingestor', 
        enabled: true,
        options: { maxFileSize: 1024 * 1024 } // 1MB
      },
      analyzer: { 
        name: 'Analyzer', 
        enabled: true,
        options: { strictMode: true }
      },
      vulnerability: { 
        name: 'Vulnerability Scanner', 
        enabled: true,
        options: { includeOWASP: true, includeCWE: true }
      },
      testWriter: { 
        name: 'Test Writer', 
        enabled: true,
        options: { coverageGoal: 90 }
      },
      executor: { 
        name: 'Test Executor', 
        enabled: true,
        options: { timeout: 30000 }
      },
      patcher: { 
        name: 'Patch Generator', 
        enabled: true,
        options: { autoApply: false }
      },
    },
    generateTests: true,
    runTests: true,
    applyFixes: false, // Set to true to auto-apply safe fixes
    reportFormat: 'html',
  };

  try {
    const report = await analyzeProject(config);

    // Custom processing of results
    const criticalVulns = report.vulnerabilityReport.vulnerabilities
      .filter(v => v.severity === 'Critical');

    if (criticalVulns.length > 0) {
      console.log('\n🚨 CRITICAL VULNERABILITIES DETECTED:');
      criticalVulns.forEach(vuln => {
        console.log(`\n- ${vuln.type} in ${vuln.file}:${vuln.line}`);
        console.log(`  Description: ${vuln.description}`);
        console.log(`  Recommendation: ${vuln.recommendation}`);
        if (vuln.cwe) console.log(`  CWE: ${vuln.cwe}`);
        if (vuln.owasp) console.log(`  OWASP: ${vuln.owasp}`);
      });
    }

    // Export specific data
    const summary = {
      timestamp: report.timestamp,
      totalFiles: report.projectStructure.files.length,
      totalIssues: report.analysisReport.totalIssues,
      criticalVulnerabilities: report.vulnerabilityReport.criticalCount,
      testCoverage: report.testReport?.coverage || 0,
    };

    console.log('\n📊 Summary:', summary);

    return report;
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    throw error;
  }
}

advancedAnalysis().catch(console.error);
