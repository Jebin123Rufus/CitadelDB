import Groq from 'groq-sdk';

const FALLBACK_MODELS = [
  process.env.GROQ_MODEL,
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.6-27b',
  'allam-2-7b',
].filter(Boolean);

let groqClient = null;

function getClient() {
  if (!process.env.GROQ_API_KEY) {
    const err = new Error('GROQ_API_KEY is not configured');
    err.status = 503;
    throw err;
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

const CYBER_SYSTEM = `You are CitadelDB AI, an expert cybersecurity threat intelligence analyst with deep experience in SOC operations, vulnerability research, MITRE ATT&CK, and incident response.

Rules:
- Only answer cybersecurity-related questions. Politely decline unrelated topics.
- Be precise, actionable, and professional. Use structured markdown when helpful.
- Cite realistic defensive controls, detection logic, and mitigation steps.
- Never fabricate CVE details; if data is missing, state assumptions clearly.
- Frame advice for both technical practitioners and security leadership when appropriate.`;

async function chatCompletion(messages, maxTokens = 2048) {
  const groq = getClient();
  let lastError = null;

  for (const model of FALLBACK_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [{ role: 'system', content: CYBER_SYSTEM }, ...messages],
        temperature: 0.4,
        max_tokens: maxTokens,
      });
      let content = completion.choices[0]?.message?.content || '';
      // Strip internal reasoning/think blocks if present
      content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      if (content) return content;
    } catch (err) {
      console.warn(`Groq completion failed with model ${model}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate completion from AI service');
}

export async function analyzeThreat(input, cveContext = null) {
  const contextBlock = cveContext
    ? `\n\nCVE Context from NVD:\n${JSON.stringify(cveContext, null, 2)}`
    : '';

  const prompt = `Analyze the following threat intelligence input and produce a comprehensive threat intelligence report.

Input:
${input}
${contextBlock}

Provide these sections in markdown:
## Executive Summary
## Technical Breakdown
## Attack Chain Explanation
## Realistic Attack Scenarios
## Business Impact
## Risk Assessment
## Detection Opportunities
## Mitigation Recommendations
## SOC Analyst Notes`;

  return chatCompletion([{ role: 'user', content: prompt }]);
}

export async function explainThreat(cveId, cveData) {
  const prompt = `Create a Threat Explainer for ${cveId} based on this NVD data:

${JSON.stringify(cveData, null, 2)}

Provide clear explanations for students AND professionals. Include:

## Overview
## Exploitation Process
## Prerequisites
## Attack Flow (step-by-step, numbered)
## Impacted Systems
## Potential Outcomes
## Detection Opportunities (with example log/SIEM ideas)
## Mitigation Steps (prioritized)

Use simple language in summaries but keep technical accuracy in details.`;

  return chatCompletion([{ role: 'user', content: prompt }]);
}

export async function summarizeNews(articles) {
  const list = articles
    .slice(0, 8)
    .map((a) => `- ${a.title} (${a.source}): ${a.summary?.slice(0, 200)}`)
    .join('\n');

  const prompt = `As a threat intelligence analyst, review these cybersecurity news headlines and provide:

## Daily Threat Briefing
(3-4 sentence executive overview)

## Key Stories
(For each major story: headline, why it matters, analyst takeaway)

## Recommended Actions for Defenders

News items:
${list}`;

  return chatCompletion([{ role: 'user', content: prompt }], 2048);
}

export async function summarizeArticle(title, summary, source) {
  const prompt = `Summarize this cybersecurity news article in 2-3 concise sentences, then add a 1-2 sentence analyst takeaway for SOC teams.

Title: ${title}
Source: ${source}
Content: ${summary?.slice(0, 1500)}`;

  return chatCompletion([{ role: 'user', content: prompt }], 512);
}

export async function analyzeIoc(ioc, iocType, context) {
  const prompt = `Analyze this Indicator of Compromise (IOC) as a threat intelligence analyst.

IOC Type: ${iocType}
IOC Value: ${ioc}
Heuristic Context: ${JSON.stringify(context, null, 2)}

Provide:
## Threat Classification
## Reputation Assessment
## Risk Indicators
## AI Threat Analysis
## Recommended Actions

Note: This is heuristic/educational analysis without live threat feed lookups. State limitations clearly.`;

  return chatCompletion([{ role: 'user', content: prompt }]);
}

export async function cyberAssistant(messages) {
  const last = messages[messages.length - 1]?.content || '';
  const offTopic =
    /\b(recipe|cook|dating|movie|song lyrics|homework help for math|write me a poem unrelated)\b/i.test(
      last
    );
  if (offTopic) {
    return `I'm CitadelDB's cybersecurity assistant. I can only help with security topics such as vulnerabilities, CVEs, MITRE ATT&CK, threat hunting, incident response, and defensive strategies. How can I assist with your security research?`;
  }
  return chatCompletion(
    messages.map((m) => ({ role: m.role, content: m.content }))
  );
}

export async function toolkitExplain(tool, input, result) {
  const prompt = `Explain the following ${tool} analysis result in educational terms for security learners. Be concise but thorough.

Input: ${input}
Result: ${JSON.stringify(result, null, 2)}`;

  return chatCompletion([{ role: 'user', content: prompt }], 1024);
}
