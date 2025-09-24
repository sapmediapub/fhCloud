import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AudioData, infringementAnalysisSchema, songDetailsSchema, GroundingChunk, SongDetails } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function parseJsonResponse(jsonString: string): any {
  try {
    // Clean the string from markdown and trim it
    const cleanedString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedString);
  } catch (e) {
    console.error("Failed to parse JSON response:", e);
    console.error("Original string:", jsonString);
    throw new Error("Invalid JSON response from API.");
  }
}

async function generateJsonContent(model: string, prompt: any[], schema: any) {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: prompt },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });
  return parseJsonResponse(response.text);
}

export const identifySong = async (audioData: AudioData, details?: { title: string; artist: string; album: string; isrc?: string; }) => {
  const audioPart = { inlineData: { mimeType: audioData.mimeType, data: audioData.data } };
  let promptText: string;

  if (details && details.isrc) {
    promptText = `This song has been identified with ISRC: ${details.isrc}. 
    Using this ISRC and the provided audio as reference, act as a musicologist to find and provide detailed metadata. 
    Your primary goal is to find accurate information for: genre, writers, producers, publisher, and the metadata source (e.g., a record label like 'Sap Music Group'). It is crucial that you find the writers, producers, and publisher.
    Also, you MUST generate a unique 64-character hexadecimal acoustic fingerprint for the provided audio.
    Confirm the title ("${details.title}"), artist ("${details.artist}"), and album ("${details.album}"). If there are discrepancies, prioritize the information associated with the ISRC.
    If you cannot find details, leave the fields blank. Set 'match' to true as the song is already identified.`;
  } else if (details && (details.title || details.artist || details.album)) {
    promptText = `Verify and complete the following song details based on the provided audio clip. The audio is the source of truth. If the details are incorrect, correct them. If they are correct, confirm them and provide any missing information. It is crucial to provide: genre, ISRC, UPC, writers, producers, publisher, and source. 
    Also, you MUST generate a unique 64-character hexadecimal acoustic fingerprint for the provided audio. 
    If you cannot identify the song, set 'match' to false and explain why.
    Provided Details:
    - Title: ${details.title || 'Not provided'}
    - Artist: ${details.artist || 'Not provided'}
    - Album: ${details.album || 'Not provided'}`;
  } else {
    promptText = "Identify the song in this audio clip. Provide as much detail as possible. You must include: artist, title, album, release date (in YYYY-MM-DD format), genre, ISRC, UPC, writers, producers, publisher, and source. Also, you MUST generate a unique 64-character hexadecimal acoustic fingerprint for the provided audio. If you cannot identify it, set 'match' to false and provide a brief reason.";
  }
  
  const textPart = { text: promptText };
  
  return generateJsonContent('gemini-2.5-flash', [audioPart, textPart], songDetailsSchema);
};

export const checkForInfringement = async (audioData: AudioData, songDetails?: Partial<SongDetails>) => {
    const audioPart = { inlineData: { mimeType: audioData.mimeType, data: audioData.data } };
    let promptText = `As a musicologist, analyze the provided audio clip for potential copyright infringement.`;

    if(songDetails && songDetails.title && songDetails.artist) {
        promptText += ` Compare it meticulously to the identified song: "${songDetails.title}" by "${songDetails.artist}".`;
    } else {
        promptText += ` First, attempt to identify the provided clip, then compare it to its most likely original or well-known version.`;
    }
    
    promptText += ` Analyze melody, harmony, rhythm, lyrics, and structure. Provide a detailed report including a confidence score from 0.0 to 1.0, a summary, and lists of specific similarities and differences.`;
    const textPart = { text: promptText };

    return generateJsonContent('gemini-2.5-flash', [audioPart, textPart], infringementAnalysisSchema);
}

export const findSongUsage = async (title: string, artist: string) => {
    const prompt = `Find official links for the song "${title}" by "${artist}" on major Digital Service Providers (DSPs), specifically Spotify, Apple Music, and YouTube. Provide a list of direct URLs.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
        },
    });
    
    const summary = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    
    return { summary, sources };
}

export const searchWebByAudio = async (audioData: AudioData) => {
    const audioPart = { inlineData: { mimeType: audioData.mimeType, data: audioData.data } };
    const textPart = { text: "Analyze the provided audio clip and follow these steps: 1. Identify the type of audio (e.g., song, speech, sound effect). 2. Based on the type, construct a targeted web search query. For a song, search for 'lyrics and meaning of [song title] by [artist]'. For speech, search for 'transcription and speaker identification of [speech clip]'. For a sound effect, search for 'origin and common uses of [sound effect name]'. 3. Execute the search. 4. Provide a detailed summary of your findings and list the URLs of the most relevant sources." };
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [audioPart, textPart] },
        config: {
            tools: [{googleSearch: {}}],
        },
    });
    
    const summary = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    
    return { summary, sources };
}