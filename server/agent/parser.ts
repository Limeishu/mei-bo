import ServerAgent from './server';
import { firstUpperCase, wrapper } from '../util/formatter';

const serverAgent = new ServerAgent();

const agent = {
  server: serverAgent
};

export const agentParser = async (args: any[]): Promise<string> => {
  const agentType = args[1].slice(1);
  const targetServer = args[3] !== '--all' ? args[3] : null;
  const hasAllOption = args[3] === '--all';

  switch (args[2]) {
    case 'stat':
      let result: string = `${firstUpperCase(agentType)}\n\n`;

      if (hasAllOption) {
        const _result = await Promise.all(agent[agentType].monitList.map(async server => {
          const status = await agent[agentType].test(server);
          return `${status.isAlive ? '⭕️' : '❌'} ${wrapper.Big(status.name)}${status.ip ? ' @' + status.ip : '' }`;
        }));

        result = _result.join('\n');
      } else {
        const status = await agent[agentType].test(targetServer);
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
