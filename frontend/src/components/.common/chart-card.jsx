import Chart from "chart.js/auto";
import { useEffect, useRef } from "react";

function normalizeFileName(value) {
    return (value || "grafico")
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function escapeCsvValue(value) {
    return String(value ?? '')
        .replace(/"/g, '""')
        .replace(/;/g, ',');
}

function buildCsv(data) {
    const labels = data?.labels ?? [];
    const datasets = data?.datasets ?? [];
    const header = ["Categoria", ...datasets.map((dataset) => dataset.label ?? "Valor")];

    const rows = labels.map((label, index) => [
        escapeCsvValue(label),
        ...datasets.map((dataset) => escapeCsvValue(dataset.data?.[index] ?? 0)),
    ]);

    return [header, ...rows]
        .map((row) => row.map((value) => `"${value}"`).join(';'))
        .join('\r\n');
}

function ChartCard({ title, subtitle, type, data, options, height = 280, exportFileName }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return undefined;

        const chart = new Chart(canvasRef.current, {
            type,
            data,
            options,
        });

        return () => chart.destroy();
    }, [type, data, options]);

    const handleExport = () => {
        const csvContent = buildCsv(data);
        const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${normalizeFileName(exportFileName || title)}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="card summary-card h-100 border-0 shadow-sm">
            <div className="card-body p-4 d-flex flex-column">
                <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div>
                        <h5 className="card-title summary-card__title mb-1">{title}</h5>
                        <p className="text-muted mb-0 small">{subtitle}</p>
                    </div>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleExport} aria-label={`Exportar dados de ${title}`}>
                        Exportar CSV
                    </button>
                </div>
                <div style={{ height }}>
                    <canvas ref={canvasRef} />
                </div>
            </div>
        </div>
    );
}

export default ChartCard;