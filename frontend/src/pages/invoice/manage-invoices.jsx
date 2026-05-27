import DataTable from "../../components/.common/data-table";
import AppHeader from "../../components/.common/app-header";
import api from "../../services/api";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function ManageInvoices() {
    const statusColors = { ABERTA: "warning", VENCIDA: "danger", PAGA: "success" };
    const [invoices, setInvoices] = useState(null);
    const [serverError, setServerError] = useState(null);
    const [activeTab, setActiveTab] = useState('data');

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: "currency", currency: "BRL" }).format(value ?? 0);

    const parseCurrencyValue = (value) => {
        if (value === null || value === undefined) return 0;
        if (typeof value === 'number') return value;
        const normalized = value.toString().replace(/[^\d,-]/g, '').replace(',', '.');
        const parsed = Number(normalized);
        return Number.isNaN(parsed) ? 0 : parsed;
    };

    const parseBrDate = (dateString) => {
        if (!dateString) return null;
        const [day, month, year] = dateString.split('/').map(Number);
        if (!day || !month || !year) return null;
        return new Date(year, month - 1, day);
    };

    useEffect(() => {
        async function loadInvoices() {
            try {
                const response = await api.get('/api/manage-invoices');
                setInvoices(response.data);
            } catch (err) {
                const message = err.response?.data?.message || 'Erro ao conectar com o servidor';
                setServerError(message);
            }
        }
        loadInvoices();
    }, []);

    const invoiceMap = useMemo(() => {
        return new Map((invoices ?? []).map(invoice => [invoice.id, invoice]));
    }, [invoices]);

    const invoiceOverview = useMemo(() => {
        const now = new Date();
        const summary = {
            PAGA: { count: 0, total: 0 },
            ABERTA: { count: 0, total: 0 },
            VENCIDA: { count: 0, total: 0 },
        };

        (invoices ?? []).forEach((invoice) => {
            const issueDate = parseBrDate(invoice.issueDate);
            if (!issueDate) return;
            if (issueDate.getMonth() !== now.getMonth() || issueDate.getFullYear() !== now.getFullYear()) return;

            const bucket = summary[invoice.status];
            if (!bucket) return;
            bucket.count += 1;
            bucket.total += parseCurrencyValue(invoice.value);
        });

        return summary;
    }, [invoices]);

    const handleStatusChange = async (invoiceId, nextStatus) => {
        try {
            const response = await api.patch(`/api/manage-invoices/${invoiceId}`, { status: nextStatus });
            setInvoices((current) => current.map((inv) => inv.id === invoiceId ? response.data : inv));
        } catch (err) {
            const message = err.response?.data?.message || 'Erro ao conectar com o servidor';
            setServerError(message);
        }
    };

    const renderProfileLink = (route, id, label) => (
        <Link to={`${route}${id}`} className="text-decoration-none" style={{ color: 'inherit' }}>
            {label}
        </Link>
    );

    const tableHeaders = [
        <i className="bi bi-gear"></i>,
        "ALUNO",
        "CURSO",
        "TURMA",
        "MATRÍCULA",
        "EMISSÃO",
        "VENCIMENTO",
        "VALOR",
        "COBRANÇA",
        "STATUS",
        ""
    ];

    const tableRows = (invoices ?? []).map((invoice) => {
        const statusColor = statusColors[invoice.status] || "secondary";
        return {
            id: invoice.id,
            studentName: invoice.studentId
                ? renderProfileLink('/manage-students/', invoice.studentId, invoice.studentName)
                : invoice.studentName,
            courseName: invoice.courseId
                ? renderProfileLink('/manage-courses/', invoice.courseId, invoice.courseName)
                : invoice.courseName,
            classGroupName: invoice.classGroupId
                ? renderProfileLink('/manage-classes/', invoice.classGroupId, invoice.classGroupName)
                : invoice.classGroupName,
            enrollmentName: invoice.enrollmentName,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            value: invoice.value,
            currency: invoice.currency,
            status: (
                <span className={`status-label text-${statusColor}`}>
                    <span className="status-label__dot" aria-hidden="true"></span>
                    {invoice.status}
                </span>
            ),
        };
    });

    const renderStatusSelect = (invoiceId) => {
        const invoice = invoiceMap.get(invoiceId);
        if (!invoice) return null;

        const statusColor = statusColors[invoice.status] || "secondary";

        return (
            <select
                className={`form-select form-select-sm fw-semibold text-${statusColor}`}
                value={invoice.status}
                onChange={(event) => handleStatusChange(invoiceId, event.target.value)}
            >
                <option value="ABERTA">ABERTA</option>
                <option value="VENCIDA">VENCIDA</option>
                <option value="PAGA">PAGA</option>
            </select>
        );
    };

    return invoices ? (
        <div className="d-flex flex-column h-100 bg-light">
            <AppHeader title="GERENCIAR FATURAS" showSearch={activeTab === 'data'} />
            <div className="px-3 px-md-4 pt-4">
                <div className="profile-tabs mb-4 overflow-hidden">
                    <button
                        className={`profile-tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <i className="bi bi-columns-gap me-2"></i>Visão geral
                    </button>
                    <button
                        className={`profile-tab ${activeTab === 'data' ? 'active' : ''}`}
                        onClick={() => setActiveTab('data')}
                    >
                        <i className="bi bi-table me-2"></i>Dados
                    </button>
                </div>
            </div>
            {activeTab === 'data' && (
                <>
                    {serverError && (
                        <div className="alert alert-danger mx-4 mt-3 mb-0" role="alert">
                            {serverError}
                        </div>
                    )}
                    {invoices.length ? (
                        <DataTable
                            headerContent={tableHeaders}
                            bodyContent={tableRows}
                            headerColumnClasses={{ 1: "width-1", 11: "width-1" }}
                            bodyColumnClasses={{
                                1: "text-center p-0",
                                2: "text-start",
                                3: "text-start",
                                4: "text-start",
                                5: "font-monospace",
                                6: "font-monospace",
                                7: "font-monospace",
                                8: "font-monospace",
                                9: "text-center",
                                10: "text-center",
                                11: "text-center p-0 width-1"
                            }}
                            ignoredProperties={['id']}
                            columnOrder={{
                                2: "studentName",
                                3: "courseName",
                                4: "classGroupName",
                                5: "enrollmentName",
                                6: "issueDate",
                                7: "dueDate",
                                8: "value",
                                9: "currency",
                                10: "status",
                            }}
                            startColumn={{ value: "" }}
                            endColumn={{
                                delete: true,
                                deleteCell: (itemId) => renderStatusSelect(itemId)
                            }}
                        />
                    ) : (
                        <h3 className="text-center my-auto">Sem faturas cadastradas</h3>
                    )}
                </>
            )}
            {activeTab === 'overview' && (
                <div className="row m-0 p-3 g-3">
                    {["PAGA", "ABERTA", "VENCIDA"].map((status) => {
                        const color = statusColors[status] || "secondary";
                        const summary = invoiceOverview[status];
                        return (
                            <div className="col-12 col-sm-6 col-md" key={status}>
                                <div className="card summary-card">
                                    <div className="card-body">
                                        <h5 className="card-title summary-card__title text-center">{status}</h5>
                                        <h1 className={`summary-card__value text-center text-${color} my-4`}>{summary.count}</h1>
                                        <p className="text-center fs-4 text-muted mb-0 fw-semibold">{formatCurrency(summary.total)}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    ) : (
        <div className="d-flex justify-content-center align-items-center h-100">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">carregando...</span>
            </div>
        </div>
    );
}

export default ManageInvoices;
