import { Address } from "viem"; // Assuming you still need this type

const AUTH_STORAGE_KEY = "primodium_auth";

const REFRESH_TOKEN_STORAGE_KEY = "primodium_refresh_token";

const API_BASE_URL = "http://0.0.0.0:3001";

export interface AuthState {
  token: string; // The access token (JWT)
  refreshToken?: string; // The refresh token (optional, if your backend issues one)
  expiration: number; // Access token expiration timestamp in ms
  refreshExpiration?: number; // Refresh token expiration timestamp in ms
  address: Address; // Wallet address
}

export const setAuthState = (state: AuthState) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
};

export const getAuthState = (): AuthState | null => {
  const item = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!item) return null;

  try {
    return JSON.parse(item);
  } catch (e) {
    console.error("Failed to parse auth state from localStorage", e);
    // Clear corrupted data
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const clearAuthState = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getValidAuthToken = async (currentAddress?: Address): Promise<string | null> => {
  const authState = getAuthState();

  if (!authState) return null;

  const now = Date.now();
  const isAccessTokenExpired = now >= authState.expiration;

  // Check if address matches (if a currentAddress is provided)
  const addressMatches = currentAddress ? authState.address.toLowerCase() === currentAddress.toLowerCase() : true;

  if (!addressMatches) {
    // If address doesn't match, clear state and return null
    console.warn("Stored auth address does not match current wallet address. Clearing auth state.");
    clearAuthState();
    return null;
  }

  // If access token is valid, return it
  if (!isAccessTokenExpired) {
    return authState.token;
  }

  // Access token expired. Attempt to refresh if a refresh token exists and is valid.
  if (authState.refreshToken && authState.refreshExpiration && now < authState.refreshExpiration) {
    console.log("Access token expired, attempting to refresh...");
    try {
      // Call the API to refresh the token
      const newTokens = await refreshAuthToken(authState.refreshToken);
      if (newTokens) {
        const newAuthState: AuthState = {
          token: newTokens.token,
          expiration: newTokens.expiresIn * 1000 + now, // new expiration based on new token lifetime
          refreshToken: newTokens.refreshToken || authState.refreshToken, // Backend might return new refresh token
          refreshExpiration: newTokens.refreshExpiresIn
            ? newTokens.refreshExpiresIn * 1000 + now
            : authState.refreshExpiration,
          address: authState.address, // Address remains the same
        };
        setAuthState(newAuthState);
        console.log("Token refreshed successfully.");
        return newAuthState.token;
      }
    } catch (e) {
      console.error("Failed to refresh token:", e);
      // If refresh fails, clear everything and force re-login
      clearAuthState();
      return null;
    }
  }

  // If no valid access token and no valid refresh token, clear state and return null
  console.log("No valid access token or refresh token. Clearing auth state.");
  clearAuthState();
  return null;
};

// --- New Function for Token Refresh ---
/**
 * Calls your backend API to refresh an expired access token using a refresh token. Adjust the API_BASE_URL and endpoint
 * as per your backend implementation.
 *
 * @param refreshToken The refresh token to send to the backend.
 * @returns A promise that resolves with new access token data, or rejects on failure.
 */
export const refreshAuthToken = async (
  refreshToken: string,
): Promise<{ token: string; expiresIn: number; refreshToken?: string; refreshExpiresIn?: number }> => {
  // Make sure this is consistent with your .env or config
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken}`, // Often refresh tokens are sent in a specific header or body
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to refresh token");
  }

  const data = await response.json();

  return {
    token: data.token,
    expiresIn: data.expiresIn,
    refreshToken: data.refreshToken, // Optional: if backend rotates refresh token
    refreshExpiresIn: data.refreshExpiresIn, // Optional: if backend rotates refresh token
  };
};
