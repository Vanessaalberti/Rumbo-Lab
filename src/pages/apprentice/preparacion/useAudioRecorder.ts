import { useCallback, useEffect, useRef, useState } from 'react';

export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'stopped' | 'error';

/**
 * Corte de seguridad: nadie necesita grabar una respuesta de entrevista de
 * más de 3 minutos, y esto acota cuánto pesa lo que se sube y cuánto puede
 * llegar a costar cada análisis, sin depender de que la persona se acuerde de
 * frenar.
 */
const MAX_RECORDING_SECONDS = 180;

/**
 * En orden de preferencia. El navegador graba en el primero que soporte —
 * no hay forma de grabar directo a WAV o MP3 sin una librería de encoding
 * aparte, así que esto se apoya en lo que ya sabe hacer cada navegador.
 */
const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
];

function pickSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  return PREFERRED_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
}

export interface UseAudioRecorder {
  status: RecorderStatus;
  /** Segundos transcurridos de la grabación actual. */
  seconds: number;
  audioBlob: Blob | null;
  /** Para reproducir lo grabado antes de mandarlo — `URL.createObjectURL` del blob. */
  audioUrl: string | null;
  errorMessage: string | null;
  start: () => void;
  stop: () => void;
  /** Descarta la grabación actual y vuelve a `idle`, para grabar de nuevo. */
  reset: () => void;
}

/**
 * Graba audio del micrófono con `MediaRecorder`.
 *
 * Todo lo que produce vive en memoria del navegador (el `Blob`, nunca un
 * archivo en disco) hasta que quien use el hook decide mandarlo — y una vez
 * mandado, tampoco queda nada acá: `reset()` lo descarta.
 */
export function useAudioRecorder(): UseAudioRecorder {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [seconds, setSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setAudioUrlTracked = useCallback((url: string | null) => {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = url;
    setAudioUrl(url);
  }, []);

  /* Si la persona navega afuera a mitad de una grabación, el micrófono no
     puede seguir "prendido": se libera el stream y se corta el timer. */
  useEffect(() => {
    return () => {
      clearTimer();
      releaseStream();
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, [clearTimer, releaseStream]);

  const start = useCallback(async () => {
    setErrorMessage(null);
    setAudioBlob(null);
    setAudioUrlTracked(null);
    setSeconds(0);
    setStatus('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrlTracked(URL.createObjectURL(blob));
        setStatus('stopped');
        clearTimer();
        releaseStream();
      };

      recorderRef.current = recorder;
      recorder.start();
      setStatus('recording');

      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed += 1;
        setSeconds(elapsed);
        if (elapsed >= MAX_RECORDING_SECONDS) recorder.stop();
      }, 1000);
    } catch {
      setStatus('error');
      setErrorMessage(
        'No pudimos acceder al micrófono. Revisá los permisos del navegador e intentá de nuevo.',
      );
      releaseStream();
    }
  }, [clearTimer, releaseStream, setAudioUrlTracked]);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    releaseStream();
    setAudioUrlTracked(null);
    chunksRef.current = [];
    recorderRef.current = null;
    setAudioBlob(null);
    setSeconds(0);
    setErrorMessage(null);
    setStatus('idle');
  }, [clearTimer, releaseStream, setAudioUrlTracked]);

  return { status, seconds, audioBlob, audioUrl, errorMessage, start, stop, reset };
}
