export type OkResponseWithoutData = {
  status: "ok";
};

export type OkResponse<T> = {
  status: "ok";
  data: T;
};

export type ErrorResponse = {
  status: "error";
  message: string;
};

export type APIResponse<T = void> =
  | (T extends void ? OkResponseWithoutData : OkResponse<T>)
  | ErrorResponse;
