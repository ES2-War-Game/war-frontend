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
      return {
        statusCode: error.response?.status ?? 500,
        body: error.response?.data,
      };
    }
  }
}