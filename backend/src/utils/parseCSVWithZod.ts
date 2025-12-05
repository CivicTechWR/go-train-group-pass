import fs from 'fs';
import { z } from 'zod';
import { parse } from 'csv-parse/sync'; // npm install csv-parse

// 1. Define the Return Type for the parser
type ParseResult<T> = {
  validRows: T[];
  errors: { row: number; error: z.ZodError }[];
};

/**
 * Parses a CSV file and validates rows against a Zod schema.
 * Uses 'csv-parse' for robust handling of GTFS quirks (BOM, quoted newlines, etc).
 * * @param filePath - Path to the CSV file
 * @param schema - The Zod schema to validate against
 * @returns Object containing valid rows and a list of errors with row numbers
 */
export function parseCsvWithSchema<T extends z.ZodTypeAny>(
  filePath: string,
  schema: T,
): ParseResult<z.infer<T>> {
  // Read file content
  // NOTE: For 'stop_times.txt' (which can be 200MB+), readFileSync might cause
  // Out of Memory errors. For that specific file, you must use streams.
  // For stops.txt, routes.txt, etc., this is perfectly fine.
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // Parse using the library
  const rawRecords = parse(fileContent, {
    columns: true, // Infers headers from first line
    skip_empty_lines: true,
    trim: true, // Trims whitespace around fields
    bom: true, // Automatically strips \uFEFF if present
    relax_quotes: true, // Helps with some messy data
  });

  const validRows: z.infer<T>[] = [];
  const errors: { row: number; error: z.ZodError }[] = [];

  // Iterate and validate
  rawRecords.forEach((record: unknown, index: number) => {
    const result = schema.safeParse(record);

    if (result.success) {
      validRows.push(result.data);
    } else {
      // Index + 2 because: 0-indexed array + 1 for header row + 1 for human readable line
      errors.push({ row: index + 2, error: result.error });
    }
  });

  return { validRows, errors };
}
