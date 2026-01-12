# Office Document Generation Corrections

Rules for generating DOCX, XLSX, and PDF documents with TypeScript libraries.

## DOCX (docx npm package)

### Packer is Async

| If Claude suggests... | Use instead... |
|----------------------|----------------|
| `const buffer = Packer.toBuffer(doc)` | `const buffer = await Packer.toBuffer(doc)` |
| `Packer.toBlob(doc)` without await | `await Packer.toBlob(doc)` |

**Why**: `Packer.toBuffer()` and `Packer.toBlob()` return Promises. Missing await results in `[object Promise]` instead of actual buffer.

### ImageRun Requires Type

```typescript
// ❌ Missing image type
new ImageRun({ data: buffer, transformation: { width: 100, height: 50 } })

// ✅ Specify image type
new ImageRun({ data: buffer, transformation: { width: 100, height: 50 }, type: 'png' })
```

### Export for Workers/Browser

| If Claude suggests... | Use instead... |
|----------------------|----------------|
| `writeFileSync()` in Workers | Return `new Response(buffer, { headers })` |
| `fs.writeFile()` in browser | `Packer.toBlob()` + create download link |

## XLSX (SheetJS)

### Write Options for Non-Node

| If Claude suggests... | Use instead... |
|----------------------|----------------|
| `XLSX.writeFile(wb, 'file.xlsx')` in Workers | `XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })` |
| `XLSX.write(wb, { type: 'binary' })` | `XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })` |

**Why**: `writeFile` requires Node.js `fs` module. Use `write` with `type: 'buffer'` for Workers/browser.

### Formulas Don't Execute

SheetJS writes formulas but doesn't calculate them. Results appear when opened in Excel.

```typescript
// This is correct - formula calculates when opened in Excel
const data = [['A', 'B', 'Sum'], [1, 2, { f: 'A2+B2' }]];
// Cell will show the formula result (3) when opened in Excel, not in raw output
```

### Column Widths

```typescript
// Set column widths (wch = width in characters)
ws['!cols'] = [
  { wch: 10 },  // Column A
  { wch: 20 },  // Column B
];
```

## PDF (pdf-lib)

### Coordinate System

| If Claude suggests... | Use instead... |
|----------------------|----------------|
| `y: 50` for text at top | `y: 750` (origin is BOTTOM-left) |
| `y: pageHeight - 50` without calculation | Use actual page height: `page.getHeight() - 50` |

**Why**: PDF coordinates start at bottom-left (0,0), not top-left. For Letter size (792pt height), y=750 is near top.

### Font Must Be Embedded First

```typescript
// ❌ Using font without embedding
page.drawText('Hello', { font: StandardFonts.Helvetica });

// ✅ Embed font first
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
page.drawText('Hello', { font });
```

### Image Must Be Embedded

```typescript
// ❌ Using raw bytes directly
page.drawImage(imageBytes, { x: 50, y: 700 });

// ✅ Embed image first
const image = await pdfDoc.embedPng(imageBytes); // or embedJpg
page.drawImage(image, { x: 50, y: 700, width: 100, height: 50 });
```

## Common HTTP Response Headers

### DOCX

```typescript
return new Response(buffer, {
  headers: {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'Content-Disposition': 'attachment; filename="document.docx"',
  },
});
```

### XLSX

```typescript
return new Response(buffer, {
  headers: {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': 'attachment; filename="spreadsheet.xlsx"',
  },
});
```

### PDF

```typescript
return new Response(pdfBytes, {
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="document.pdf"',
  },
});
```

## Applies To

- `**/*.ts` files using docx, xlsx, or pdf-lib
- Cloudflare Workers generating documents
- Browser-based document export
- Any TypeScript file with Office document generation
