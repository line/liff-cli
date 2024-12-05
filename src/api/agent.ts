type RequestOption = {
  method?: string;
  headers?: {
    [key: string]: string;
  };
  body?: URLSearchParams | string;
};

export interface Agent {
  request(url: string, option: RequestOption): Promise<Response>;
}

export class FetchAgent implements Agent {
  request(url: string, option: RequestOption): Promise<Response> {
    return fetch(url, option);
  }
}
