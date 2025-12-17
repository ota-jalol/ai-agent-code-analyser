import type { ModelConfig } from '../types/index.js';
import { Logger } from './helpers.js';

/**
 * NemotronClient - Interface for Nemotron 3 nano AI model
 * Handles communication with NVIDIA's Nemotron model for AI-powered decisions
 */
export class NemotronClient {
  private config: ModelConfig;
  private logger: Logger;
  private baseUrl: string;

  constructor(config: ModelConfig) {
    this.config = config;
    this.logger = Logger.getInstance();
    this.baseUrl = config.apiEndpoint || process.env.NEMOTRON_API_ENDPOINT || 'http://localhost:8000';
  }

  /**
   * Check if the model is available and configured
   */
  isAvailable(): boolean {
    return this.config.enabled && (!!this.config.apiKey || !!process.env.NEMOTRON_API_KEY);
  }

  /**
   * Make a request to Nemotron API
   */
  async complete(prompt: string, options?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }): Promise<string> {
    if (!this.isAvailable()) {
      this.logger.warn('Nemotron model not available, using fallback logic');
      return '';
    }

    const apiKey = this.config.apiKey || process.env.NEMOTRON_API_KEY;
    const url = `${this.baseUrl}/v1/chat/completions`;

    try {
      const messages = [];
      
      if (options?.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt
        });
      }

      messages.push({
        role: 'user',
        content: prompt
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.modelName || 'nemotron-3-nano',
          messages,
          temperature: options?.temperature ?? this.config.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? this.config.maxTokens ?? 2048,
        }),
      });

      if (!response.ok) {
        throw new Error(`Nemotron API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      this.logger.error('Failed to call Nemotron API', error as Error);
      throw error;
    }
  }

  /**
   * Analyze code with Nemotron and get intelligent insights
   */
  async analyzeCode(code: string, filePath: string, language: string): Promise<{
    issues: string[];
    suggestions: string[];
    severity: string;
  }> {
    const systemPrompt = `You are a code analysis expert. Analyze the provided code for issues, bugs, and improvements.
Return your analysis in JSON format with: issues (array), suggestions (array), and severity (Low/Medium/High/Critical).`;

    const prompt = `Analyze this ${language} code from ${filePath}:

\`\`\`${language}
${code}
\`\`\`

Provide detailed analysis in JSON format.`;

    try {
      const response = await this.complete(prompt, { 
        systemPrompt,
        temperature: 0.3 
      });
      
      // Try to parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        issues: [],
        suggestions: [],
        severity: 'Low'
      };
    } catch (error) {
      this.logger.warn('Nemotron analysis failed, using fallback');
      return {
        issues: [],
        suggestions: [],
        severity: 'Low'
      };
    }
  }

  /**
   * Get AI-powered decision for agent orchestration
   */
  async getAgentDecision(context: {
    stage: string;
    currentResults: any;
    projectInfo: any;
  }): Promise<{
    nextAction: string;
    reasoning: string;
    priority: string;
  }> {
    const systemPrompt = `You are an AI agent supervisor. Based on the analysis context, decide the best next action.
Return your decision in JSON format with: nextAction, reasoning, and priority.`;

    const prompt = `Current stage: ${context.stage}
Project information: ${JSON.stringify(context.projectInfo, null, 2)}
Current results: ${JSON.stringify(context.currentResults, null, 2)}

What should be the next action? Consider:
1. Code quality issues found
2. Security vulnerabilities
3. Test coverage
4. Priority of fixes

Provide your decision in JSON format.`;

    try {
      const response = await this.complete(prompt, { 
        systemPrompt,
        temperature: 0.5 
      });
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        nextAction: 'continue',
        reasoning: 'Proceed with standard workflow',
        priority: 'normal'
      };
    } catch (error) {
      this.logger.warn('Nemotron decision failed, using default workflow');
      return {
        nextAction: 'continue',
        reasoning: 'Using default workflow',
        priority: 'normal'
      };
    }
  }

  /**
   * Generate test cases using AI
   */
  async generateTestCase(functionCode: string, functionName: string, language: string): Promise<string> {
    const systemPrompt = `You are an expert test writer. Generate comprehensive test cases for the provided function.`;

    const prompt = `Generate test cases for this ${language} function:

\`\`\`${language}
${functionCode}
\`\`\`

Function name: ${functionName}

Generate complete test code using appropriate testing framework (Vitest for JS/TS, flutter_test for Dart).
Include edge cases, error cases, and happy path scenarios.`;

    try {
      const response = await this.complete(prompt, { 
        systemPrompt,
        temperature: 0.6 
      });
      return response;
    } catch (error) {
      this.logger.warn('Nemotron test generation failed, using template-based approach');
      return '';
    }
  }

  /**
   * Get security vulnerability assessment
   */
  async assessVulnerability(code: string, pattern: string, filePath: string): Promise<{
    isTruePositive: boolean;
    severity: string;
    explanation: string;
  }> {
    const systemPrompt = `You are a security expert. Assess whether the detected pattern is a true security vulnerability.
Return JSON with: isTruePositive (boolean), severity (Low/Medium/High/Critical), explanation (string).`;

    const prompt = `Detected security pattern: ${pattern}
File: ${filePath}

Code context:
\`\`\`
${code}
\`\`\`

Is this a true security vulnerability? Provide detailed assessment in JSON format.`;

    try {
      const response = await this.complete(prompt, { 
        systemPrompt,
        temperature: 0.2 
      });
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        isTruePositive: true,
        severity: 'Medium',
        explanation: 'Unable to assess, flagged for review'
      };
    } catch (error) {
      return {
        isTruePositive: true,
        severity: 'Medium',
        explanation: 'Nemotron assessment unavailable'
      };
    }
  }
}
