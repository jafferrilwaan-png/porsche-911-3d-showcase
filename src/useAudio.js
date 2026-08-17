import { useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'

const AUDIO_SRC = '/audio/ambient.mp3'

export function useAudio() {
  const howlRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    howlRef.current = new Howl({
      src: [AUDIO_SRC],
      loop: true,
      volume: 0,
      html5: true,
      onload: () => setLoaded(true),
      onloaderror: (id, err) => console.warn('Audio load error:', err),
    })
    return () => {
      howlRef.current?.unload()
    }
  }, [])

  const toggle = () => {
    const howl = howlRef.current
    if (!howl || !loaded) return

    if (playing) {
      howl.fade(0.45, 0, 800)
      setTimeout(() => howl.pause(), 800)
      setPlaying(false)
    } else {
      howl.play()
      howl.fade(0, 0.45, 1200)
      setPlaying(true)
    }
  }

  return { playing, toggle, loaded }
}
