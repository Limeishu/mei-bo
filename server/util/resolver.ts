export interface ITGServerResponse {
  ok: boolean;
  result: boolean | any;
  description?: string;
}

export interface ITGServerMessageEntity {
  offset: number;
  length: number;
  type: 'mention' | 'bot_command';
}

export interface ITGServerMessage {
  update_id: number;
  message:
  {
    message_id: number,
    from:
    {
      id: number,
      is_bot: boolean,
      first_name: string,
      username: string,
      language_code: string
    },
    chat:
    {
      id: number,
      first_name: string,
      username: string,
      type: string
    },
    date: number,
    text: string,
    entities: ITGServerMessageEntity[]
  };
}
