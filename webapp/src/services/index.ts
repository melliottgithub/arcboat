const API_BASE_URL = process.env.REACT_API_BASE_URL;

export type UploadRequest = {
  action: string,
  filename: string,
  fileContent: string
};

export type UploadResponse = {
  filename: string,
  size: number,
}

export type SummarizeRequest = {
  action: string,
  filename: string
}

type Freq = [string, number];

export type SummarizeResponse = {
  elapsedSeconds: number,
  topMessageIds: Freq[],
  error?: string
}

export const post = async <T, R>(url: string, body: T) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    mode: 'cors'
  });
  return response.json() as R;
}

function encodeFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result == 'string') {
        const base64 = event.target?.result.split(',')[1]; 
        resolve(base64)
      } else {
        reject('error');
      }
    };
    reader.readAsDataURL(file);
  });
}

export const uploadFile = async (file: File) => {
  const action = 'upload';
  const filename = file.name;
  const fileContent = await encodeFileToBase64(file);
  return post<UploadRequest, UploadResponse>(
    `${API_BASE_URL}`, { action, filename, fileContent });
}

export const summarize = async (filename: string) => {
  const action = 'summarize';
  const response = await post<SummarizeRequest, SummarizeResponse>(
    `${API_BASE_URL}`, { action, filename });
  return response;
}
