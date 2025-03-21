const { bot, yts, song, video, addAudioMetaData, generateList, lang } = require('../lib/');

// YouTube Video ID regex to extract video IDs
const ytIdRegex =
  /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:watch\?.*(?:|\&)v=|embed|shorts\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/;

// YouTube Search Bot Command
bot(
  {
    pattern: 'yts ?(.*)', // Search command pattern
    desc: lang.plugins.yts.desc, // Description for the plugin
    type: 'search', // Search type command
  },
  async (message, match) => {
    try {
      if (!match) return await message.send(lang.plugins.yts.usage);

      const vid = ytIdRegex.exec(match);
      if (vid) {
        const result = await yts(vid[1], true);
        const { title, description, duration, view, published } = result[0];
        return await message.send(
          `*Title:* ${title}\n*Time:* ${duration}\n*Views:* ${view}\n*Publish:* ${published}\n*Desc:* ${description}`
        );
      }

      // Search YouTube
      const result = await yts(match);
      const msg = result
        .map(
          ({ title, id, view, duration, published, author }) =>
            `• *${title.trim()}*\n*Views:* ${view}\n*Time:* ${duration}\n*Author:* ${author}\n*Published:* ${published}\n*Url:* https://www.youtube.com/watch?v=${id}\n\n`
        )
        .join('');

      return await message.send(msg.trim());
    } catch (error) {
      console.error('Error in yts search:', error);
      return await message.send(lang.plugins.general.error_message);
    }
  }
);

// Song Download Bot Command
bot(
  {
    pattern: 'song ?(.*)', // Command pattern for song download
    desc: lang.plugins.song.desc, // Description for the song download plugin
    type: 'download', // Download type command
  },
  async (message, match) => {
    try {
      match = match || message.reply_message.text;
      if (!match) return await message.send(lang.plugins.song.usage);

      const vid = ytIdRegex.exec(match);
      if (vid) {
        const _song = await song(vid[1]);
        if (!_song) return await message.send(lang.plugins.song.not_found);

        const [result] = await yts(vid[1], true);
        const { author, title, thumbnail } = result;
        const meta = title ? await addAudioMetaData(_song, title, author, '', thumbnail.url) : _song;

        return await message.send(
          meta,
          { quoted: message.data, mimetype: 'audio/mpeg', fileName: `${title}.mp3` },
          'audio'
        );
      }

      const result = await yts(match, 0, 1);
      if (!result.length) return await message.send(`_No results found for_ *${match}*`);

      const msg = generateList(
        result.map(({ title, id, duration, author, album }) => ({
          _id: `🆔&id\n`,
          text: `🎵${title}\n🕒${duration}\n👤${author}\n📀${album}\n\n`,
          id: `song https://www.youtube.com/watch?v=${id}`,
        })),
        `Searched for ${match} and found ${result.length} results. Send 🆔 to download the song.`,
        message.jid,
        message.participant,
        message.id
      );
      return await message.send(msg.message, { quoted: message.data }, msg.type);
    } catch (error) {
      console.error('Error in song download:', error);
      return await message.send(lang.plugins.general.error_message);
    }
  }
);

// Video Download Bot Command
bot(
  {
    pattern: 'video ?(.*)', // Command pattern for video download
    desc: lang.plugins.video.desc, // Description for the video download plugin
    type: 'download', // Download type command
  },
  async (message, match) => {
    try {
      match = match || message.reply_message.text;
      if (!match) return await message.send(lang.plugins.video.usage);

      const vid = ytIdRegex.exec(match);
      if (vid) {
        const videoFile = await video(vid[1]);
        return await message.send(
          videoFile,
          { quoted: message.data, fileName: `${vid[1]}.mp4` },
          'video'
        );
      }

      const result = await yts(match);
      if (!result.length) return await message.send(lang.plugins.video.not_found);

      const msg = generateList(
        result.map(({ title, id, duration, view }) => ({
          text: `${title}\nDuration: ${duration}\nViews: ${view}\n`,
          id: `video https://www.youtube.com/watch?v=${id}`,
        })),
        `Searched for ${match}\nFound ${result.length} results`,
        message.jid,
        message.participant,
        message.id
      );
      return await message.send(msg.message, { quoted: message.data }, msg.type);
    } catch (error) {
      console.error('Error in video download:', error);
      return await message.send(lang.plugins.general.error_message);
    }
  }
);
