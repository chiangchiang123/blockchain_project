export type PageName = "login" | "signup" | "home" | "player";

export type User = {
  name: string;
  email: string;
};

export type Song = {
  title: string;
  artist: string;
  album: string;
  cover: string;
  previewUrl: string;
  spotifyUrl: string;
};

export type MoodRecord = {
  id: string;
  encryptedMood: string;
  salt: string;
  song: Song;
  createdAt: string;
};