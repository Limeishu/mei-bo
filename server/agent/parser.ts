import ServerAgent from './server';
import { firstUpperCase, wrapper } from '../util/formatter';

const serverAgent = new ServerAgent();

const agent = {
  server: serverAgent
};

export const agentParser = (args: any[]): string => {
  const agentType = args[1].slice(1);
  const targetServer = args[3].split(' --all')[0] !== '--all' ? args[3] : null;
  const hasAllOption = args[3].split(' --all')[1] === '';

  switch (args[2]) {
    case 'stat':
      let result: string = `${firstUpperCase(agentType)}\n\n`;

      if (hasAllOption) {
        result = agent[agentType].monitList.map(server => {
          const status = agent[agentType].test(server);
          return `${status.isAlive ? '⭕️' : '❌'} ${wrapper.Big(status.name)}${status.ip ? ' @' + status.ip : '' }`;
        }).join('\n');
      } else {
        const status = agent[agentType].test(targetServer);
        result = `${status.isAlive ? '⭕️' : '❌'} ${wrapper.Big(status.name)}${status.ip ? ' @' + status.ip : '' }`;
      }

      return result;
    case 'monit':
      agent[agentType].monit(targetServer);
      return `${firstUpperCase(agentType)} ${targetServer} added to minit list.`;
    case 'del':
      agent[agentType].del(targetServer);
      return `${firstUpperCase(agentType)} ${targetServer} removed to minit list.`;
    default:
      return;
  }
};
