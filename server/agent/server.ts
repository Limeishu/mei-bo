import ping from 'ping';

export interface IServer {
  name: string;
  ip: string;
  isAlive: boolean;
}

export interface IServerAgent {
  monitList: IServer[];
}

class Server implements IServer {
  public name: string;
  public ip: string;
  public isAlive: boolean;

  constructor(name: string, ip: string, isAlive: boolean) {
    this.name = name;
    this.ip = ip;
    this.isAlive = isAlive;
  }
}

class ServerAgent implements IServerAgent {
  public monitList: IServer[];

  public async test(serverName: IServer['name']): Promise<IServer> {
    const res = await ping.promise.probe(serverName);
    return new Server(res.host, res.numeric_host, res.alive);
  }

  public async monit(serverName: IServer['name']): Promise<void> {
    const status = await this.test(serverName);
    this.monitList.push(status);
  }

  public del(serverName: IServer['name']): void {
    this.monitList.forEach((server, index) => {
      if (server.name === serverName) {
        this.monitList.splice(index, 1);
      }
    });
  }
}

export default ServerAgent;
