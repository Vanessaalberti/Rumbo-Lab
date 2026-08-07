import { useEffect, useState } from 'react';

/**
 * ¿El dispositivo tiene un puntero preciso (mouse, trackpad, lápiz)?
 *
 * Las interacciones de arrastre libre se reservan a punteros finos: en una
 * pantalla táctil competirían con el gesto de scroll y dejarían la página
 * atrapada bajo el dedo.
 */
export function useFinePointer(): boolean {
  const [isFine, setIsFine] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(pointer: fine)');
    const update = () => setIsFine(media.matches);

    update();
    media.addEventListener('change', update);

    return () => media.removeEventListener('change', update);
  }, []);

  return isFine;
}
