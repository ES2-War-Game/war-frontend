import axios, { type AxiosResponse } from "axios";
import type { HttpClient, HttpRequest, HttpResponse } from "../types/httpClient";

export class AxiosHttpClientAdapter implements HttpClient {
  async request<T = any>(data: HttpRequest): Promise<HttpResponse<T>> {
    let axiosResponse: AxiosResponse<T>;

    try {
      axiosResponse = await axios.request<T>({
        url: data.url,
        method: data.method,
        data: data.body,
        headers: data.headers,
      });

      return {
        statusCode: axiosResponse.status,
        body: axiosResponse.data,
      };
    } catch (error: any) {
      // Lança erro para ser tratado no catch do componente
      if (error.response) {
        const err: any = new Error(error.response.data?.message || 'Erro na requisição');
        err.response = error.response;
        throw err;
      }
      throw error;
    }
  }
}