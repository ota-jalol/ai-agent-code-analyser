// Example: Using Nemotron 3 nano AI model for intelligent analysis

import { analyzeProject } from 'ai-agent-code-analyser';
import type { SystemConfig } from 'ai-agent-code-analyser';

async function aiPoweredAnalysis() {
  const config: SystemConfig = {
    projectPath: './my-project',
    outputPath: './ai-analysis',
    targetLanguages: ['typescript', 'javascript', 'dart'],
    
    // Configure Nemotron 3 nano AI model
    model: {
      provider: 'nemotron',
      modelName: 'nemotron-3-nano',
      apiEndpoint: process.env.NEMOTRON_API_ENDPOINT || 'https://integrate.api.nvidia.com/v1',
      apiKey: process.env.NEMOTRON_API_KEY,
      temperature: 0.7,
      maxTokens: 2048,
      enabled: true, // Set to false to disable AI features
    },

    agents: {
      ingestor: { name: 'Ingestor', enabled: true },
      analyzer: { name: 'Analyzer', enabled: true },
      vulnerability: { name: 'Vulnerability Scanner', enabled: true },
      testWriter: { name: 'Test Writer', enabled: true },
      executor: { name: 'Test Executor', enabled: true },
      patcher: { name: 'Patch Generator', enabled: false },
    },
    
    generateTests: true,
    runTests: true,
    applyFixes: false,
    reportFormat: 'html',
  };

  try {
    console.log('🤖 Starting AI-powered code analysis...');
    console.log('📡 Nemotron 3 nano: ' + (config.model.enabled ? 'ENABLED' : 'DISABLED'));
    
    const report = await analyzeProject(config);

    // AI-enhanced analysis results
    console.log('\n✅ Analysis Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n📁 Project Analysis:');
    console.log(`  Files Analyzed: ${report.projectStructure.files.length}`);
    console.log(`  Languages: ${[...new Set(report.projectStructure.files.map(f => f.language))].join(', ')}`);

    console.log('\n🔍 Code Quality:');
    console.log(`  Total Issues: ${report.analysisReport.totalIssues}`);
    console.log(`  Complexity: ${report.analysisReport.metrics.complexity}`);
    console.log(`  Maintainability: ${report.analysisReport.metrics.maintainability}`);

    console.log('\n🔒 Security:');
    console.log(`  Total Vulnerabilities: ${report.vulnerabilityReport.totalVulnerabilities}`);
    console.log(`  Critical: ${report.vulnerabilityReport.criticalCount}`);
    console.log(`  High: ${report.vulnerabilityReport.highCount}`);
    console.log(`  Medium: ${report.vulnerabilityReport.mediumCount}`);
    console.log(`  Low: ${report.vulnerabilityReport.lowCount}`);

    if (report.testReport) {
      console.log('\n🧪 Testing:');
      console.log(`  Total Tests: ${report.testReport.totalTests}`);
      console.log(`  Passed: ${report.testReport.passed}`);
      console.log(`  Failed: ${report.testReport.failed}`);
      console.log(`  Coverage: ${report.testReport.coverage}%`);
    }

    // AI insights are embedded in workflow decisions
    console.log('\n🤖 AI Features:');
    console.log('  ✓ Intelligent vulnerability assessment');
    console.log('  ✓ Context-aware code analysis');
    console.log('  ✓ Smart test generation');
    console.log('  ✓ Adaptive workflow prioritization');

    console.log('\n📊 Report saved to:', config.outputPath);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return report;
  } catch (error) {
    console.error('\n❌ Analysis failed:', error);
    
    if (error instanceof Error && error.message.includes('Nemotron')) {
      console.log('\n💡 Tip: Make sure NEMOTRON_API_KEY is set in your environment');
      console.log('   Get your API key from: https://build.nvidia.com/');
      console.log('   Or disable AI features by setting model.enabled = false\n');
    }
    
    throw error;
  }
}

// Example: Running without AI (fallback mode)
async function fallbackAnalysis() {
  const config: SystemConfig = {
    projectPath: './my-project',
    outputPath: './analysis',
    targetLanguages: ['typescript', 'javascript'],
    
    // AI disabled - uses rule-based analysis
    model: {
      provider: 'nemotron',
      modelName: 'nemotron-3-nano',
      enabled: false,
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

  console.log('🔧 Starting rule-based code analysis (AI disabled)...');
  const report = await analyzeProject(config);
  console.log(`✅ Analysis complete! Found ${report.analysisReport.totalIssues} issues`);
  
  return report;
}

// Run the example
if (require.main === module) {
  // Try AI-powered analysis first, fallback to rule-based if needed
  aiPoweredAnalysis()
    .catch(() => {
      console.log('\n⚠️  Falling back to rule-based analysis...\n');
      return fallbackAnalysis();
    })
    .catch(console.error);
}

export { aiPoweredAnalysis, fallbackAnalysis };
