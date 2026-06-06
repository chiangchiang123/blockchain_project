import type { Song } from "../types";

export const SONGS: Song[] = [
  {
    title: "如果可以",
    artist: "韋禮安",
    album: "月老",
    cover: "https://i.scdn.co/image/ab67616d00001e02e7e0b58b56d99f8f704c6760",
    previewUrl: "https://p.scdn.co/mp3-preview/417e0512d405da1041dae39c62448a76d9b736dd",   // TODO: 從 Spotify API Console 取得
    spotifyUrl: "https://open.spotify.com/track/72OVnXDzugvrCU25lMi9au",   // TODO: https://open.spotify.com/track/{id}
  },
  {
    title: "Soft Morning Light",
    artist: "Luna Field",
    album: "Quiet Hours",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
    previewUrl: "",   // TODO: 從 Spotify API Console 取得
    spotifyUrl: "",   // TODO: https://open.spotify.com/track/{id}
  },
  {
    title: "Run Through the City",
    artist: "Neon Atlas",
    album: "Late Night Motion",
    cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81",
    previewUrl: "",
    spotifyUrl: "",
  },
  {
    title: "Blue Window",
    artist: "Mira Vale",
    album: "Rain Letters",
    cover: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    previewUrl: "",
    spotifyUrl: "",
  },
];
