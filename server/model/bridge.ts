import axios, { AxiosResponse } from 'axios';
import { ITGServerResponse } from '../util/resolver';

export interface IBridge {
  urlRegExp: RegExp;
  apiUrl: string;
  send: (url: string, data: any) => Promise<ITGServerResponse>;
}

class Bridge {
  public urlRegExp = /bot:\/\//;
  public apiUrl = 'https://api.telegram.org/bot';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  public async send(url: string, data: any): Promise<ITGServerResponse> {
    try {
      const res: AxiosResponse<ITGServerResponse> = await axios.post(this.parseUrl(url), data);
      return res.data;
    } catch (error) {
      console.error('[ERROR]', error);
      throw new Error(error);
    }
  }

  private parseUrl(url: string): string {
    return url.replace(this.urlRegExp, `${this.apiUrl}${this.token}/`);
  }
}

export default Bridge;
