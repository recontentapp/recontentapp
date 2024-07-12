import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai'
import { BadRequestException } from '@nestjs/common'
import { AIProvider, AIResult, ProcessParams } from './types'

export class GeminiAIProvider implements AIProvider {
  constructor(private readonly apiKey: string) {}

  async process(params: ProcessParams): Promise<AIResult> {
    const model = new GoogleGenerativeAI(this.apiKey).getGenerativeModel({
      model: 'gemini-1.5-pro',
      systemInstruction: params.prompt,
    })

    const responseMimeType =
      params.resultFormat === 'json' ? 'application/json' : 'text/plain'

    const chatSession = model.startChat({
      generationConfig: {
        ...(params.mode === 'strict' && {
          temperature: 0.2,
        }),
        ...(params.mode === 'creative' && {
          temperature: 2,
        }),
        responseMimeType,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    })

    const generationResult = await chatSession.sendMessage(params.query)

    let result: string | null = null

    try {
      /**
       * Returns the text string assembled from all `Part`s of the first candidate
       * of the response, if available.
       * Throws if the prompt or candidate was blocked.
       */
      result = generationResult.response.text()
    } catch (e) {}

    if (!result) {
      throw new BadRequestException('Failed to generate result')
    }

    const inputTokensCount =
      generationResult.response.usageMetadata?.promptTokenCount ?? 0
    const outputTokensCount =
      generationResult.response.usageMetadata?.candidatesTokenCount ?? 0

    return {
      result,
      usage: {
        inputTokensCount,
        outputTokensCount,
      },
    }
  }
}
