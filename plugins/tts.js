const { bot, tts, supportedLanguages } = require('../lib/')

// Feature 1: List Supported Languages
bot(
  {
    pattern: 'tts languages',
    desc: 'List all supported TTS languages',
    type: 'misc',
  },
  async (message) => {
    const languages = supportedLanguages.join('\n')  // List of supported languages
    return await message.send(`*Supported TTS Languages:*\n${languages}`)
  }
)

// Feature 2: Main tts Command with Speed, Gender, and Pitch Control
bot(
  {
    pattern: 'tts ?(.*)',
    desc: 'Text to speech with language, speed, gender, and pitch options',
    type: 'misc',
  },
  async (message, match, ctx) => {
    match = match || message.reply_message.text
    if (!match) {
      return await message.send('*Example: tts Hello*\n*Example: tts Hello {en}*\n*Example: tts Hello [slow]*')
    }

    // Default language, speed, gender, and pitch
    let LANG = ctx.LANG
    let speed = 'normal'
    let gender = 'female'  // Default gender
    let pitch = 'medium'  // Default pitch

    // Check if language is provided
    const lang = match.match('\\{([a-z]{2})\\}')
    if (lang) {
      LANG = lang[1]
      match = match.replace(lang[0], '').trim()
    }

    // Check for speed option (slow, normal, fast)
    const speedMatch = match.match('\(slow|normal|fast)\')
    if (speedMatch) {
      speed = speedMatch[1]
      match = match.replace(speedMatch[0], '').trim()
    }

    // Check for gender option (male, female)
    const genderMatch = match.match('\(male|female)\')
    if (genderMatch) {
      gender = genderMatch[1]
      match = match.replace(genderMatch[0], '').trim()
    }

    // Check for pitch option (low, medium, high)
    const pitchMatch = match.match('\(low|medium|high)\')
    if (pitchMatch) {
      pitch = pitchMatch[1]
      match = match.replace(pitchMatch[0], '').trim()
    }

    // Send error message if no text is provided
    if (!match) {
      return await message.send('Please provide text to convert to speech.')
    }

    try {
      // Get TTS audio with selected options
      const audio = await tts(LANG, match, speed, gender, pitch)

      // Send audio with voice parameters
      return await message.send(
        audio,
        { ptt: true, mimetype: 'audio/ogg; codecs=opus' },
        'audio'
      )
    } catch (error) {
      console.error('Error in TTS:', error)
      return await message.send('Sorry, an error occurred while converting text to speech.')
    }
  }
)

// Feature 3: Queue System for Multiple TTS Requests
let ttsQueue = []

bot(
  {
    pattern: 'tts queue ?(.*)',
    desc: 'Queue TTS requests',
    type: 'misc',
  },
  async (message, match) => {
    if (!match) return await message.send('*Example: tts queue Hello*')

    // Add the message to the queue
    ttsQueue.push({ message, match })

    // If this is the first item in the queue, start processing
    if (ttsQueue.length === 1) {
      await processQueue()
    }

    return await message.send('Your TTS request has been queued.')
  }
)

// Function to process TTS queue
async function processQueue() {
  if (ttsQueue.length === 0) return

  const { message, match } = ttsQueue[0]

  try {
    // Default language and settings for queued request
    const LANG = 'en'
    const audio = await tts(LANG, match)

    // Send audio for queued request
    await message.send(audio, { ptt: true, mimetype: 'audio/ogg; codecs=opus' }, 'audio')

    // Remove processed item from queue
    ttsQueue.shift()

    // Process the next item in the queue
    await processQueue()
  } catch (error) {
    console.error('Error processing TTS queue:', error)
    ttsQueue.shift()
    await processQueue()
  }
}
