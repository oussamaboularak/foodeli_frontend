import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';

/**
 * Cookie utility for managing authentication tokens
 */
export const cookieUtils = {
    /**
     * Set authentication token in cookie
     * @param token - JWT token to store
     * @param expiresInDays - Number of days until cookie expires (default: 7)
     */
    setToken: (token: string, expiresInDays: number = 7): void => {
        Cookies.set(TOKEN_KEY, token, {
            expires: expiresInDays,
            secure: window.location.protocol === 'https:', // Only send over HTTPS in production
            sameSite: 'lax', // CSRF protection while allowing navigation
            path: '/', // Available across entire app
        });
    },

    /**
     * Get authentication token from cookie
     * @returns Token string or undefined if not found
     */
    getToken: (): string | undefined => {
        return Cookies.get(TOKEN_KEY);
    },

    /**
     * Remove authentication token from cookie
     */
    removeToken: (): void => {
        Cookies.remove(TOKEN_KEY, { path: '/' });
    },

    /**
     * Check if user is authenticated (has valid token)
     * @returns True if token exists
     */
    hasToken: (): boolean => {
        return !!Cookies.get(TOKEN_KEY);
    },
};
