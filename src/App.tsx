/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import ScratchWorkspace from './components/ScratchWorkspace';
import AppIntro from './components/AppIntro';
import firstImpressionAudio from './first-impression.mp3';

export default function App() {
  const [introFinished, setIntroFinished] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // initialize audio to load it
    audioRef.current = new Audio(firstImpressionAudio);
    audioRef.current.loop = true;
    audioRef.current.volume = 0; // Start at 0 for fade in
    
    // Cleanup if component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (introFinished && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio play failed, user may need to interact with the page first", e));
      
      // Fade in over 3 seconds
      const fadeDuration = 3000;
      const targetVolume = 0.5; // Set volume limit
      const steps = 30;
      const stepTime = fadeDuration / steps;
      const volumeStep = targetVolume / steps;
      
      let currentStep = 0;
      const fadeInterval = setInterval(() => {
        currentStep++;
        if (audioRef.current) {
          if (currentStep >= steps) {
            audioRef.current.volume = targetVolume;
            clearInterval(fadeInterval);
          } else {
            audioRef.current.volume = currentStep * volumeStep;
          }
        } else {
          clearInterval(fadeInterval);
        }
      }, stepTime);
    }
  }, [introFinished]);

  return (
    <>
      {!introFinished && <AppIntro onComplete={() => setIntroFinished(true)} />}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${introFinished ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <ScratchWorkspace />
      </div>
    </>
  );
}
