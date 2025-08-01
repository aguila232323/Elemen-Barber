export interface LoginResponse {
  token: string;
  [key: string]: any;
}

export interface RegisterResponse {
  message: string;
  requiresVerification?: boolean;
  usuario?: any;
}

export function login(email: string, password: string): Promise<LoginResponse>;
export function register(nombre: string, email: string, password: string, telefono: string): Promise<RegisterResponse>; 