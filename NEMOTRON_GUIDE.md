# Nemotron 3 nano Configuration Guide

## Overview

This system integrates NVIDIA's Nemotron 3 nano model for intelligent AI-powered code analysis and agent management. The AI features are optional and the system works perfectly fine with rule-based analysis when AI is not configured.

## What is Nemotron 3 nano?

Nemotron 3 nano is NVIDIA's optimized small language model designed for:
- Fast, efficient code understanding
- Low-latency inference suitable for real-time analysis
- Context-aware vulnerability assessment
- Intelligent test generation and code review

## Configuration Options

### Option 1: NVIDIA AI Endpoints (Cloud-based, Recommended)

This is the easiest way to get started with Nemotron features.

**Setup:**
1. Create an account at [NVIDIA AI](https://build.nvidia.com/)
2. Get your API key from the dashboard
3. Configure your environment:

```bash
# Add to your .env file or export in terminal
export NEMOTRON_API_ENDPOINT=https://integrate.api.nvidia.com/v1
export NEMOTRON_API_KEY=your_api_key_here
```

**Pros:**
- No local GPU required
- Easy setup
- Maintained by NVIDIA
- Automatic updates

**Cons:**
- Requires internet connection
- API rate limits may apply
- Sends code to external service

### Option 2: Local Deployment

For organizations that need to keep code on-premises.

**Requirements:**
- NVIDIA GPU (RTX 3000 series or better)
- CUDA toolkit installed
- 8GB+ VRAM recommended

**Setup:**
1. Deploy Nemotron 3 nano locally using NVIDIA's containers
2. Configure the local endpoint:

```bash
export NEMOTRON_API_ENDPOINT=http://localhost:8000
export NEMOTRON_API_KEY=local
```

**Pros:**
- Complete data privacy
- No internet required
- No API limits
- Faster inference (with good GPU)

**Cons:**
- Requires GPU hardware
- More complex setup
- Requires maintenance

### Option 3: Fallback Mode (No AI)

The system works perfectly without AI, using traditional static analysis.

**Setup:**
```bash
# Simply don't set NEMOTRON_API_KEY
# Or explicitly disable in config
```

**What you get:**
- Fast rule-based analysis
- All security checks
- Code quality metrics
- Test generation (template-based)
- No external dependencies

**What you don't get:**
- AI-powered prioritization
- Context-aware insights
- Intelligent test generation
- Reduced false positives

## Environment Variables

### Required
- `NEMOTRON_API_KEY` - Your API key (required for AI features)

### Optional
- `NEMOTRON_API_ENDPOINT` - API endpoint URL (default: http://localhost:8000)
- `NEMOTRON_MODEL_NAME` - Model name (default: nemotron-3-nano)
- `NEMOTRON_TEMPERATURE` - Generation temperature 0-1 (default: 0.7)
- `NEMOTRON_MAX_TOKENS` - Max tokens per request (default: 2048)

## Programmatic Configuration

### Minimal Configuration

```typescript
import { analyzeProject, createDefaultConfig } from 'ai-agent-code-analyser';

const config = createDefaultConfig('./my-project');
// AI is automatically enabled if NEMOTRON_API_KEY is set

const report = await analyzeProject(config);
```

### Explicit AI Configuration

```typescript
import { analyzeProject } from 'ai-agent-code-analyser';
import type { SystemConfig } from 'ai-agent-code-analyser';

const config: SystemConfig = {
  projectPath: './my-project',
  outputPath: './analysis',
  targetLanguages: ['typescript', 'javascript'],
  
  model: {
    provider: 'nemotron',
    modelName: 'nemotron-3-nano',
    apiEndpoint: 'https://integrate.api.nvidia.com/v1',
    apiKey: 'your_api_key',
    temperature: 0.7,
    maxTokens: 2048,
    enabled: true,
  },
  
  // ... other configuration
};

const report = await analyzeProject(config);
```

### Disable AI

```typescript
const config = createDefaultConfig('./my-project');
config.model = {
  provider: 'nemotron',
  modelName: 'nemotron-3-nano',
  enabled: false, // Disable AI features
};
```

## AI-Powered Features

When Nemotron 3 nano is enabled, you get:

### 1. Intelligent Prioritization
The AI assesses analysis results and recommends which issues to address first based on:
- Severity and impact
- Code context
- Project dependencies
- Security implications

### 2. Context-Aware Analysis
Traditional static analysis might flag false positives. With AI:
- Better understanding of code intent
- Reduced false positives
- More accurate vulnerability assessment

### 3. Smart Test Generation
AI generates better test cases by:
- Understanding function purpose
- Identifying edge cases
- Creating realistic test data
- Handling complex scenarios

### 4. Adaptive Workflow
The supervisor agent makes intelligent decisions:
- Dynamically adjusts analysis depth
- Prioritizes critical findings
- Optimizes agent execution order
- Provides reasoning for decisions

### 5. Security Assessment
Enhanced vulnerability detection:
- Context-aware severity scoring
- True positive verification
- Risk assessment
- Mitigation recommendations

## Best Practices

### 1. Start with Fallback Mode
Test the system without AI first to understand the baseline capabilities.

### 2. Use AI for Critical Projects
Enable AI features for production code or security-sensitive projects.

### 3. Review AI Recommendations
AI suggestions are intelligent but should still be reviewed by humans.

### 4. Combine with CI/CD
Integrate AI-powered analysis into your continuous integration pipeline.

### 5. Monitor API Usage
If using NVIDIA AI Endpoints, monitor your API usage to stay within limits.

## Troubleshooting

### "Nemotron model not available"
**Solution:** Check that NEMOTRON_API_KEY is set and valid.

```bash
echo $NEMOTRON_API_KEY
# Should output your API key
```

### "API request failed"
**Solution:** Verify endpoint URL and network connectivity.

```bash
curl -H "Authorization: Bearer $NEMOTRON_API_KEY" \
  $NEMOTRON_API_ENDPOINT/v1/models
```

### Slow performance
**Solutions:**
- Use local deployment with GPU
- Reduce `maxTokens` value
- Lower `temperature` for faster responses
- Process smaller file batches

### High API costs
**Solutions:**
- Use local deployment
- Enable AI only for critical files
- Increase caching
- Use fallback mode for non-critical analysis

## Security Considerations

### Data Privacy
- NVIDIA AI Endpoints: Code is sent to NVIDIA servers
- Local deployment: All data stays on your infrastructure
- Fallback mode: No external communication

### API Key Security
- Never commit API keys to version control
- Use environment variables or secret managers
- Rotate keys regularly
- Use different keys for dev/prod

### Code Exposure
When using cloud endpoints:
- Review NVIDIA's data policy
- Consider using for open-source projects only
- Use local deployment for proprietary code

## Performance Benchmarks

### With AI (NVIDIA AI Endpoints)
- Small project (10 files): ~15 seconds
- Medium project (100 files): ~2 minutes
- Large project (1000+ files): ~10 minutes

### With AI (Local GPU)
- Small project: ~5 seconds
- Medium project: ~30 seconds
- Large project: ~3 minutes

### Without AI (Fallback)
- Small project: ~1 second
- Medium project: ~5 seconds
- Large project: ~30 seconds

## Cost Estimates

### NVIDIA AI Endpoints
- Free tier: Limited requests per month
- Paid tier: Based on token usage
- Typical project: $0.10 - $2.00 per analysis

### Local Deployment
- One-time GPU cost: $300 - $1500
- Electricity: ~$0.01 per analysis
- Maintenance: Self-managed

### Fallback Mode
- Cost: $0
- Hardware: Any CPU

## Support and Resources

- [NVIDIA AI Endpoints](https://build.nvidia.com/)
- [Nemotron Documentation](https://developer.nvidia.com/nemotron)
- [API Reference](https://docs.api.nvidia.com/)
- [GitHub Issues](https://github.com/ota-jalol/ai-agent-code-analyser/issues)

## Examples

See the `examples/` directory for:
- `ai-powered-usage.ts` - Full AI integration example
- `advanced-usage.ts` - Advanced configuration
- `basic-usage.ts` - Simple usage without AI

## Conclusion

Nemotron 3 nano integration provides powerful AI capabilities while maintaining flexibility. Start with fallback mode to understand the system, then enable AI for enhanced analysis when needed.
