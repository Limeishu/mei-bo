import axios, { AxiosResponse } from 'axios';

export interface IBridge {
  urlRegExp: RegExp;
  apiUrl: string;
  set: (url: string, data: any) => Promise<AxiosResponse<any>>;
}

class Bridge {
  public urlRegExp = /bot:\/\//;
  public apiUrl = 'https://api.telegram.org/bot';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  public async set(url: string, data: any): Promise<AxiosResponse<any>> {
    try {
      const res: AxiosResponse<any> = await axios.post(this.parseUrl(url), data);
      return res;
    } catch (error) {
      console.error('[ERROR]', error);
      throw new Error(error);
    }
  }

  private parseUrl(url: string): string {
    return url.replace(this.urlRegExp, `${this.apiUrl}${this.token}`);
  }
}

export default Bridge;
