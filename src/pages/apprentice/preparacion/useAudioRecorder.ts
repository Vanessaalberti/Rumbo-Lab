import { useCallback, useEffect, useRef, useState } from 'react';

export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'paused' | 'stopped' | 'error';

/** Tope por defecto — límite de costo tanto como de forma: cada segundo grabado se transcribe y se analiza. "Entrevista" pide uno más corto. */
const DEFAULT_MAX_RECORDING_SECONDS = 180;

/** Cuántas barras tiene el medidor. Es historia, no el instante — sólo el nivel actual dejaría pasar un corte de un segundo desapercibido. */
const LEVEL_BARS = 32;

/** Cada cuánto se agrega una barra. 70 ms ≈ 14 por segundo: se ve fluido sin
    hacer que React vuelva a dibujar en cada cuadro de animación. */
const LEVEL_STEP_MS = 70;

/**
 * Desde qué nivel se considera que entró voz, y cuánto tiene que sostenerse.
 * El umbral es deliberadamente bajo: no juzga si se habló fuerte, sólo
 * distingue "hay señal" de silencio digital (micrófono desconectado, etc.).
 * Ponerlo más alto marcaría como vacía una grabación de voz baja pero real,
 * un error mucho peor que el contrario.
 */
const VOICE_RMS_THRESHOLD = 0.012;
const VOICE_SUSTAIN_MS = 500;

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

function emptyLevels(): number[] {
  return new Array(LEVEL_BARS).fill(0);
}

export interface UseAudioRecorder {
  status: RecorderStatus;
  /** El tope vigente, para poder mostrarlo sin duplicar el número en la vista. */
  maxSeconds: number;
  /** Segundos transcurridos de grabación activa — no cuenta el tiempo en pausa. */
  seconds: number;
  /**
   * Nivel del micrófono en los últimos segundos, de 0 a 1, del más viejo al más
   * nuevo. Se dibuja como barras para que se vea que la voz está entrando.
   */
  levels: number[];
  /** Si en algún momento entró voz de verdad — evita terminar la práctica y recién ahí descubrir que el micrófono no tomaba nada, con un uso ya gastado. */
  voiceDetected: boolean;
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
  const [levels, setLevels] = useState<number[]>(emptyLevels);
  const [voiceDetected, setVoiceDetected] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  const audioUrlRef = useRef<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const frameRef = useRef<number | null>(null);
  const levelsRef = useRef<number[]>(emptyLevels());
  /* Mientras está en pausa el micrófono sigue abierto: sin esta bandera el
     medidor seguiría moviéndose y diría que se está grabando algo que no. */
  const capturingRef = useRef(false);
  const voiceDetectedRef = useRef(false);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stopMetering = useCallback(() => {
    capturingRef.current = false;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    void audioContextRef.current?.close().catch(() => {
      /* Cerrar un contexto ya cerrado no es un problema que valga reportar. */
    });
    audioContextRef.current = null;
    levelsRef.current = emptyLevels();
    setLevels(levelsRef.current);
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

  /**
   * Lee el micrófono cuadro a cuadro y saca el valor eficaz (RMS) de la onda.
   * El analizador cuelga del mismo `MediaStream` que graba, así que mide
   * exactamente lo que se va a mandar; no se conecta a la salida de audio a
   * propósito, eso armaría un acople.
   */
  const startMetering = useCallback((stream: MediaStream) => {
    const context = new AudioContext();
    audioContextRef.current = context;

    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    context.createMediaStreamSource(stream).connect(analyser);

    const muestras = new Uint8Array(analyser.fftSize);
    let ultimaBarra = 0;
    let ultimoCuadro = performance.now();
    let vozSostenidaMs = 0;

    const leer = () => {
      frameRef.current = requestAnimationFrame(leer);

      const ahora = performance.now();
      const transcurrido = ahora - ultimoCuadro;
      ultimoCuadro = ahora;
      if (!capturingRef.current) return;

      analyser.getByteTimeDomainData(muestras);

      let suma = 0;
      for (let i = 0; i < muestras.length; i += 1) {
        const desvio = (muestras[i] - 128) / 128;
        suma += desvio * desvio;
      }
      const rms = Math.sqrt(suma / muestras.length);

      if (rms >= VOICE_RMS_THRESHOLD) {
        vozSostenidaMs += transcurrido;
        if (vozSostenidaMs >= VOICE_SUSTAIN_MS && !voiceDetectedRef.current) {
          voiceDetectedRef.current = true;
          setVoiceDetected(true);
        }
      }

      if (ahora - ultimaBarra >= LEVEL_STEP_MS) {
        ultimaBarra = ahora;
        /* La raíz cuadrada abre la parte baja de la escala: sin ella una voz
           normal apenas movería las barras y el medidor no serviría para nada. */
        const nivel = Math.min(1, Math.sqrt(rms) * 2.2);
        levelsRef.current = [...levelsRef.current.slice(1), nivel];
        setLevels(levelsRef.current);
      }
    };

    capturingRef.current = true;
    frameRef.current = requestAnimationFrame(leer);
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      stopMetering();
      releaseStream();
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, [clearTimer, releaseStream, stopMetering]);

  const start = useCallback(async () => {
    setErrorMessage(null);
    setAudioBlob(null);
    setAudioUrlTracked(null);
    elapsedRef.current = 0;
    setSeconds(0);
    voiceDetectedRef.current = false;
    setVoiceDetected(false);
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
        stopMetering();
        releaseStream();
      };

      recorderRef.current = recorder;
      recorder.start();
      setStatus('recording');
      startTimer();
      startMetering(stream);
    } catch {
      setStatus('error');
      setErrorMessage(
        'No pudimos acceder al micrófono. Revisá los permisos del navegador e intentá de nuevo.',
      );
      stopMetering();
      releaseStream();
    }
  }, [clearTimer, releaseStream, setAudioUrlTracked, startMetering, startTimer, stopMetering]);

  const pause = useCallback(() => {
    if (recorderRef.current?.state !== 'recording') return;
    recorderRef.current.pause();
    capturingRef.current = false;
    clearTimer();
    setStatus('paused');
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (recorderRef.current?.state !== 'paused') return;
    recorderRef.current.resume();
    capturingRef.current = true;
    startTimer();
    setStatus('recording');
  }, [startTimer]);

  const stop = useCallback(() => {
    const state = recorderRef.current?.state;
    if (state === 'recording' || state === 'paused') recorderRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    stopMetering();
    releaseStream();
    setAudioUrlTracked(null);
    chunksRef.current = [];
    recorderRef.current = null;
    elapsedRef.current = 0;
    voiceDetectedRef.current = false;
    setVoiceDetected(false);
    setAudioBlob(null);
    setSeconds(0);
    setErrorMessage(null);
    setStatus('idle');
  }, [clearTimer, releaseStream, setAudioUrlTracked, stopMetering]);

  return {
    status,
    maxSeconds,
    seconds,
    levels,
    voiceDetected,
    audioBlob,
    audioUrl,
    errorMessage,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
