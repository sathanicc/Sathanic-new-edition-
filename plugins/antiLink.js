const { getAntiLink, bot, setAntiLink, lang } = require('../lib/');

bot(
  {
    pattern: 'antilink ?(.*)', // Command pattern for triggering anti-link features
    desc: lang.plugins.antilink.desc, // Description for the command
    type: 'group', // Command type (group specific)
    onlyGroup: true, // Ensure the command only works in group chats
  },
  async (message, match) => {
    try {
      // Get the current anti-link status for the group
      const antilink = await getAntiLink(message.jid, message.id);
      const status = antilink.enabled ? 'on' : 'off';

      // If no argument is provided, return the current status of anti-link
      if (!match) {
        return message.send(lang.plugins.antilink.example.format(status));
      }

      // If the user wants to toggle anti-link on or off
      if (match === 'on' || match === 'off') {
        if (match === 'off' && !antilink.enabled) {
          return message.send(lang.plugins.antilink.disable);
        }

        // Update anti-link status
        await setAntiLink(message.jid, match === 'on', message.id);
        return message.send(
          lang.plugins.antilink.status.format(match === 'on' ? 'enabled' : 'disabled')
        );
      }

      // If the user wants to view the anti-link information
      if (match === 'info') {
        if (!antilink) {
          return message.send(lang.plugins.antilink.antilink_notset);
        }
        return message.send(
          lang.plugins.antilink.info.format(status, antilink.allowedUrls, antilink.action)
        );
      }

      // If the user wants to set the action for anti-link (warn, kick, or null)
      if (match.startsWith('action/')) {
        const action = match.replace('action/', '');
        if (!['warn', 'kick', 'null'].includes(action)) {
          return message.send(lang.plugins.antilink.action_invalid);
        }

        // Update the action
        await setAntiLink(message.jid, action, message.id);
        return message.send(lang.plugins.antilink.action_update.format(action));
      }

      // Handle URL allow or disallow lists
      const res = await setAntiLink(message.jid, match);
      return message.send(
        lang.plugins.antilink.update.format(
          res.allow.length ? res.allow.join(', ') : '',
          res.notallow.length ? res.notallow.join(', ') : ''
        )
      );
    } catch (error) {
      // Catch any errors that might occur during the process
      console.error('Error in anti-link command:', error);
      return message.send('An error occurred while processing the anti-link command.');
    }
  }
);
