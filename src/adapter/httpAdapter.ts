import axios, { type AxiosResponse } from 'axios';
import type { HttpClient, HttpRequest, HttpResponse } from '../types/httpClient';
import { useAuthStore } from '../store/useAuthStore';

export class AxiosHttpClientAdapter implements HttpClient {
  async request<T = any>(params: HttpRequest): Promise<HttpResponse<T>> {
    try {
      const token = useAuthStore.getState().token;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...params.headers,
      };
      
      // Only add authorization header if token exists AND it's not an auth endpoint
      const isAuthEndpoint = params.url.includes('/api/auth/');
      if (token && !isAuthEndpoint) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response: AxiosResponse = await axios.request({
        url: params.url,
        method: params.method,
        data: params.body,
        headers,
        params: params.params,
      });

      return {
        statusCode: response.status,
        body: response.data,
      };
    } catch (error: any) {
      // Log the error details to help with debugging
      console.error('HTTP request error:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          statusCode: error.response.status,
          body: error.response.data,
        };
      } else if (error.request) {
        // The request was made but no response was received
        return {
          statusCode: 0,
          body: 'No response received from server' as T,
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        return {
          statusCode: 0,
          body: error.message as T,
        };
      }
    }
  }
}