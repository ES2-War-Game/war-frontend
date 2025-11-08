import api from '../interceptor/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id:number;
  username:string;
  email:string;
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

export interface PlayerUpdateDto {
  email?: string;
  imageUrl?: string | null;
  username?: string;
}

export interface PlayerDto {
  id: number;
  username: string;
  email?: string;
  imageUrl?: string | null;
}

export class UsersService {
  async login(params: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post('/api/v1/players/login', params);
      
      if (response.data && response.data.token) {
        console.log('Login bem-sucedido, token recebido:', response.data);
        return { token: response.data.token , id: response.data.id , email:response.data.email , username:response.data.username };
      }
      
      throw new Error('Token não encontrado na resposta');
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  async register(params: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await api.post('/api/v1/players/register', params);
      return response.data;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated player's profile
   * GET /api/v1/players/me
   * Requires Authorization: Bearer <JWT>
   */
  async getCurrentPlayer(): Promise<{ id: number; username: string; email: string; imageUrl: string | null }> {
    try {
      const response = await api.get('/api/v1/players/me');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter dados do jogador atual:', error);
      throw error;
    }
  }

  /**
   * Update player profile (email, imageUrl, username)
   * PATCH /api/v1/players/{id}
   * @param id Player id
   * @param update PlayerUpdateDto
   * @returns Updated PlayerDto
   */
  async updatePlayer(id: number, update: PlayerUpdateDto): Promise<PlayerDto> {
    try {
      const response = await api.patch(`/api/v1/players/${id}`, update);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar perfil do jogador:', error);
      throw error;
    }
  }
}