import apiClient from './client';

export const gameApi = {
  // Get all linked game accounts for authenticated user
  getLinkedAccounts: async (gameName = null) => {
    const params = gameName ? { game_name: gameName } : {};
    return apiClient.get('/games/accounts', { params });
  },

  // Link a new external game account
  linkAccount: async (payload) => {
    return apiClient.post('/games/accounts', payload);
  },

  // Get single account details
  getAccount: async (accountId) => {
    return apiClient.get(`/games/accounts/${accountId}`);
  },

  // Update linked account
  updateAccount: async (accountId, data) => {
    return apiClient.put(`/games/accounts/${accountId}`, data);
  },

  // Unlink game account
  unlinkAccount: async (accountId) => {
    return apiClient.delete(`/games/accounts/${accountId}`);
  },

  // Synchronize telemetry for a specific linked account
  syncAccount: async (accountId) => {
    return apiClient.post(`/games/accounts/${accountId}/sync`);
  },

  // Retrieve combat telemetry / stats for an account
  getAccountStats: async (accountId) => {
    return apiClient.get(`/games/accounts/${accountId}/stats`);
  },

  // Steam & OpenDota specific endpoints
  getSteamLoginUrl: async (returnTo = null) => {
    const params = returnTo ? { return_to: returnTo } : {};
    return apiClient.get('/steam/login', { params });
  },

  getDota2Profile: async () => {
    return apiClient.get('/dota2/me');
  },

  syncDota2: async (accountId = null, steamId = null, background = false) => {
    const params = {};
    if (accountId) params.account_id = accountId;
    if (steamId) params.steam_id = steamId;
    if (background) params.background = background;
    return apiClient.post('/dota2/sync', null, { params });
  },

  // Riot RSO & Valorant specific endpoints
  getRiotLoginUrl: async (state = null) => {
    const params = state ? { state } : {};
    return apiClient.get('/riot/login', { params });
  },

  getRiotProfile: async () => {
    return apiClient.get('/riot/me');
  },

  handleRiotCallback: async (code, state = null) => {
    const params = { code };
    if (state) params.state = state;
    return apiClient.get('/riot/callback', { params });
  },

  handleSteamCallback: async (queryParams) => {
    return apiClient.get('/steam/callback', { params: queryParams });
  },

  syncRiot: async (accountId = null, puuid = null) => {
    const params = {};
    if (accountId) params.account_id = accountId;
    if (puuid) params.puuid = puuid;
    return apiClient.post('/riot/sync', null, { params });
  },
};
