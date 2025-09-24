import React, { useState } from "react";
import { recognizeSong } from "../services/api";

export default function Upload() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const data = await recognizeSong(file);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload a Song</h2>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      {loading && <p>Analyzing...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
