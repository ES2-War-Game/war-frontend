export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export interface HttpRequest {
  url: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>; // Add the 'params' property
}
export interface HttpResponse<T = any> {
  statusCode: number;
  body: T;
}

export interface HttpClient {
  request: <T = any>(data: HttpRequest) => Promise<HttpResponse<T>>;
}