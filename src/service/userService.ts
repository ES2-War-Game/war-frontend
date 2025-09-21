import api from '../interceptor/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message?: string;
  id?: number;
  username?: string;
}

export class UsersService {
  async login(params: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post('/api/v1/players/login', params);
      
      if (response.data && response.data.token) {
        console.log('Login bem-sucedido, token recebido:', response.data.token);
        return { token: response.data.token };
      }
      
      throw new Error('Token não encontrado na resposta');
    } catch (error: any) {
      console.error('Erro no login:', error.response?.data || error.message);
      throw error;
    }
  }

  async register(params: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await api.post('/api/v1/players/register', params);
      return response.data;
    } catch (error: any) {
      console.error('Erro no registro:', error.response?.data || error.message);
      throw error;
    }
  }
}