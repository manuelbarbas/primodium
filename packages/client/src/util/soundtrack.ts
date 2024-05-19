type Song = {
  title: string;
  artist: string;
  url: string;
};

export const playlist: Song[] = [
  {
    title: "Far Away",
    artist: "DOS-88",
    url: `https://primodium-assets.s3.us-west-2.amazonaws.com/music/DOS-88+Far+away.mp3`,
  },
  {
    title: "When the Sunrise",
    artist: "Yehezkel Raz",
    url: `https://primodium-assets.s3.us-west-2.amazonaws.com/music/When+the+Sunrise+Instrumental.mp3`,
  },
  {
    title: "Decision Making",
    artist: "Itai Argaman",
    url: `https://primodium-assets.s3.us-west-2.amazonaws.com/music/Itai+Argaman+Decision+Making.mp3`,
  },
];

export const getRandomSong = () => {
  return playlist[Math.floor(Math.random() * playlist.length)];
};

export const getNextSong = (currentSong: Song) => {
  const index = playlist.indexOf(currentSong);
  if (index === playlist.length - 1) {
    return playlist[0];
  }
  return playlist[index + 1];
};

export const getPrevSong = (currentSong: Song) => {
  const index = playlist.indexOf(currentSong);
  if (index === 0) {
    return playlist[playlist.length - 1];
  }
  return playlist[index - 1];
};
