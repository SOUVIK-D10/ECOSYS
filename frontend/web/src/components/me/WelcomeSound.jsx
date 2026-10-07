import React, { useEffect, useRef } from 'react';
import initVoice from '../../assets/audio/voices/init_voice.mp3';

export default function WelcomeSound() {
    const welcomeAudioRef = useRef(new Audio(initVoice));
    
      useEffect(() => {
        const hasPlayedWelcome = sessionStorage.getItem('hasPlayedWelcome');
    
        if (!hasPlayedWelcome) {
          const playAudio = () => {
            welcomeAudioRef.current
              .play()
              .then(() => {
                sessionStorage.setItem('hasPlayedWelcome', 'true');
              })
              .catch((error) => {
                console.log("Autoplay blocked. Waiting for user interaction...", error);
                
                const playOnInteraction = () => {
                  welcomeAudioRef.current.play();
                  sessionStorage.setItem('hasPlayedWelcome', 'true');
                  window.removeEventListener('click', playOnInteraction);
                };
    
                window.addEventListener('click', playOnInteraction);
              });
          };
    
          playAudio();
        }
      }, []);
    
  return (
    <></>
  )
}
