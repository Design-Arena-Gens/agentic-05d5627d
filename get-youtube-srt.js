const https = require('https');

const videoUrl = 'https://youtu.be/feo87BaXlbg';
const videoId = videoUrl.split('/').pop().split('?')[0];

// Fetch video page to get caption tracks
https.get(`https://www.youtube.com/watch?v=${videoId}`, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    // Extract caption tracks from page data
    const captionMatch = data.match(/"captionTracks":(\[.*?\])/);

    if (!captionMatch) {
      console.log('No captions found for this video');
      return;
    }

    try {
      const tracks = JSON.parse(captionMatch[1]);

      if (tracks.length === 0) {
        console.log('No caption tracks available');
        return;
      }

      // Get the first available track (usually auto-generated or English)
      const firstTrack = tracks[0];
      const captionUrl = firstTrack.baseUrl;
      const lang = firstTrack.languageCode || firstTrack.name?.simpleText || 'unknown';

      console.log(`\nFound captions in language: ${lang}`);
      console.log(`\nCurl command to get SRT:\n`);
      console.log(`curl "${captionUrl}&fmt=srv3" -o subtitles.srt`);
      console.log(`\nOr for JSON format:`);
      console.log(`curl "${captionUrl}&fmt=json3" -o subtitles.json`);

    } catch (e) {
      console.error('Error parsing caption data:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('Error fetching video page:', err.message);
});
