// Servicio para manejar la integración con Google Calendar

export interface GoogleCalendarStatus {
  isGoogleUser: boolean;
  userEmail: string;
  googlePictureUrl: string | null;
  calendarAuthorized: boolean;
  message: string;
}

export interface GoogleCalendarAuthResponse {
  message: string;
  authorizationUrl?: string;
  isGoogleUser?: boolean;
  status?: string;
  userEmail?: string;
}

export const googleCalendarService = {
  /**
   * Obtiene el estado de autorización del Google Calendar
   */
  async getStatus(): Promise<GoogleCalendarStatus> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch('http://localhost:8080/api/google-calendar/status', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener el estado del Google Calendar');
    }

    return response.json();
  },

  /**
   * Obtiene la URL de autorización para Google Calendar
   */
  async getAuthUrl(): Promise<GoogleCalendarAuthResponse> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch('http://localhost:8080/api/google-calendar/auth-url', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener la URL de autorización');
    }

    return response.json();
  },

  /**
   * Autoriza el acceso al Google Calendar
   */
  async authorizeCalendar(): Promise<GoogleCalendarAuthResponse> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch('http://localhost:8080/api/google-calendar/authorize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al autorizar el Google Calendar');
    }

    return response.json();
  },

  /**
   * Maneja el callback de autorización de Google
   */
  async handleCallback(code: string, email: string): Promise<GoogleCalendarAuthResponse> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch('http://localhost:8080/api/google-calendar/callback', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al procesar la autorización');
    }

    return response.json();
  },

  /**
   * Revoca la autorización de Google Calendar
   */
  async revokeAuthorization(): Promise<GoogleCalendarAuthResponse> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch('http://localhost:8080/api/google-calendar/revoke', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al revocar la autorización');
    }

    return response.json();
  },
}; 