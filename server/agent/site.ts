import axios from 'axios';

export interface ISite {
  name: string;
  ip: string;
  isAlive: boolean;
}

export interface ISiteAgent {
  monitList: ISite[];
  test: (siteName: ISite['name']) => Promise<ISite>;
  monit: (siteName: ISite['name']) => Promise<void>;
  del: (siteName: ISite['name']) => void;
}

class Site implements ISite {
  public name: string;
  public ip: string;
  public isAlive: boolean;

  constructor(name: string, ip: string, isAlive: boolean) {
    this.name = name;
    this.ip = ip;
    this.isAlive = isAlive;
  }
}

class SiteAgent implements ISiteAgent {
  public monitList: ISite[] = [];

  public async test(siteName: ISite['name']): Promise<ISite> {
    const res = await axios.get(siteName);
    return new Site(siteName, null, res.status === 200);
  }

  public async monit(siteName: ISite['name']): Promise<void> {
    const status = await this.test(siteName);
    this.monitList.push(status);
  }

  public del(siteName: ISite['name']): void {
    this.monitList.forEach((site, index) => {
      if (site.name === siteName) {
        this.monitList.splice(index, 1);
      }
    });
  }
}

export default SiteAgent;
