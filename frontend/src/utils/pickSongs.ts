import { SONGS } from "../data/songs";
import type { Song } from "../types";

export function pickSong(): Song {
  return SONGS[Math.floor(Math.random() * SONGS.length)];
}