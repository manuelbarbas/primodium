import { Assets, AudioKeys } from "@game/constants";
import { Scene } from "engine/types";
import { useSettingsStore } from "../stores/SettingsStore";

export type Channel = "music" | "sfx" | "ui";

export const createAudioApi = (scene: Scene) => {
  function play(key: AudioKeys, channel: Channel, config?: Phaser.Types.Sound.SoundConfig) {
    const volume = useSettingsStore.getState().volume;

    setVolume(volume[channel] * volume.master, channel);
    scene.audio[channel].playAudioSprite(Assets.AudioAtlas, key, {
      ...config,
    });
  }

  function setVolume(volume: number, channel: Channel | "master" = "master") {
    const { setVolume, volume: _volume } = useSettingsStore.getState();

    setVolume(volume, channel);

    if (channel === "master") {
      scene.audio.music.setVolume(volume * _volume.music);
      scene.audio.sfx.setVolume(volume * _volume.sfx);
      scene.audio.ui.setVolume(volume * _volume.ui);
    } else scene.audio[channel].setVolume(_volume.master * volume);
  }

  function setPauseOnBlur(pause: boolean) {
    scene.audio.music.pauseOnBlur = pause;
    scene.audio.sfx.pauseOnBlur = pause;
    scene.audio.ui.pauseOnBlur = pause;
  }

  return {
    play,
    setVolume,
    setPauseOnBlur,
  };
};
