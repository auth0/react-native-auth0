import { Telemetry } from './telemetry';
declare type NetworkClientOptions = {
  baseUrl: string;
  telemetry?: Telemetry;
  token?: string;
  timeout?: number;
};
export default class Client {
  telemetry: Telemetry;
  baseUrl: string;
  domain: string;
  private bearer?;
  private timeout;
  constructor(options: NetworkClientOptions);
  post<TData = unknown, TBody = unknown>(
    path: string,
    body: TBody
  ): Promise<Auth0Response<TData>>;
  patch<TData = unknown, TBody = unknown>(
    path: string,
    body: TBody
  ): Promise<Auth0Response<TData>>;
  get<TData = unknown>(
    path: string,
    query?: unknown
  ): Promise<Auth0Response<TData>>;
  url(path: string, query?: any, includeTelemetry?: boolean): string;
  request<TData, TBody = unknown>(
    method: 'GET' | 'POST' | 'PATCH',
    url: string,
    body?: TBody
  ): Promise<Auth0Response<TData>>;
  _encodedTelemetry(): string;
}
export declare type Auth0Response<TData> = {
  json?: TData;
  text?: string;
  status: number;
  ok?: boolean;
  headers?: Headers;
};
export {};
