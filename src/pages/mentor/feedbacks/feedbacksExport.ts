import type { MentorFeedback } from '@/services/data/mentor/mentor.types';

export type ExportFormat = 'json' | 'csv' | 'txt';

/** Una fila lista para exportar: en texto llano y en español, como se lee en pantalla. */
interface ExportRow {
  fecha: string;
  espacio: string;
  aprendiz: string;
  feedback: string;
}

function toExportRow(feedback: MentorFeedback): ExportRow {
  return {
    fecha: feedback.createdAt,
    espacio: feedback.spaceName ?? '',
    aprendiz: feedback.apprenticeName ?? '',
    feedback: feedback.content,
  };
}

const CSV_COLUMNS: ReadonlyArray<{ key: keyof ExportRow; header: string }> = [
  { key: 'fecha', header: 'Fecha' },
  { key: 'espacio', header: 'Espacio' },
  { key: 'aprendiz', header: 'Aprendiz' },
  { key: 'feedback', header: 'Feedback' },
];

/** Entre comillas si trae coma, comilla o salto de línea; las comillas internas se duplican. */
function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function toCsv(rows: readonly ExportRow[]): string {
  const header = CSV_COLUMNS.map((column) => csvCell(column.header)).join(',');
  const lines = rows.map((row) => CSV_COLUMNS.map((column) => csvCell(row[column.key])).join(','));

  /* BOM al principio: Excel abre un CSV UTF-8 sin BOM y rompe los acentos. */
  return '﻿' + [header, ...lines].join('\r\n');
}

function toTxt(rows: readonly ExportRow[]): string {
  return rows
    .map((row, index) => {
      const lines = [
        `${index + 1}. ${row.aprendiz || 'Sin nombre'}`,
        /* El espacio es opcional: un feedback puede no colgar de ninguno. */
        row.espacio ? `Espacio: ${row.espacio}` : null,
        `Fecha: ${row.fecha}`,
        '',
        row.feedback,
      ];
      return lines.filter((line): line is string => line !== null).join('\n');
    })
    .join('\n\n---\n\n');
}

function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

const MIME_BY_FORMAT: Record<ExportFormat, string> = {
  json: 'application/json',
  csv: 'text/csv',
  txt: 'text/plain',
};

/**
 * Exporta lo que recibe: quien llama ya filtró y buscó. La fecha en el nombre
 * alcanza para no pisar una exportación anterior sin volverse ilegible.
 */
export function exportFeedbacks(feedbacks: readonly MentorFeedback[], format: ExportFormat): void {
  const rows = feedbacks.map(toExportRow);
  const today = new Date().toISOString().slice(0, 10);

  const content =
    format === 'json' ? JSON.stringify(rows, null, 2) : format === 'csv' ? toCsv(rows) : toTxt(rows);

  downloadFile(`feedbacks-${today}.${format}`, content, MIME_BY_FORMAT[format]);
}
