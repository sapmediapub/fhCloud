import { Type } from "@google/genai";

export interface AudioData {
  mimeType: string;
  data: string;
}

export interface SongDetails {
  match: boolean;
  artist?: string;
  title?: string;
  album?: string;
  releaseDate?: string;
  genre?: string;
  isrc?: string;
  upc?: string;
  writers?: string[];
  producers?: string[];
  publisher?: string;
  source?: string;
  reasoning?: string;
  acousticFingerprint?: string;
}

export interface InfringementAnalysis {
  isInfringing: boolean;
  confidence: number;
  summary: string;
  similarities: string[];
  differences: string[];
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}
export interface UsageResult {
  summary:string;
  sources: GroundingChunk[];
}

export type ApiResult = SongDetails | InfringementAnalysis | UsageResult;

export interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  audioClip: AudioData;
  result: SongDetails;
}

export interface AcrCredentials {
    host: string;
    accessKey: string;
    secretKey: string;
}

export const songDetailsSchema = {
  type: Type.OBJECT,
  properties: {
    match: { type: Type.BOOLEAN, description: "True if a song was identified, otherwise false." },
    artist: { type: Type.STRING, description: "The name of the primary artist." },
    title: { type: Type.STRING, description: "The title of the song." },
    album: { type: Type.STRING, description: "The album the song belongs to." },
    releaseDate: { type: Type.STRING, description: "The release date of the song (YYYY-MM-DD)." },
    genre: { type: Type.STRING, description: "The primary genre of the song." },
    isrc: { type: Type.STRING, description: "The International Standard Recording Code." },
    upc: { type: Type.STRING, description: "The Universal Product Code of the release." },
    acousticFingerprint: { type: Type.STRING, description: "A unique 64-character hexadecimal string representing the song's acoustic fingerprint." },
    writers: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of songwriters."
    },
    producers: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of producers."
    },
    publisher: { type: Type.STRING, description: "The music publisher." },
    source: { type: Type.STRING, description: "The source of the metadata, e.g., the record label or music group." },
    reasoning: { type: Type.STRING, description: "A brief explanation if no match is found." }
  },
  required: ["match"],
};

export const infringementAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        isInfringing: { type: Type.BOOLEAN, description: "True if potential infringement is detected." },
        confidence: { type: Type.NUMBER, description: "Confidence score (0.0 to 1.0) of the infringement assessment." },
        summary: { type: Type.STRING, description: "A detailed musicologist summary explaining the reasoning." },
        similarities: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Bullet points of musical similarities (melody, harmony, rhythm, etc.)."
        },
        differences: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Bullet points of musical differences."
        }
    },
    required: ["isInfringing", "confidence", "summary", "similarities", "differences"]
};