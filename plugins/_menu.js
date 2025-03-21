const {
  addSpace,
  textToStylist,
  getUptime,
  getRam,
  getDate,
  getPlatform,
  bot,
  lang,
} = require('../lib/');

// Generate Help Message
const generateHelpMessage = (ctx, message, date, time) => {
  const sortedCommands = ctx.commands
    .slice()
    .sort((a, b) => (a.name && b.name ? a.name.localeCompare(b.name) : 0));

  const helpMessage = [
    lang.plugins.menu.help.format(
      ctx.PREFIX,
      message.pushName,
      time,
      date.toLocaleString('en', { weekday: 'long' }),
      date.toLocaleDateString('hi'),
      ctx.VERSION,
      ctx.pluginsCount,
      getRam(),
      getUptime('t'),
      getPlatform()
    ),
    '╭────────────────',
  ];

  sortedCommands.forEach((command, index) => {
    if (!command.dontAddCommandList && command.pattern !== undefined) {
      helpMessage.push(
        `│ ${index + 1} ${addSpace(index + 1, sortedCommands.length)}${textToStylist(
          command.name.toUpperCase(),
          'mono'
        )}`
      );
    }
  });

  helpMessage.push('╰────────────────');
  return helpMessage.join('\n');
};

// Generate Menu Message
const generateMenuMessage = (ctx, message, date, time, match) => {
  const commands = {};

  ctx.commands.forEach((command) => {
    if (!command.dontAddCommandList && command.pattern !== undefined) {
      const cmdType = command.type.toLowerCase();
      if (!commands[cmdType]) commands[cmdType] = [];

      const isDisabled = command.active === false;
      const cmd = command.name.trim();
      commands[cmdType].push(isDisabled ? `${cmd} [disabled]` : cmd);
    }
  });

  const sortedCommandKeys = Object.keys(commands).sort();

  let msg = lang.plugins.menu.menu.format(
    ctx.PREFIX,
    message.pushName,
    time,
    date.toLocaleString('en', { weekday: 'long' }),
    date.toLocaleDateString('hi'),
    ctx.VERSION,
    ctx.pluginsCount,
    getRam(),
    getUptime('t'),
    getPlatform()
  );

  msg += '\n';

  if (match && commands[match]) {
    msg += ` ╭─❏ ${textToStylist(match.toLowerCase(), 'smallcaps')} ❏\n`;
    commands[match]
      .sort((a, b) => a.localeCompare(b))
      .forEach((plugin) => {
        msg += ` │ ${textToStylist(plugin.toUpperCase(), 'mono')}\n`;
      });
    msg += ' ╰─────────────────';
    return msg;
  }

  sortedCommandKeys.forEach((command) => {
    msg += ` ╭─❏ ${textToStylist(command.toLowerCase(), 'smallcaps')} ❏\n`;
    commands[command]
      .sort((a, b) => a.localeCompare(b))
      .forEach((plugin) => {
        msg += ` │ ${textToStylist(plugin.toUpperCase(), 'mono')}\n`;
      });
    msg += ' ╰─────────────────\n';
  });

  return msg.trim();
};

// Main Bot Handlers

// Help Command
bot(
  {
    pattern: 'help ?(.*)',
    dontAddCommandList: true,
  },
  async (message, match, ctx) => {
    try {
      const [date, time] = getDate();
      const helpMessage = generateHelpMessage(ctx, message, date, time);
      await message.send(helpMessage);
    } catch (error) {
      console.error('Error in help command:', error);
      await message.send('Something went wrong while fetching the help menu.');
    }
  }
);

// List Command
bot(
  {
    pattern: 'list ?(.*)',
    dontAddCommandList: true,
  },
  async (message, match, ctx) => {
    try {
      const sortedCommands = ctx.commands
        .slice()
        .sort((a, b) => (a.name && b.name ? a.name.localeCompare(b.name) : 0));

      const commandList = sortedCommands
        .filter((command) => !command.dontAddCommandList && command.pattern !== undefined)
        .map((command) => `- *${command.name}*\n${command.desc}\n`)
        .join('\n');

      await message.send(commandList);
    } catch (error) {
      console.error('Error in list command:', error);
      await message.send('An error occurred while fetching the list of commands.');
    }
  }
);

// Menu Command
bot(
  {
    pattern: 'menu ?(.*)',
    dontAddCommandList: true,
  },
  async (message, match, ctx) => {
    try {
      const [date, time] = getDate();
      const menuMessage = generateMenuMessage(ctx, message, date, time, match);
      await message.send(menuMessage);
    } catch (error) {
      console.error('Error in menu command:', error);
      await message.send('Something went wrong while fetching the menu.');
    }
  }
);
