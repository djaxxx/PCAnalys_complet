import Groq from 'groq-sdk';
import { SystemInfo } from '@pcanalys/types';

export class GroqClient {
  private client: Groq;

  constructor(apiKey?: string) {
    this.client = new Groq({
      apiKey: apiKey || process.env.GROQ_API_KEY,
    });
  }

  async generateRecommendations(
    systemInfo: SystemInfo | any,
    profile?: string,
    streaming?: boolean
  ): Promise<string[] | AsyncIterable<string>> {
    try {
      const profileContext = profile ? this.getProfileContext(profile) : '';
      
      const prompt = `Analyze this PC system information and provide performance recommendations${profileContext}:

${this.formatSystemInfo(systemInfo)}

Please provide 3-5 specific, actionable recommendations to improve system performance${profile ? ` for ${profile} use case` : ''}. Write each recommendation as a clear, actionable tip. Format as plain text, one tip per line.`;

      if (streaming) {
        return this.generateStreamingRecommendations(prompt);
      }

      const completion = await this.client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-8b-8192',
        temperature: 0.3,
        max_tokens: 1000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('No response from Groq');

      // Try to extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback: split by lines and filter
      return content
        .split('\n')
        .filter(line => line.trim().length > 0 && !line.startsWith('#'))
        .slice(0, 5);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return ['Unable to generate recommendations at this time'];
    }
  }

  private async *generateStreamingRecommendations(prompt: string): AsyncIterable<string> {
    try {
      const stream = await this.client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-8b-8192',
        temperature: 0.3,
        max_tokens: 1000,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('Error generating streaming recommendations:', error);
      yield 'Unable to generate recommendations at this time';
    }
  }

  private getProfileContext(profile: string): string {
    const contexts = {
      gaming: ' focused on gaming performance',
      work: ' focused on productivity and work tasks',
      'content-creation': ' focused on content creation and media production',
      general: ' for general computer use'
    };
    return contexts[profile as keyof typeof contexts] || '';
  }

  private formatSystemInfo(systemInfo: any): string {
    if (systemInfo.os && systemInfo.cpu && systemInfo.memory) {
      // SystemInfo format
      return `OS: ${systemInfo.os.name} ${systemInfo.os.version} (${systemInfo.os.arch})
CPU: ${systemInfo.cpu.name} (${systemInfo.cpu.cores} cores, ${systemInfo.cpu.frequency}MHz)
Memory: ${Math.round(systemInfo.memory.used / 1024 / 1024 / 1024)}GB used / ${Math.round(systemInfo.memory.total / 1024 / 1024 / 1024)}GB total
GPU: ${systemInfo.gpu?.map((gpu: any) => gpu.name).join(', ') || 'Not specified'}`;
    } else {
      // Hardware data format (from Tauri agent)
      return `CPU: ${systemInfo.cpu?.name} (${systemInfo.cpu?.cores} cores, ${systemInfo.cpu?.frequency}MHz)
Memory: ${Math.round((systemInfo.memory?.total || 0) / 1024 / 1024 / 1024)}GB total
Storage: ${systemInfo.storage?.map((storage: any) => `${storage.name} (${Math.round(storage.total / 1024 / 1024 / 1024)}GB)`).join(', ') || 'Not specified'}
GPU: ${systemInfo.gpu?.map((gpu: any) => gpu.name).join(', ') || 'Not specified'}`;
    }
  }
}
