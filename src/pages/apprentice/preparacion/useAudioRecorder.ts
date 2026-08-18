import { useCallback, useEffect, useRef, useState } from 'react';

export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'paused' | 'stopped' | 'error';

/**
 * Tope de una grabación cuando quien la usa no dice otra cosa.
 *
 * Es un límite de costo tanto como de forma: Gemini cobra el audio por
 * duración, así que cada segundo grabado se paga. "Práctica de entrevista"
 * pide un tope más corto — ver `ENTREVISTA_MAX_ANSWER_SECONDS`.
 */
const DEFAULT_MAX_RECORDING_SECONDS = 180;

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
  /** El tope vigente, para poder mostrarlo sin duplicar el número en la vista. */
  maxSeconds: number;
  /** Segundos transcurridos de grabación activa — no cuenta el tiempo en pausa. */
  seconds: number;
  audioBlob: Blob | null;
  /** Para reproducir lo grabado antes de mandarlo — `URL.createObjectURL` del blob. */
  audioUrl: string | null;
  errorMessage: string | null;
  start: () => void;
  /** Pausa la captura sin terminar la grabación — se puede seguir con `resume()`. */
  pause: () => void;
  /** Retoma una grabación en pausa, agregando a la misma toma. */
  resume: () => void;
  /** Termina la grabación. No la manda — solo la deja lista para escuchar. */
  stop: () => void;
  /** Descarta la grabación actual y vuelve a `idle`, para grabar de nuevo. */
  reset: () => void;
}

export interface AudioRecorderOptions {
  /** Cuánto puede durar la grabación antes de cortarse sola. */
  maxSeconds?: number;
}

export function useAudioRecorder(options: AudioRecorderOptions = {}): UseAudioRecorder {
  const maxSeconds = options.maxSeconds ?? DEFAULT_MAX_RECORDING_SECONDS;
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [seconds, setSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
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

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setSeconds(elapsedRef.current);
      if (elapsedRef.current >= maxSeconds) recorderRef.current?.stop();
    }, 1000);
  }, [clearTimer, maxSeconds]);

  const setAudioUrlTracked = useCallback((url: string | null) => {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = url;
    setAudioUrl(url);
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      releaseStream();
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, [clearTimer, releaseStream]);

  const start = useCallback(async () => {
    setErrorMessage(null);
    setAudioBlob(null);
    setAudioUrlTracked(null);
    elapsedRef.current = 0;
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
      startTimer();
    } catch {
      setStatus('error');
      setErrorMessage(
        'No pudimos acceder al micrófono. Revisá los permisos del navegador e intentá de nuevo.',
      );
      releaseStream();
    }
  }, [clearTimer, releaseStream, setAudioUrlTracked, startTimer]);

  const pause = useCallback(() => {
    if (recorderRef.current?.state !== 'recording') return;
    recorderRef.current.pause();
    clearTimer();
    setStatus('paused');
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (recorderRef.current?.state !== 'paused') return;
    recorderRef.current.resume();
    startTimer();
    setStatus('recording');
  }, [startTimer]);

  const stop = useCallback(() => {
    const state = recorderRef.current?.state;
    if (state === 'recording' || state === 'paused') recorderRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    releaseStream();
    setAudioUrlTracked(null);
    chunksRef.current = [];
    recorderRef.current = null;
    elapsedRef.current = 0;
    setAudioBlob(null);
    setSeconds(0);
    setErrorMessage(null);
    setStatus('idle');
  }, [clearTimer, releaseStream, setAudioUrlTracked]);

  return { status, maxSeconds, seconds, audioBlob, audioUrl, errorMessage, start, pause, resume, stop, reset };
}
