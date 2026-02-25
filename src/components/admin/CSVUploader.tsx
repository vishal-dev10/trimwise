import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, AlertCircle, CheckCircle2, X, FileText } from 'lucide-react';
import { validateCSV, generateTemplate, getRequiredColumns, type ValidationResult } from '@/lib/csv-validators';
import { getImporter } from '@/lib/csv-importers';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface CSVUploaderProps {
  type: string;
  title: string;
  description: string;
}

const CSVUploader = ({ type, title, description }: CSVUploaderProps) => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [errorsOpen, setErrorsOpen] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleDownloadTemplate = () => {
    const csv = generateTemplate(type);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      toast.error('Only .csv files are accepted');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File must be under 5MB');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setFileContent(text);
      const result = validateCSV(type, text);
      setValidation(result);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setFileContent(null);
    setFileName('');
    setValidation(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleImport = async () => {
    if (!validation?.valid || !validation.parsedData.length) return;
    setImporting(true);
    try {
      const importer = getImporter(type);
      const count = await importer(validation.parsedData);
      toast.success(`Imported ${count} ${type} records`);
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      handleClear();
    } catch (err: any) {
      toast.error(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const columns = getRequiredColumns(type);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-display">{title}</CardTitle>
            <CardDescription className="text-xs mt-1">{description}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Template
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload area */}
        {!fileContent ? (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Click to upload or drag CSV</span>
            <span className="text-xs text-muted-foreground mt-1">Columns: {columns.join(', ')}</span>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
          </label>
        ) : (
          <>
            {/* File info */}
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{fileName}</span>
                <Badge variant="outline" className="text-xs">
                  {validation?.parsedData.length || 0} rows
                </Badge>
              </div>
              <button onClick={handleClear} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Validation summary */}
            {validation && (
              <div className={cn(
                "rounded-lg p-3 flex items-start gap-2",
                validation.valid ? "bg-chart-positive/10" : "bg-destructive/10"
              )}>
                {validation.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-chart-positive mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                )}
                <div className="text-sm">
                  {validation.valid ? (
                    <span className="text-chart-positive font-medium">
                      Validation passed. {validation.warnings.length > 0 && `${validation.warnings.length} warning(s).`}
                    </span>
                  ) : (
                    <span className="text-destructive font-medium">
                      {validation.errors.length} error(s) found. Fix before importing.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Errors collapsible */}
            {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
              <Collapsible open={errorsOpen} onOpenChange={setErrorsOpen}>
                <CollapsibleTrigger className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  {errorsOpen ? '▾' : '▸'} Validation Details
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-1 max-h-48 overflow-auto">
                  {validation.errors.map((e, i) => (
                    <div key={i} className="text-xs flex items-start gap-2 p-1.5 rounded bg-destructive/5">
                      <span className="text-destructive font-mono shrink-0">Row {e.row}</span>
                      <span className="text-destructive/80">{e.column}: {e.message}</span>
                    </div>
                  ))}
                  {validation.warnings.map((w, i) => (
                    <div key={`w-${i}`} className="text-xs flex items-start gap-2 p-1.5 rounded bg-accent/10">
                      <span className="text-accent font-mono shrink-0">Row {w.row}</span>
                      <span className="text-accent/80">{w.column}: {w.message}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Preview table */}
            {validation && validation.parsedData.length > 0 && (
              <div className="max-h-64 overflow-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-xs">#</TableHead>
                      {columns.map(col => (
                        <TableHead key={col} className="text-xs whitespace-nowrap">{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validation.parsedData.slice(0, 20).map((row, i) => {
                      const rowErrors = validation.errors.filter(e => e.row === i + 2);
                      return (
                        <TableRow key={i} className={rowErrors.length > 0 ? 'bg-destructive/5' : ''}>
                          <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                          {columns.map(col => {
                            const hasError = rowErrors.some(e => e.column === col);
                            return (
                              <TableCell key={col} className={cn("text-xs", hasError && "text-destructive font-medium")}>
                                {row[col] || '—'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {validation.parsedData.length > 20 && (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    Showing 20 of {validation.parsedData.length} rows
                  </div>
                )}
              </div>
            )}

            {/* Import button */}
            <Button
              onClick={handleImport}
              disabled={!validation?.valid || importing}
              className="w-full"
            >
              {importing ? 'Importing...' : `Confirm & Import ${validation?.parsedData.length || 0} Records`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CSVUploader;
