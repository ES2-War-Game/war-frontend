export interface HttpClient {
  request: <T = any>(data: HttpRequest) => Promise<HttpResponse<T>>;
}

export type HttpRequest = {
  url: string;
  method: 'get' | 'post' | 'put' | 'delete';
  body?: any;
  headers?: any;
};

export type HttpResponse<T = any> = {
  statusCode: number;
  body: T;
};
