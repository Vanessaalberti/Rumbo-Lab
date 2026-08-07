import type { ReactNode } from 'react';
import { cx } from '@/utils/classNames';
import styles from './PendingNote.module.css';

interface PendingNoteProps {
  children: ReactNode;
  className?: string;
}

/**
 * Aviso de que un flujo todavía no está operativo.
 *
 * Se muestra el estado real en lugar de simular que funciona: un formulario que
 * aparenta enviarse y no envía nada es peor que uno que dice qué falta.
 */
export function PendingNote({ children, className }: PendingNoteProps) {
  return <p className={cx(styles.note, className)}>{children}</p>;
}
