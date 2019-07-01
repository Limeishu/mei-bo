import ServerAgent from './server';
import { firstUpperCase, wrapper } from '../util/formatter';
import { IServerAgent, IServer } from './server';

const serverAgent = new ServerAgent();

interface IAgent {
  server: IServerAgent;
}

const agents: IAgent = {
  server: serverAgent
};

const testPoint = async (agent: IServerAgent, pointName: IServer['name']) => {
  return await agent.test(pointName);
};

const getStatus = (point: IServer) => {
  return `${point.isAlive ? '⭕️' : '❌'} ${wrapper.Big(point.name)}${point.ip ? ' @' + point.ip : '' }`;
};

export const agentParser = async (args: any[]): Promise<string> => {
  const agentType = args[1].slice(1);
  const targetPoint = args[3] !== '--all' ? args[3] : null;
  const hasAllOption = args[3] === '--all';

  const agent: IServerAgent = agents[agentType];

  switch (args[2]) {
    case 'stat':
      let result: string = `${firstUpperCase(agentType)}\n\n`;

      if (hasAllOption) {
        const pointResult = await Promise.all(agent.monitList.map(point => (testPoint(agent, point.name))));
        result += pointResult.map(point => (getStatus(point))).join('\n');
      } else {
        const pointResult = await testPoint(agent, targetPoint);
        result += getStatus(pointResult);
      }

      return result;
    case 'monit':
      await agent.monit(targetPoint);
      return `${firstUpperCase(agentType)} ${targetPoint} added to monit list.`;
    case 'del':
      agent.del(targetPoint);
      return `${firstUpperCase(agentType)} ${targetPoint} removed to monit list.`;
    default:
      return;
  }
};
