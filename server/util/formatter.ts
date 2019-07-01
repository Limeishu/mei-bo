const wrapperType = {
  CODE: 'Code',
  BIG: 'Big'
};

export const firstUpperCase = (str: string) => {
  return str.replace(/\b(\w)(\w*)/g, ($0, $1, $2) => {
    return $1.toUpperCase() + $2.toLowerCase();
  });
};

export const wrapper = {
  [wrapperType.CODE](str: string) {
    const result =
    '```\n' +
    str +
    '\n```';

    return result;
  },

  [wrapperType.BIG](str: string) {
    const result = `**${str}**`;

    return result;
  }
};
