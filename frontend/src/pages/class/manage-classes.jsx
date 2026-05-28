import DataTable from "../../components/.common/data-table";
import ClassFormModal from "../../components/class/class-form-modal";
import AppHeader from "../../components/.common/app-header";
import ChartCard from "../../components/.common/chart-card";
import api from "../../services/api";
import renderProfileLink from "../../components/.common/render-profile-link";
import deleteActionCell from "../../components/.common/delete-cell";
import DeleteModal from "../../components/.common/delete-modal";
import { useEffect, useMemo, useState } from "react";

function ManageClasses() {
    const [classes, setClasses] = useState(null);
    const [selectedDeleteRoute, setSelectedDeleteRoute] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // carrega turmas com dados agregados de curso para a tabela
    useEffect(() => {
        async function loadClasses() {
            const response = await api.get('/api/manage-classes');
            setClasses(response.data);
        }
        loadClasses();
    }, []);

    const classesOverview = useMemo(() => {
        const totals = { total: classes?.length ?? 0, abertas: 0, planejadas: 0, concluidas: 0, completas: 0 };
        (classes ?? []).forEach((classGroup) => {
            if (classGroup.status === "ABERTA") totals.abertas += 1;
            if (classGroup.status === "PLANEJADA") totals.planejadas += 1;
            if (classGroup.status === "CONCLUIDA") totals.concluidas += 1;
            if (classGroup.status === "COMPLETA") totals.completas += 1;
        });
        return totals;
    }, [classes]);

    const classStatusChartData = useMemo(() => {
        const entries = [
            ["ABERTA", classesOverview.abertas],
            ["PLANEJADA", classesOverview.planejadas],
            ["COMPLETA", classesOverview.completas],
            ["CONCLUIDA", classesOverview.concluidas],
        ].filter(([, count]) => count > 0);

        const palette = {
            "ABERTA": ["rgba(16, 185, 129, 0.92)", "#10b981"],
            "PLANEJADA": ["rgba(245, 158, 11, 0.92)", "#f59e0b"],
            "COMPLETA": ["rgba(239, 68, 68, 0.92)", "#ef4444"],
            "CONCLUIDA": ["rgba(100, 116, 139, 0.92)", "#64748b"],
        };

        return {
            labels: entries.map(([status]) => status),
            datasets: [{
                label: 'Turmas',
                data: entries.map(([, count]) => count),
                backgroundColor: entries.map(([status]) => palette[status]?.[0] ?? 'rgba(100, 116, 139, 0.92)'),
                borderColor: entries.map(([status]) => palette[status]?.[1] ?? '#64748b'),
                borderWidth: 1,
                hoverOffset: 8,
            }],
        };
    }, [classesOverview]);

    const occupancyChartData = useMemo(() => {
        const topClasses = [...(classes ?? [])]
            .map((classGroup) => {
                const maxSeats = Number(classGroup.maxSeats ?? 0);
                const availableSeats = Number(classGroup.availableSeats ?? Math.max(maxSeats - Number(classGroup.studentCount ?? 0), 0));
                const occupiedSeats = Math.max(maxSeats - availableSeats, 0);
                const occupancy = maxSeats > 0 ? Math.round((occupiedSeats / maxSeats) * 100) : 0;

                return {
                    label: classGroup.name,
                    occupancy,
                };
            })
            .sort((left, right) => right.occupancy - left.occupancy)
            .slice(0, 5)
            .reverse();

        return {
            labels: topClasses.map((classGroup) => classGroup.label),
            datasets: [{
                label: 'Ocupação (%)',
                data: topClasses.map((classGroup) => classGroup.occupancy),
                backgroundColor: 'rgba(37, 99, 235, 0.86)',
                borderColor: '#2563eb',
                borderWidth: 1,
                borderRadius: 10,
                barThickness: 16,
            }],
        };
    }, [classes]);

    const doughnutOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 18,
                    boxWidth: 10,
                    boxHeight: 10,
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.label}: ${context.raw} turmas`,
                },
            },
        },
    }), []);

    const occupancyOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
            x: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    color: '#64748b',
                    callback: (value) => `${value}%`,
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.18)',
                },
            },
            y: {
                ticks: {
                    color: '#64748b',
                },
                grid: {
                    display: false,
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context) => `Ocupação: ${context.raw}%`,
                },
            },
        },
    }), []);

    const tableHeaders = [<i className="bi bi-gear"></i>, "NOME", "CURSO", "ANO", "ALUNOS", 'VAGAS', 'SITUAÇÃO', ''];

    // exibe fallback visual ate concluir a consulta inicial
    return classes ? (
        <div className="d-flex flex-column h-100 bg-light">
            <AppHeader
                title="GERENCIAR TURMAS"
                ModalComponent={() => <ClassFormModal title={'Cadastrar turma'} />}
                modalId={'#class-form-modal'}
                showSearch={activeTab === 'data'}
            />
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
            {
                activeTab === 'data' && (
                    classes.length ? (
                        <DataTable 
                        headerContent={tableHeaders} 
                        bodyContent={classes} 
                        headerColumnClasses={{ 1: "width-1", 6: "width-1" }} 
                        bodyColumnClasses={{ 1: 'text-center p-0', 2: "font-monospace", 3: "text-start", 8: "text-center p-0 width-1" }} 
                        ignoredProperties={['id', 'maxSeats', 'number', 'courseId', 'nextEnrollmentNumber']} 
                        columnOrder={{
                            2: "name",
                            3: "courseName",
                            4: "year",
                            5: "studentCount",
                            6: "availableSeats",
                            7: "status"
                        }}
                        startColumn={{
                            value: 'Profile', 
                            profileLink: true,
                            renderProfile: (itemId) => 
                                renderProfileLink('/manage-classes/', itemId, 'bi bi-journal-bookmark')
                        }}
                        endColumn={{
                            delete: true, 
                            deleteCell: (itemId) => 
                                deleteActionCell('/api/manage-classes/', itemId, setSelectedDeleteRoute)
                        }}/>
                    ) : (
                        <h3 className="text-center my-auto">Sem turmas cadastradas</h3>
                    )
                )
            }
            {
                activeTab === 'overview' && (
                    <div className="p-3 p-md-4">
                        <div className="row g-3 mb-3">
                            <div className="col-12 col-sm-6 col-lg">
                                <div className="card summary-card h-100 border-0 shadow-sm">
                                    <div className="card-body p-4 text-center">
                                        <h5 className="card-title summary-card__title text-center">Total de Turmas</h5>
                                        <h1 className="summary-card__value text-center text-primary">{classesOverview.total}</h1>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-lg">
                                <div className="card summary-card h-100 border-0 shadow-sm">
                                    <div className="card-body p-4 text-center">
                                        <h5 className="card-title summary-card__title text-center">Turmas Abertas</h5>
                                        <h1 className="summary-card__value text-center text-success">{classesOverview.abertas}</h1>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-lg">
                                <div className="card summary-card h-100 border-0 shadow-sm">
                                    <div className="card-body p-4 text-center">
                                        <h5 className="card-title summary-card__title text-center">Turmas Planejadas</h5>
                                        <h1 className="summary-card__value text-center text-warning">{classesOverview.planejadas}</h1>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-lg">
                                <div className="card summary-card h-100 border-0 shadow-sm">
                                    <div className="card-body p-4 text-center">
                                        <h5 className="card-title summary-card__title text-center">Turmas Completas</h5>
                                        <h1 className="summary-card__value text-center text-danger">{classesOverview.completas}</h1>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-lg">
                                <div className="card summary-card h-100 border-0 shadow-sm">
                                    <div className="card-body p-4 text-center">
                                        <h5 className="card-title summary-card__title text-center">Turmas Concluídas</h5>
                                        <h1 className="summary-card__value text-center text-secondary">{classesOverview.concluidas}</h1>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row g-3">
                            <div className="col-12 col-lg-4">
                                <ChartCard
                                    title="Distribuição por situação"
                                    subtitle="Status atual das turmas cadastradas"
                                    type="doughnut"
                                    data={classStatusChartData}
                                    options={doughnutOptions}
                                    height={260}
                                />
                            </div>
                            <div className="col-12 col-lg-8">
                                <ChartCard
                                    title="Turmas com maior ocupação"
                                    subtitle="Top 5 turmas por percentual de lotação"
                                    type="bar"
                                    data={occupancyChartData}
                                    options={occupancyOptions}
                                    height={260}
                                />
                            </div>
                        </div>
                    </div>
                )
            }
            <DeleteModal route={selectedDeleteRoute}/>
        </div>
    ) : (
        <div className="d-flex justify-content-center align-items-center h-100">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">carregando...</span>
            </div>
        </div>
    );
}

export default ManageClasses;
