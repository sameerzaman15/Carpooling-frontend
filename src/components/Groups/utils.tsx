export const getUserId = (): string | null => {
    return localStorage.getItem('userId');
  };
  
  export const setUserId = (userId: string): void => {
    localStorage.setItem('userId', userId);
  };
  
  export const removeUserId = (): void => {
    localStorage.removeItem('userId');
  };
  
  export const getAccessToken = (): string | null => {
    return localStorage.getItem('access_token');
  };
  
  export const setAccessToken = (token: string): void => {
    localStorage.setItem('access_token', token);
  };
  
  export const removeAccessToken = (): void => {
    localStorage.removeItem('access_token');
  };
  
  export const isAuthenticated = (): boolean => {
    return !!getAccessToken();
  };
  
  export const logout = (): void => {
    removeUserId();
    removeAccessToken();
  };