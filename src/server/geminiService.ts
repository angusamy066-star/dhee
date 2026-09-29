import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI, GenerateVideosOperation, ThinkingLevel } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI(apiKey ? { apiKey } : {});

export interface DiagnoseRequest {
  species: string;
  symptoms: string;
  imageBase64?: string;
  imageMimeType?: string;
  sensorData?: {
    temperature?: number;
    ruminationMinutes?: number;
    feedBunkMinutes?: number;
    stepCount?: number;
    waterIntakeLiters?: number;
  };
  mode?: 'deep_differential' | 'fast_triage' | 'general';
  animalTag?: string;
}

export async function runDiagnose(req: DiagnoseRequest) {
  const mode = req.mode || 'general';
  let modelName = 'gemini-3.5-flash';
  let config: Record<string, any> = {};

  if (mode === 'deep_differential') {
    modelName = 'gemini-3.1-pro-preview';
    config = {
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
    };
  } else if (mode === 'fast_triage') {
    modelName = 'gemini-3.1-flash-lite';
    config = {
      temperature: 0.2,
    };
  } else {
    modelName = 'gemini-3.5-flash';
    config = {
      temperature: 0.3,
    };
  }

  const systemInstruction = `You are an expert veterinary epidemiologist and precision livestock diagnostics specialist.
Analyze livestock health issues across all major categories:
1. Infectious/contagious (Foot-and-Mouth Disease, Avian Influenza, African Swine Fever, Bovine TB, Brucellosis, Bluetongue, Newcastle disease).
2. Metabolic & production (Ketosis, Milk Fever, Mastitis, Laminitis, SARA).
3. Parasitic (Haemonchosis, Coccidiosis, Ticks, Mites, Fly strike).
4. Reproductive disorders (Retained placenta, Metritis, fertility loss).
5. Zoonotic diseases (Brucellosis, H5N1, Anthrax, Q Fever, Bovine TB).

Pay special attention to early sensor indicators (wearable collars, ear tags, rumen boluses) where temperature changes, rumination drops, or reduced feed bunk time precede visible clinical signs by 24-48 hours.

You MUST respond strictly with valid JSON conforming to this schema (do NOT wrap in markdown quotes if possible, or return parseable JSON):
{
  "summary": "Brief 1-2 sentence executive assessment",
  "category": "Infectious" | "Metabolic" | "Parasitic" | "Reproductive" | "Zoonotic",
  "severity": "low" | "moderate" | "high" | "critical",
  "suspectedConditions": [
    {
      "name": "Condition name",
      "probability": "number between 0 and 100",
      "rationale": "Key symptoms or sensor signatures supporting this",
      "category": "Infectious" | "Metabolic" | "Parasitic" | "Reproductive" | "Zoonotic"
    }
  ],
  "differentialDiagnosis": "Comprehensive clinical differential notes explaining pathogen or metabolic mechanisms",
  "earlyWarningSigns": [
    "Specific sensor or behavioral indicators (e.g., -25% rumination 30h before swelling)"
  ],
  "diagnosticTestingPlan": {
    "pointOfCare": "Immediate rapid field tests (e.g. lateral flow strip, California Mastitis Test, blood ketone meter)",
    "confirmatoryLab": "Definitive laboratory diagnostic (e.g. RT-PCR, ELISA, bacterial culture & sensitivity)",
    "necropsyNotes": "If mortality risk or post-mortem required, key organ lesions to examine"
  },
  "immediateActions": [
    "Immediate isolation/triage step 1",
    "Supportive care or hydration step 2",
    "Veterinary intervention threshold"
  ],
  "zoonoticRisk": {
    "isZoonotic": true | false,
    "humanTransmissionRisk": "none" | "low" | "moderate" | "high",
    "protectivePPE": "Required gear for farm workers (e.g. N95, nitrile gloves, eye shield)"
  },
  "biosecurityMeasures": [
    "Disinfection protocols (quaternary ammonium, sodium hypochlorite, caustic soda)",
    "Quarantine perimeter and vehicle tire bath protocols"
  ]
}`;

  const promptParts: any[] = [];
  promptParts.push({ text: systemInstruction });

  let textPrompt = `Species: ${req.species || 'Cattle'}\nAnimal Tag: ${req.animalTag || 'Unknown'}\nObserved Symptoms & Posture: ${req.symptoms || 'General lethargy'}\n`;
  if (req.sensorData) {
    textPrompt += `\nWearable Sensor & Behavioral Telemetry:\n`;
    if (req.sensorData.temperature) textPrompt += `- Rectal/Ear Temp: ${req.sensorData.temperature}°C (Normal ~38.5-39.2°C for cattle)\n`;
    if (req.sensorData.ruminationMinutes) textPrompt += `- Rumination: ${req.sensorData.ruminationMinutes} min/day (Baseline ~480-540 min/day)\n`;
    if (req.sensorData.feedBunkMinutes) textPrompt += `- Feed Bunk Attendance: ${req.sensorData.feedBunkMinutes} min/day\n`;
    if (req.sensorData.stepCount) textPrompt += `- Locomotion/Step Activity: ${req.sensorData.stepCount} steps/day\n`;
    if (req.sensorData.waterIntakeLiters) textPrompt += `- Water Intake: ${req.sensorData.waterIntakeLiters} L/day\n`;
  }

  promptParts.push({ text: textPrompt });

  if (req.imageBase64) {
    const cleanBase64 = req.imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
    promptParts.push({
      inlineData: {
        data: cleanBase64,
        mimeType: req.imageMimeType || 'image/jpeg',
      },
    });
    promptParts.push({ text: 'Analyze this photo of the animal, lesion, eye, hoof, or thermal scan carefully as part of your diagnosis.' });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: promptParts },
      config,
    });

    const rawText = response.text || '';
    let parsed: any;
    try {
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        summary: rawText.slice(0, 300),
        category: 'Infectious',
        severity: 'moderate',
        suspectedConditions: [
          { name: 'Clinical Assessment', probability: 75, rationale: rawText.slice(0, 200), category: 'Infectious' },
        ],
        differentialDiagnosis: rawText,
        earlyWarningSigns: ['Behavioral deviation noted in preliminary evaluation'],
        diagnosticTestingPlan: {
          pointOfCare: 'Lateral flow antigen or dipstick test',
          confirmatoryLab: 'Confirmatory RT-PCR / Serology panel',
          necropsyNotes: 'Standard tissue collection if mortality occurs',
        },
        immediateActions: ['Isolate animal', 'Consult licensed herd veterinarian'],
        zoonoticRisk: { isZoonotic: false, humanTransmissionRisk: 'low', protectivePPE: 'Gloves and boots' },
        biosecurityMeasures: ['Clean housing and restrict pen traffic'],
      };
    }

    return {
      modelUsed: modelName,
      diagnosis: parsed,
      rawText,
    };
  } catch (error: any) {
    console.error('Diagnosis AI generation error:', error);
    throw error;
  }
}

export async function searchLivestockOutbreaks(queryText: string) {
  const prompt = `You are a global veterinary epidemiological surveillance system tracking livestock diseases.
Search query: "${queryText}".
Retrieve current and recent livestock disease outbreak alerts, regional quarantine zones, WOAH (World Organisation for Animal Health), USDA APHIS, or EFSA advisories regarding major pathogens (Foot-and-Mouth Disease, Avian Influenza H5N1, African Swine Fever, Bovine Tuberculosis, Bluetongue, Anthrax).

Provide a structured, up-to-date briefing:
1. Executive Regional Situation Summary
2. Active Disease Hotspots & Pathogens (Strains, species affected, transmission vectors)
3. Biosecurity & Movement Restrictions (Quarantine borders, testing requirements)
4. Preventive Advice for Herders and Veterinarians.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Veterinary Advisory Source',
      uri: chunk.web?.uri || '#',
    })) || [];

    return {
      text: response.text || 'No outbreak information found.',
      sources,
      groundingMetadata: response.candidates?.[0]?.groundingMetadata,
    };
  } catch (error) {
    console.error('Search grounding error:', error);
    throw error;
  }
}

export async function generateVeoVideo(params: {
  prompt: string;
  imageBase64?: string;
  imageMimeType?: string;
  aspectRatio?: '16:9' | '9:16';
}) {
  const cleanBase64 = params.imageBase64
    ? params.imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '')
    : undefined;

  const aspectRatio = params.aspectRatio === '9:16' ? '9:16' : '16:9';

  const videoConfig: any = {
    model: 'veo-3.1-fast-generate-preview',
    prompt: params.prompt || 'Cinematic veterinary video of livestock moving smoothly in a pasture for gait analysis',
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio,
    },
  };

  if (cleanBase64) {
    videoConfig.image = {
      imageBytes: cleanBase64,
      mimeType: params.imageMimeType || 'image/jpeg',
    };
  }

  try {
    const operation = await ai.models.generateVideos(videoConfig);
    return { operationName: operation.name };
  } catch (error) {
    console.error('Veo video generation error:', error);
    throw error;
  }
}

export async function checkVeoStatus(operationName: string) {
  try {
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    return {
      done: updated.done,
      error: updated.error,
      response: updated.response,
    };
  } catch (error) {
    console.error('Veo status check error:', error);
    throw error;
  }
}

export async function getVeoDownloadStream(operationName: string) {
  try {
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      throw new Error('Video URI not found in completed operation');
    }

    const videoRes = await fetch(uri, {
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    return videoRes;
  } catch (error) {
    console.error('Veo download error:', error);
    throw error;
  }
}

export async function runVoiceConsult(query: string, species?: string) {
  const prompt = `You are a real-time hands-free veterinary audio assistant working with a livestock farmer or veterinarian in the field/barn.
Species: ${species || 'Livestock'}
User question: "${query}"

Provide a concise, clear spoken response (under 120 words) that can easily be listened to while working with gloves. State the likely cause, the immediate safety or quarantine check, and the recommended diagnostic step.`;

  try {
    const textResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const replyText = textResponse.text || 'I recommend isolating the animal and checking its rectal temperature immediately.';

    // Generate speech using gemini-3.8-flash-lite-tts
    let audioBase64: string | null = null;
    try {
      const speechRes = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [{ text: replyText }],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      audioBase64 = speechRes.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (ttsErr) {
      console.warn('TTS generation fallback:', ttsErr);
    }

    return {
      replyText,
      audioBase64,
    };
  } catch (error) {
    console.error('Voice consult error:', error);
    throw error;
  }
}
