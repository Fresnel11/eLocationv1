import React, { useEffect, useRef, useState } from 'react';
import { Player } from '@lordicon/react';

/**
 * Isolé dans son propre fichier pour être chargé dynamiquement par
 * AnimatedIcon : @lordicon/react entraîne lottie-web (~590 ko), qui ne doit
 * peser sur le bundle principal que si une icône animée est réellement fournie.
 */

interface LordiconPlayerProps {
  icon: Record<string, unknown>;
  size: number;
  loop: boolean;
  hoverOnly: boolean;
  playKey?: string | number;
}

const LordiconPlayer: React.FC<LordiconPlayerProps> = ({ icon, size, loop, hoverOnly, playKey }) => {
  const playerRef = useRef<Player>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (loop || playKey !== undefined) playerRef.current?.playFromBeginning();
  }, [ready, loop, playKey]);

  return (
    <span
      style={{ display: 'inline-flex', width: size, height: size }}
      onMouseEnter={hoverOnly ? () => playerRef.current?.playFromBeginning() : undefined}
    >
      {/* Le lecteur web importe lottie-web lui-même (dépendance de pair). */}
      <Player
        ref={playerRef}
        icon={icon}
        size={size}
        onReady={() => setReady(true)}
        onComplete={loop ? () => playerRef.current?.playFromBeginning() : undefined}
      />
    </span>
  );
};

export default LordiconPlayer;
