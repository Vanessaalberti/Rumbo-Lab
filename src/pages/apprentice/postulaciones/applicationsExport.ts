import type { ApplicationSummary, CvSummary } from '@/services/data/dashboard/dashboard.types';
import { APPLICATION_STATUS_LABELS } from '../applicationStatus';
import { markMeta } from './applicationMark';
import { cvChoiceLabel } from './cvChoice';

export type ExportFormat = 'json' | 'csv' | 'txt';

/** Una fila lista para exportar: mismos datos que la ficha de detalle, en texto llano y en español. */
interface ExportRow {
  nombre: string;
  empresa: string;
  puesto: string;
  cvEnviado: string;
  dondePostularte: string;
  estado: string;
  marca: string;
  fechaDePostulacion: string;
  registradaEl: string;
  notas: string;
}

function toExportRow(application: ApplicationSummary, cvs: readonly CvSummary[]): ExportRow {
  return {
    nombre: application.name,
    empresa: application.company ?? '',
    puesto: application.position ?? '',
    cvEnviado: cvChoiceLabel(application, cvs),
    dondePostularte: application.url,
    estado: APPLICATION_STATUS_LABELS[application.status],
    marca: markMeta(application.mark)?.label ?? '',
    fechaDePostulacion: application.appliedAt ?? '',
    registradaEl: application.createdAt,
    notas: application.notes ?? '',
  };
}

const CSV_COLUMNS: ReadonlyArray<{ key: keyof ExportRow; header: string }> = [
  { key: 'nombre', header: 'Nombre' },
  { key: 'empresa', header: 'Empresa' },
  { key: 'puesto', header: 'Puesto' },
  { key: 'cvEnviado', header: 'CV enviado' },
  { key: 'dondePostularte', header: 'Dónde postularte' },
  { key: 'estado', header: 'Estado' },
  { key: 'marca', header: 'Marca' },
  { key: 'fechaDePostulacion', header: 'Fecha de postulación' },
  { key: 'registradaEl', header: 'Registrada el' },
  { key: 'notas', header: 'Notas' },
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
        `${index + 1}. ${row.nombre}`,
        row.empresa && `Empresa: ${row.empresa}`,
        row.puesto && `Puesto: ${row.puesto}`,
        `CV enviado: ${row.cvEnviado}`,
        `Dónde postularte: ${row.dondePostularte}`,
        `Estado: ${row.estado}`,
        row.marca && `Marca: ${row.marca}`,
        row.fechaDePostulacion && `Fecha de postulación: ${row.fechaDePostulacion}`,
        `Registrada el: ${row.registradaEl}`,
        row.notas && `Notas: ${row.notas}`,
      ];
      return lines.filter((line): line is string => Boolean(line)).join('\n');
    })
    .join('\n\n');
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
 * Exporta exactamente las postulaciones recibidas — quien llama ya filtró y
 * buscó lo que corresponde, así que acá no se vuelve a mirar la tabla. El
 * nombre del archivo lleva la fecha de hoy, no un timestamp completo: alcanza
 * para no pisar una exportación anterior del mismo día sin volverse ilegible.
 */
export function exportApplications(
  applications: readonly ApplicationSummary[],
  cvs: readonly CvSummary[],
  format: ExportFormat,
): void {
  const rows = applications.map((application) => toExportRow(application, cvs));
  const today = new Date().toISOString().slice(0, 10);

  const content =
    format === 'json' ? JSON.stringify(rows, null, 2) : format === 'csv' ? toCsv(rows) : toTxt(rows);

  downloadFile(`postulaciones-${today}.${format}`, content, MIME_BY_FORMAT[format]);
}
