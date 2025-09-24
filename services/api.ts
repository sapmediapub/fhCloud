const BACKEND_URL = "https://fhcloud.onrender.com/recognize"; 

export async function recognizeSong(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(BACKEND_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return await response.json();
}
