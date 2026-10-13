Episode scores are composed in code: scripts/music_synth.py (npm run music -- <id>) writes <epNN>-score.wav here.
You may also drop licensed tracks here yourself (licensing is your call; agents never download music).
The sound-designer agent picks one per episode and sets `music: {src: 'music/<file>', level: 0.16}`
in src/episodes/<id>/index.tsx. It is ducked under the voiceover automatically.
Name files descriptively: calm-lofi-90bpm.mp3, tense-pulse-120bpm.mp3 ...
