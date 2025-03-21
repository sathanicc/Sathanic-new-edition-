const { bot, getFake, antiList, enableAntiFake, lang } = require('../lib/');

// Main bot command for antifake
bot(
  {
    pattern: 'antifake ?(.*)', // Command pattern
    desc: lang.plugins.antifake.desc, // Command description from language files
    type: 'group', // Command is group-specific
    onlyGroup: true, // Enforcing group-only usage
  },
  async (message, match) => {
    try {
      // If no match is provided, show the current antifake status
      if (!match) {
        const fake = await getFake(message.jid, message.id);
        const status = fake?.enabled ? 'on' : 'off'; // Use optional chaining for safety
        return message.send(lang.plugins.antifake.example.format(status));
      }

      // Handle 'list' command: Show a list of all fake codes
      if (match === 'list') {
        const codes = await antiList(message.jid, 'fake', message.id);
        if (!codes.length) {
          return message.send(lang.plugins.antifake.not);
        }
        return message.send(`\`\`\`${codes.map((code, i) => `${i + 1}. ${code}`).join('\n')}\`\`\``);
      }

      // Toggle antifake status (on/off)
      if (match === 'on' || match === 'off') {
        await enableAntiFake(message.jid, match, message.id);
        return message.send(
          lang.plugins.antifake.status.format(match === 'on' ? 'enabled' : 'disabled')
        );
      }

      // Update antifake settings (allow/disallow specific codes or behavior)
      const res = await enableAntiFake(message.jid, match, message.id);
      return message.send(
        lang.plugins.antifake.update.format(
          res.allow.length ? res.allow.join(', ') : 'None',
          res.notallow.length ? res.notallow.join(', ') : 'None'
        )
      );
    } catch (error) {
      console.error('Error in antifake command:', error);
      return message.send(lang.plugins.general.error_message); // Show a generic error message
    }
  }
);
