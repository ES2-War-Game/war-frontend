import type { HttpClient, HttpResponse } from "../types/httpClient";
import type { User, UserLogin } from "../types/user";

interface IUser{
    login: (data: UserLogin)=> Promise<HttpResponse<string>>
    register: (data: User)=> Promise<HttpResponse<User>>
}


export class UsersService implements IUser{
  private readonly httpClient: HttpClient;
  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  register(data: User) {
    return this.httpClient.request<User>({
      url: import.meta.env.VITE_BACKEND_URL + "/api/v1/players/register",
      method: "post",
      body: data,
    });
  }
  login(data: UserLogin) {
    return this.httpClient.request<string>({
      url: import.meta.env.VITE_BACKEND_URL + "/api/v1/players/login",
      method: "post",
      body: data,
    });
  }
  }