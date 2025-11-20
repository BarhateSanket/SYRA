class CommandParser {
  constructor() {
    // App mappings for different platforms
    this.appMappings = {
      // Video platforms
      youtube: ['youtube', 'yt', 'you tube'],
      netflix: ['netflix', 'net flix'],
      hulu: ['hulu'],
      disney: ['disney', 'disney plus', 'disney+'],
      prime: ['prime', 'amazon prime', 'prime video'],
      hbo: ['hbo', 'hbo max', 'hbomax'],

      // Music platforms
      spotify: ['spotify', 'spot ify'],
      applemusic: ['apple music', 'applemusic', 'itunes'],
      soundcloud: ['soundcloud', 'sound cloud'],
      pandora: ['pandora'],
      deezer: ['deezer'],

      // Social media
      instagram: ['instagram', 'insta', 'ig'],
      facebook: ['facebook', 'fb'],
      twitter: ['twitter', 'x'],
      linkedin: ['linkedin', 'linked in'],
      tiktok: ['tiktok', 'tik tok'],

      // Productivity
      gmail: ['gmail', 'email', 'mail'],
      calendar: ['calendar', 'google calendar'],
      drive: ['drive', 'google drive'],
      docs: ['docs', 'google docs'],
      sheets: ['sheets', 'google sheets'],
      github: ['github', 'git hub'],

      // Search engines
      google: ['google', 'search'],
      bing: ['bing'],
      duckduckgo: ['duckduckgo', 'duck duck go'],

      // Other apps
      calculator: ['calculator', 'calc'],
      maps: ['maps', 'google maps'],
      weather: ['weather'],
      news: ['news', 'google news'],
      photos: ['photos', 'google photos'],
      translate: ['translate', 'google translate'],
      classroom: ['classroom', 'google classroom'],
      meet: ['meet', 'google meet'],
      whatsapp: ['whatsapp', 'whats app']
    };

    // Action keywords
    this.actionKeywords = {
      search: ['search', 'find', 'look for', 'show me'],
      play: ['play', 'start', 'watch', 'listen to'],
      open: ['open', 'launch', 'go to', 'visit'],
      show: ['show', 'display', 'view'],
      define: ['define', 'what does', 'what is', 'meaning of', 'definition of'],
      spellcheck: ['spell check', 'spellcheck', 'check spelling', 'spell'],
      download: ['download', 'save', 'get'],
      schedule: ['schedule', 'add event', 'create event', 'book', 'set up'],
      view: ['what\'s on', 'show me', 'list', 'view', 'see'],
      remind: ['remind me', 'reminder', 'notify me', 'alert me']
    };

    // Build reverse mapping for quick lookup
    this.reverseAppMappings = {};
    Object.entries(this.appMappings).forEach(([app, aliases]) => {
      aliases.forEach(alias => {
        this.reverseAppMappings[alias.toLowerCase()] = app;
      });
    });
  }

  // Parse complex commands like "open youtube and search for demon slayer and play the movie"
  parseCommand(command) {
    const lowerCommand = command.toLowerCase().trim();

    // Check for calendar commands first
    const calendarCommand = this.parseCalendarCommand(lowerCommand);
    if (calendarCommand) return calendarCommand;

    // Check for complex patterns
    const complexPatterns = [
      // Pattern: "open [app] and [action] [query]"
      /(?:open|launch|go to)\s+(\w+(?:\s+\w+)*?)\s+and\s+(search|find|look for|play|start|watch|listen to|show)\s+(?:for\s+)?(.+)/i,

      // Pattern: "[action] [query] on [app]"
      /(search|find|look for|play|start|watch|listen to|show)\s+(.+?)\s+on\s+(\w+(?:\s+\w+)*)/i,

      // Pattern: "[app] [action] [query]"
      /(\w+(?:\s+\w+)*?)\s+(search|find|look for|play|start|watch|listen to|show)\s+(.+)/i
    ];

    for (const pattern of complexPatterns) {
      const match = lowerCommand.match(pattern);
      if (match) {
        const parsed = this.parseComplexCommand(match, pattern);
        if (parsed) return parsed;
      }
    }

    // Fallback to simple command parsing
    return this.parseSimpleCommand(lowerCommand);
  }

  parseComplexCommand(match, pattern) {
    let app, action, query;

    if (pattern.source.includes('open.*and')) {
      // Pattern: "open [app] and [action] [query]"
      [, app, action, query] = match;
    } else if (pattern.source.includes('on\\s+')) {
      // Pattern: "[action] [query] on [app]"
      [, action, query, app] = match;
    } else {
      // Pattern: "[app] [action] [query]"
      [, app, action, query] = match;
    }

    // Clean up the parsed values
    app = app?.trim();
    action = action?.trim();
    query = query?.trim();

    if (!app || !action || !query) return null;

    // Map app to canonical name
    const canonicalApp = this.reverseAppMappings[app.toLowerCase()] || app.toLowerCase();

    return {
      type: 'complex',
      app: canonicalApp,
      action: action.toLowerCase(),
      query: query,
      originalCommand: match[0]
    };
  }

  parseSimpleCommand(command) {
    // Check for simple "open [app]" commands
    for (const [app, aliases] of Object.entries(this.appMappings)) {
      for (const alias of aliases) {
        if (command.includes(alias)) {
          return {
            type: 'simple',
            app: app,
            action: 'open',
            query: null,
            originalCommand: command
          };
        }
      }
    }

    // Check for action-based commands without explicit app
    for (const [action, keywords] of Object.entries(this.actionKeywords)) {
      for (const keyword of keywords) {
        if (command.includes(keyword)) {
          const query = this.extractQuery(command, keyword);
          // For dictionary actions, set app to 'dictionary'
          const app = (action === 'define' || action === 'spellcheck') ? 'dictionary' : null;
          return {
            type: 'action',
            app: app,
            action: action,
            query: query,
            originalCommand: command
          };
        }
      }
    }

    return {
      type: 'unknown',
      app: null,
      action: null,
      query: command,
      originalCommand: command
    };
  }

  parseCalendarCommand(command) {
    // Calendar-specific patterns
    const calendarPatterns = [
      // "schedule [event] at [time/date]"
      /schedule\s+(.+?)\s+at\s+(.+)/i,
      // "add event to calendar [details]"
      /add\s+event\s+to\s+calendar\s+(.+)/i,
      // "what's on my calendar [today/tomorrow/this week]"
      /(?:what's|what is)\s+on\s+my\s+calendar\s*(.+)?/i,
      // "remind me about [event]"
      /remind\s+me\s+about\s+(.+)/i,
      // "show me my calendar [period]"
      /show\s+me\s+my\s+calendar\s*(.+)?/i,
      // "list my events [period]"
      /list\s+my\s+events\s*(.+)?/i
    ];

    for (const pattern of calendarPatterns) {
      const match = command.match(pattern);
      if (match) {
        return this.parseCalendarMatch(match, pattern);
      }
    }

    return null;
  }

  parseCalendarMatch(match, pattern) {
    if (pattern.source.includes('schedule.*at')) {
      // Schedule event
      const [, event, time] = match;
      return {
        type: 'calendar',
        action: 'schedule',
        event: event.trim(),
        time: time.trim(),
        originalCommand: match[0]
      };
    } else if (pattern.source.includes('add event to calendar')) {
      // Add event
      const [, details] = match;
      return {
        type: 'calendar',
        action: 'add',
        details: details.trim(),
        originalCommand: match[0]
      };
    } else if (pattern.source.includes('what\'s.*calendar') || pattern.source.includes('show me my calendar') || pattern.source.includes('list my events')) {
      // View calendar
      const [, period] = match;
      return {
        type: 'calendar',
        action: 'view',
        period: period ? period.trim() : 'today',
        originalCommand: match[0]
      };
    } else if (pattern.source.includes('remind me about')) {
      // Set reminder
      const [, event] = match;
      return {
        type: 'calendar',
        action: 'remind',
        event: event.trim(),
        originalCommand: match[0]
      };
    }

    return null;
  }

  extractQuery(command, keyword) {
    const index = command.indexOf(keyword);
    if (index !== -1) {
      return command.substring(index + keyword.length).trim();
    }
    return command;
  }

  // Get app URL for opening
  getAppUrl(app, query = null, action = 'open') {
    const urls = {
      youtube: query ? `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` : 'https://www.youtube.com',
      netflix: 'https://www.netflix.com',
      hulu: 'https://www.hulu.com',
      disney: 'https://www.disneyplus.com',
      prime: 'https://www.primevideo.com',
      hbo: 'https://www.hbomax.com',
      spotify: query ? `https://open.spotify.com/search/${encodeURIComponent(query)}` : 'https://open.spotify.com',
      applemusic: 'https://music.apple.com',
      soundcloud: query ? `https://soundcloud.com/search?q=${encodeURIComponent(query)}` : 'https://soundcloud.com',
      pandora: 'https://www.pandora.com',
      deezer: 'https://www.deezer.com',
      instagram: 'https://www.instagram.com',
      facebook: 'https://www.facebook.com',
      twitter: 'https://twitter.com',
      linkedin: 'https://www.linkedin.com',
      tiktok: 'https://www.tiktok.com',
      gmail: 'https://mail.google.com',
      calendar: 'https://calendar.google.com',
      drive: 'https://drive.google.com',
      docs: 'https://docs.google.com',
      sheets: 'https://sheets.google.com',
      github: 'https://github.com',
      google: query ? `https://www.google.com/search?q=${encodeURIComponent(query)}` : 'https://www.google.com',
      bing: query ? `https://www.bing.com/search?q=${encodeURIComponent(query)}` : 'https://www.bing.com',
      duckduckgo: query ? `https://duckduckgo.com/?q=${encodeURIComponent(query)}` : 'https://duckduckgo.com',
      calculator: 'https://www.google.com/search?q=calculator',
      maps: query ? `https://maps.google.com/maps?q=${encodeURIComponent(query)}` : 'https://maps.google.com',
      weather: query ? `https://www.google.com/search?q=weather+${encodeURIComponent(query)}` : 'https://www.google.com/search?q=weather',
      news: 'https://news.google.com',
      photos: 'https://photos.google.com',
      translate: 'https://translate.google.com',
      classroom: 'https://classroom.google.com',
      meet: 'https://meet.google.com',
      whatsapp: 'https://web.whatsapp.com'
    };

    return urls[app] || null;
  }

  // Check if app supports direct API integration
  supportsApiIntegration(app) {
    const apiSupportedApps = ['youtube', 'spotify', 'google', 'github', 'weather', 'news', 'stocks', 'dictionary', 'calendar'];
    return apiSupportedApps.includes(app);
  }

  // Get API endpoint for app
  getApiEndpoint(app, action, query) {
    const endpoints = {
      youtube: {
        search: `/api/youtube/search?query=${encodeURIComponent(query)}`,
        play: `/api/youtube/play?query=${encodeURIComponent(query)}`,
        download: `/api/youtube/download/info?url=${encodeURIComponent(query)}`
      },
      spotify: {
        search: `/api/spotify/search?q=${encodeURIComponent(query)}`,
        play: `/api/spotify/play?query=${encodeURIComponent(query)}`
      },
      google: {
        search: `/api/google/search?q=${encodeURIComponent(query)}`
      },
      github: {
        search: `/api/github/search?q=${encodeURIComponent(query)}`
      },
      weather: {
        current: `/api/weather/current?location=${encodeURIComponent(query)}`
      },
      news: {
        get: `/api/news/search?q=${encodeURIComponent(query)}`
      },
      stocks: {
        quote: `/api/stocks/quote?symbol=${encodeURIComponent(query)}`
      },
      dictionary: {
        define: `/api/dictionary/define/${encodeURIComponent(query)}`,
        spellcheck: `/api/dictionary/spell/${encodeURIComponent(query)}`
      },
      calendar: {
        schedule: `/api/google/calendar/events`,
        add: `/api/google/calendar/events`,
        view: `/api/google/calendar/events`,
        remind: `/api/google/calendar/reminder`
      }
    };

    return endpoints[app]?.[action] || null;
  }
}

// Create singleton instance
const commandParser = new CommandParser();

export default commandParser;
