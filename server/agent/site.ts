import ping from 'ping';

export interface ISite {
  name: string;
  ip: string;
  isAlive: boolean;
}

export interface ISiteAgent {
  monitList: ISite[];
  test: (serverName: ISite['name']) => Promise<ISite>;
  monit: (serverName: ISite['name']) => Promise<void>;
  del: (serverName: ISite['name']) => void;
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

  public async test(serverName: ISite['name']): Promise<ISite> {
    const res = await ping.promise.probe(serverName, { extra: [ '-4' ] });
    return new Site(res.host, res.numeric_host, res.alive);
  }

  public async monit(serverName: ISite['name']): Promise<void> {
    const status = await this.test(serverName);
    this.monitList.push(status);
  }

  public del(serverName: ISite['name']): void {
    this.monitList.forEach((server, index) => {
      if (server.name === serverName) {
        this.monitList.splice(index, 1);
      }
    });
  }
}

export default SiteAgent;
