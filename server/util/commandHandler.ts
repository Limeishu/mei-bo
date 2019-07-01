import commandTypes from './commandTypes';
import Message from '../model/message';
import { agentParser } from '../agent/parser';
import { wrapper } from './formatter';

const parseCommand = (rawCommand: string, regexp: RegExp): any[] => {
  if (regexp) {
    return rawCommand.match(regexp);
  }

  return [rawCommand.trim()];
};

const helpTextGen = (helpType: string): string => {
  const result = wrapper.Code(
    helpType === 'all' ?
      Object.keys(commandTypes).map(key => `${key}:\n  ${commandTypes[key].help}`).join('\n\n') :
      commandTypes[helpType].help
    );

  return result;
};

const commands = {
  [commandTypes.HELP.command]() {
    return new Message(helpTextGen('all'), 'Markdown');
  },

  [commandTypes.SERVER.command](rawCommand: string) {
    const helpText =
    `
      ${wrapper.Big('Syntax Error')}
      ${helpTextGen('SERVER')}
    `;

    const args = parseCommand(rawCommand, commandTypes.SERVER.regexp);
    if (!args) {
      return new Message(helpText, 'Markdown');
    }

    const result = agentParser(args);
    if (!result || result === null) {
      return new Message(helpText, 'Markdown');
    }

    return new Message(result, 'Markdown');
  },

  [commandTypes.SITE.command](rawCommand: string) {
    const helpText =
    `
      ${wrapper.Big('Syntax Error')}
      ${helpTextGen('SITE')}
    `;

    const args = parseCommand(rawCommand, commandTypes.SITE.regexp);
    if (!args) {
      return new Message(helpText, 'Markdown');
    }

    const result = agentParser(args);
    if (!result || result === null) {
      return new Message(helpText, 'Markdown');
    }

    return new Message(result, 'Markdown');
  }
};

const commandHandler = (rawCommandKey: string) => {
  return commands[rawCommandKey];
};

export default commandHandler;
