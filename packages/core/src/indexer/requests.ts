export function getAuthToken(): string | null {
  const JWT_STORAGE_KEY = "authToken";

  const token = localStorage.getItem(JWT_STORAGE_KEY);
  const expiry = localStorage.getItem(`${JWT_STORAGE_KEY}_expiry`);
  if (token && expiry && Date.now() < Number(expiry)) {
    return token;
  }
  localStorage.removeItem(JWT_STORAGE_KEY);
  localStorage.removeItem(`${JWT_STORAGE_KEY}_expiry`);
  return null;
}

export async function getRandomNonce(url: string, address: `0x${string}`) {
  try {
    const nonceResponse = await fetch(url + address);
    if (!nonceResponse.ok) {
      throw new Error(`Failed to get nonce: ${await nonceResponse.text()}`);
    }
    const { nonce } = await nonceResponse.json();
    console.log("Received nonce:", nonce);

    return nonce;
  } catch (authError: any) {
    console.error("Authentication error:", authError);
    throw new Error(`Failed to get nonce: ${authError}`);
  }
}

export async function verifySignature(url: string, address: `0x${string}`, signature: `0x${string}`) {
  const verifyResponse = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address: address, signature }),
  });

  if (!verifyResponse.ok) {
    throw new Error(`Authentication failed: ${await verifyResponse.text()}`);
  }

  const { token, expiresIn } = await verifyResponse.json();
  console.log("Received JWT:", token, "Expires in:", expiresIn, "seconds");

  return { token, expiresIn };
}

/**
 * Processes a JSON stream from an indexer.
 *
 * @param url - The URL of the JSON stream
 * @returns A generator that yields {@link StorageAdapterBlock}
 */
export async function* processJSONStream(url: string) {
  const token = getAuthToken();

  console.log("THE TOKEN", token);

  if (!token) {
    throw new Error(`token authentication error`);
  }
  const headers: HeadersInit = {};
  headers["Content-Type"] = "application/json";
  headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(url, { headers });

  console.log("response ", response);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  let incompleteChunk = "";

  let done: boolean, value: Uint8Array | undefined;

  if (!reader) {
    console.error("No reader found on response body while processing JSON stream");
    return;
  }

  while ((({ done, value } = await reader.read()), !done)) {
    let decodedValue: string = decoder.decode(value, { stream: true });

    // Combine with the previous incomplete chunk (if any)
    decodedValue = incompleteChunk + decodedValue;

    // Indexer chunks are delimited by newlines
    const chunks: string[] = decodedValue.split("\n");

    // The last line might be incomplete, save it for the next iteration
    incompleteChunk = chunks.pop() as string;

    for (const chunk of chunks) {
      if (chunk) {
        yield JSON.parse(chunk);
      }
    }
  }
}
