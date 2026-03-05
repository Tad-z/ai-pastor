export interface Response<T = any> {
  error: boolean;
  message: string;
  data?: T;
}
