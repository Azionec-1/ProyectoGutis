import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export const runtime = 'nodejs';

const SPANISH_MONTHS: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  setiembre: 8,
  septiembre: 8,
  sept: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const parseDateFromCell = (value: unknown): Date | null => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed && typeof parsed.y === 'number') {
      return new Date(parsed.y, (parsed.m ?? 1) - 1, parsed.d ?? 1);
    }
  }

  if (typeof value === 'string') {
    const text = normalizeText(value);
    if (!text) {
      return null;
    }

    const dayMonthMatch = text.match(/^(\d{1,2})[^0-9]+([a-z]+)/i);
    if (dayMonthMatch) {
      const day = Number(dayMonthMatch[1]);
      const monthKey = dayMonthMatch[2];
      const month = SPANISH_MONTHS[normalizeText(monthKey)];
      if (!Number.isNaN(day) && month !== undefined) {
        const year = new Date().getFullYear();
        return new Date(year, month, day);
      }
    }

    const monthOnly = SPANISH_MONTHS[text];
    if (monthOnly !== undefined) {
      const year = new Date().getFullYear();
      return new Date(year, monthOnly, 1);
    }

    const isoGuess = text.replace(/-/g, '/');
    const parsedDate = Date.parse(isoGuess);
    if (!Number.isNaN(parsedDate)) {
      return new Date(parsedDate);
    }
  }

  return null;
};

const stringifyCell = (value: unknown) => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

type TemplatePayload = {
  name: string;
  startDate: Date;
  endDate: Date;
  metadata: Prisma.JsonObject;
};

const sanitizeTemplateName = (value: string, fallbackIndex: number) => {
  const trimmed = value.trim();
  if (trimmed) {
    return trimmed;
  }
  return `Reporte ${fallbackIndex + 1}`;
};

const buildTemplateFromSheet = (sheetName: string, rows: unknown[][], index: number): TemplatePayload | null => {
  const meaningfulRows = rows.filter((row) => row.some((cell) => stringifyCell(cell).trim() !== ''));
  if (!meaningfulRows.length) {
    return null;
  }

  const parsedDates = meaningfulRows
    .flatMap((row) => row.map(parseDateFromCell).filter((date): date is Date => !!date))
    .sort((a, b) => a.getTime() - b.getTime());

  const startDate = parsedDates.length ? parsedDates[0] : new Date();
  const endDate = parsedDates.length ? parsedDates[parsedDates.length - 1] : startDate;

  const preview = meaningfulRows.slice(0, 5).map((row) => row.map((cell) => stringifyCell(cell)));
  const headerRow =
    rows.find((row) => row.some((cell) => typeof cell === 'string' && stringifyCell(cell).trim())) ?? [];
  const columnCount = meaningfulRows.reduce((max, row) => Math.max(max, row.length), 0);

  const metadata: Prisma.JsonObject = {
    source: 'excel',
    sheetName,
    rowCount: rows.length,
    columnCount,
    headers: headerRow.map((cell) => stringifyCell(cell)),
    preview,
  };

  return {
    name: sanitizeTemplateName(sheetName || `Hoja ${index + 1}`, index),
    startDate,
    endDate,
    metadata,
  };
};

const upsertReportTemplate = async (payload: TemplatePayload) => {
  await prisma.reportTemplate.upsert({
    where: { name: payload.name },
    update: {
      startDate: payload.startDate,
      endDate: payload.endDate,
      metadata: payload.metadata,
    },
    create: {
      name: payload.name,
      startDate: payload.startDate,
      endDate: payload.endDate,
      metadata: payload.metadata,
    },
  });
};

const createTemplatesFromWorkbook = async (workbook: XLSX.WorkBook) => {
  const templates: TemplatePayload[] = [];

  workbook.SheetNames.forEach((sheetName, index) => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      return;
    }

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true }) as unknown[][];
    const template = buildTemplateFromSheet(sheetName, rows, index);
    if (template) {
      templates.push(template);
    }
  });

  for (const template of templates) {
    await upsertReportTemplate(template);
  }

  return templates.map((template) => template.name);
};

const createTemplateFromPdf = async (file: File) => {
  const pdfModule = await import('pdf-parse');
  const pdfParse =
    (pdfModule as unknown as { default?: (buf: Buffer) => Promise<{ text: string }> }).default ??
    (pdfModule as unknown as (buf: Buffer) => Promise<{ text: string }>);
  const buffer = Buffer.from(await file.arrayBuffer());
  const data = await pdfParse(buffer);
  const text = data.text.trim();
  const templateName = file.name.replace(/\.[^.]+$/, '');
  const now = new Date();

  const metadata: Prisma.JsonObject = {
    source: 'pdf',
    preview: text.split('\n').slice(0, 5),
  };

  await upsertReportTemplate({
    name: templateName,
    startDate: now,
    endDate: now,
    metadata,
  });

  return templateName;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ message: 'No se ha adjuntado ningún archivo' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.pdf')) {
      return NextResponse.json(
        { message: 'Formato no soportado. Usa solo .xlsx, .xls o .pdf' },
        { status: 400 }
      );
    }

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'buffer' });
      const sheetNames = workbook.SheetNames.filter((name) => !!workbook.Sheets[name]);
      if (!sheetNames.length) {
        return NextResponse.json({ message: 'El archivo Excel no contiene hojas válidas' }, { status: 400 });
      }

      const imported = await createTemplatesFromWorkbook(workbook);
      if (!imported.length) {
        return NextResponse.json(
          { message: 'No se detectaron reportes válidos dentro del Excel' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        message: `Se importaron ${imported.length} reportes guardados: ${imported.join(', ')}`,
      });
    }

    const pdfTemplate = await createTemplateFromPdf(file);
    return NextResponse.json({ message: `Reporte ${pdfTemplate} importado desde PDF` });
  } catch (error) {
    console.error('Import error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Error al importar', details: message }, { status: 500 });
  }
}
