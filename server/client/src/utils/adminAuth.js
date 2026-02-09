// Admin auth (localStorage + sessionStorage)

const AUTH_KEY = 'isAdminAuthenticated';
const SESSION_KEY = 'echo_admin_session';

export const setAdminAuthenticated = (isAuthed) => {
  try {
    if (isAuthed) {
      window.localStorage.setItem(AUTH_KEY, 'true');
      window.sessionStorage.setItem(SESSION_KEY, 'true');
    } else {
      window.localStorage.removeItem(AUTH_KEY);
      window.sessionStorage.removeItem(SESSION_KEY);
    }
  } catch (e) {
    // ignore storage errors
  }
};

export const isAdminAuthenticated = () => {
  try {
    const local = window.localStorage.getItem(AUTH_KEY) === 'true';
    const session = window.sessionStorage.getItem(SESSION_KEY) === 'true';

    // Expire on browser close: if session is gone, clear local mirror.
    if (local && !session) {
      window.localStorage.removeItem(AUTH_KEY);
      return false;
    }
    return local && session;
  } catch (e) {
    return false;
  }
};

export const clearAdminAuth = () => setAdminAuthenticated(false);

