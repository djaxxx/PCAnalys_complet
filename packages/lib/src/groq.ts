import Groq from 'groq-sdk'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SystemInfo = any

export class GroqClient {
  private client: Groq

  constructor(apiKey?: string) {
    this.client = new Groq({
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      apiKey: apiKey || process.env.GROQ_API_KEY,
    })
  }

  async generateRecommendations(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    systemInfo: SystemInfo | any,
    profile?: string,
    streaming?: boolean,
  ): Promise<string[] | AsyncIterable<string>> {
    try {
      const profileContext = profile ? this.getProfileContext(profile) : ''

      const prompt = `Tu es un expert hardware PC francophone. Analyse ces informations système et produis des recommandations ${profileContext} structurées, concrètes et actionnables en format Markdown.

${this.formatSystemInfo(systemInfo)}

Contraintes de sortie (format Markdown):
- Langue: Français.
- Sois factuel, concis, et précis.
- Utilise le format Markdown avec des titres, listes, tableaux et mise en forme appropriée.
- Structure exactement avec ces sections:

# 📋 Résumé

# ⚡ Gains Rapides

# ⚙️ Réglages & Pilotes

# 🔧 Mises à Niveau

## 💰 BAS (Budget approximatif: X-Y€)

## 💸 MOYEN (Budget approximatif: X-Y€)

## 💎 HAUT (Budget approximatif: X-Y€)

# 📈 Gains Attendus

Détails attendus:
- **📋 Résumé**: 2-3 phrases sur l'état global (points forts/faibles).
- **⚡ Gains Rapides**: 3-5 actions gratuites/immédiates en liste à puces avec **gras** pour les actions principales.
- **⚙️ Réglages & Pilotes**: 3-5 réglages/MAJ clés en liste à puces avec **gras**.
- **🔧 Mises à Niveau**: proposer jusqu'à 3 upgrades par budget avec composants adaptés au profil, inclure fourchettes de prix et compatibilité (✅ oui / ❌ non).
- **📈 Gains Attendus**: utiliser un tableau avec colonnes Niveau, Amélioration, Gains moyens.

Important:
- Si l'info est incomplète (ex: GPU non détecté), proposer des vérifications.
- Adapter les priorités selon le profil utilisateur.
- Utiliser des émojis pour améliorer la lisibilité.
- Ne JAMAIS inventer de références précises si non détectées; rester générique mais utile.
`

      if (streaming) {
        return this.generateStreamingRecommendations(prompt)
      }

      const completion = await this.client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-8b-8192',
        temperature: 0.3,
        max_tokens: 1000,
      })

      const content = completion.choices[0]?.message?.content
      if (!content) throw new Error('No response from Groq')

      // Try to extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      // Fallback: split by lines and filter
      return content
        .split('\n')
        .filter(line => line.trim().length > 0 && !line.startsWith('#'))
        .slice(0, 5)
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return ['Unable to generate recommendations at this time']
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
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          yield content
        }
      }
    } catch (error) {
      console.error('Error generating streaming recommendations:', error)
      yield 'Unable to generate recommendations at this time'
    }
  }

  private getProfileContext(profile: string): string {
    const contexts = {
      gaming: ' focused on gaming performance',
      work: ' focused on productivity and work tasks',
      'content-creation': ' focused on content creation and media production',
      general: ' for general computer use',
    }
    return contexts[profile as keyof typeof contexts] || ''
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatSystemInfo(systemInfo: any): string {
    if (systemInfo.os && systemInfo.cpu && systemInfo.memory) {
      // SystemInfo format
      return `OS: ${systemInfo.os.name} ${systemInfo.os.version} (${systemInfo.os.arch})
CPU: ${systemInfo.cpu.name} (${systemInfo.cpu.cores} cores, ${systemInfo.cpu.frequency}MHz)
Memory: ${Math.round(systemInfo.memory.used / 1024 / 1024 / 1024)}GB used / ${Math.round(systemInfo.memory.total / 1024 / 1024 / 1024)}GB total
GPU: ${Array.isArray(systemInfo.gpu) ? systemInfo.gpu.map((gpu: { name?: string }) => gpu.name).join(', ') : 'Not specified'}`
    } else {
      // Hardware data format (from Tauri agent)
      return `CPU: ${systemInfo.cpu?.name} (${systemInfo.cpu?.cores} cores, ${systemInfo.cpu?.frequency}MHz)
Memory: ${Math.round((systemInfo.memory?.total || 0) / 1024 / 1024 / 1024)}GB total
Storage: ${Array.isArray(systemInfo.storage) ? systemInfo.storage.map((s: { name?: string; total?: number }) => `${s.name} (${Math.round((s.total || 0) / 1024 / 1024 / 1024)}GB)`).join(', ') : 'Not specified'}
GPU: ${Array.isArray(systemInfo.gpu) ? systemInfo.gpu.map((g: { name?: string }) => g.name).join(', ') : 'Not specified'}`
    }
  }
}
