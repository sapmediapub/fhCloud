import { SongDetails } from '../types';

// Use Web Crypto API for HMAC-SHA1 signature
async function createSignature(stringToSign: string, secretKey: string): Promise<string> {
    const enc = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(secretKey),
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
    );
    const signature = await window.crypto.subtle.sign('HMAC', key, enc.encode(stringToSign));
    const binary = String.fromCharCode(...new Uint8Array(signature));
    return btoa(binary);
}


export const identifySongWithAcrCloud = async (
    audioData: { data: string },
    credentials: { host: string; accessKey: string; secretKey: string }
): Promise<Partial<SongDetails>> => {
    const { host, accessKey, secretKey } = credentials;

    const endpoint = `/v1/identify`;
    const httpMethod = 'POST';
    const dataType = 'audio';
    const dataVersion = '1';
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const stringToSign = `${httpMethod}\n${endpoint}\n${accessKey}\n${dataType}\n${dataVersion}\n${timestamp}`;
    const signature = await createSignature(stringToSign, secretKey);

    const formData = new FormData();
    const fetchRes = await fetch(`data:audio/webm;base64,${audioData.data}`);
    const blob = await fetchRes.blob();
    
    formData.append('sample', blob, 'sample.webm');
    formData.append('sample_bytes', blob.size.toString());
    formData.append('access_key', accessKey);
    formData.append('data_type', dataType);
    formData.append('signature_version', dataVersion);
    formData.append('signature', signature);
    formData.append('timestamp', timestamp);

    const response = await fetch(`https://${host}${endpoint}`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ACRCloud API request failed with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    if (result.status.code !== 0) {
        if (result.status.code === 1001) { // No result
             return { match: false, reasoning: 'No match found by ACRCloud.' };
        }
        throw new Error(`ACRCloud Error: ${result.status.msg}`);
    }

    const metadata = result.metadata?.music?.[0];
    if (!metadata) {
        return { match: false, reasoning: 'No match found by ACRCloud.' };
    }
    
    const artists = metadata.artists?.map((a: { name: string }) => a.name).join(', ') || undefined;

    return {
        match: true,
        title: metadata.title,
        artist: artists,
        album: metadata.album?.name,
        isrc: metadata.external_ids?.isrc,
        upc: metadata.external_ids?.upc,
        releaseDate: metadata.release_date,
        genre: metadata.genres?.map((g: { name: any; }) => g.name).join(', '),
    };
};