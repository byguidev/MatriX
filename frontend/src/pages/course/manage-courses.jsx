import CourseFormModal from "../../components/course/course-form-modal";
import DataTable from "../../components/.common/data-table";
import AppHeader from "../../components/.common/app-header";
import ChartCard from "../../components/.common/chart-card";
import api from "../../services/api";
import renderProfileLink from "../../components/.common/render-profile-link";
import deleteActionCell from "../../components/.common/delete-cell";
import DeleteModal from "../../components/.common/delete-modal";
import { useEffect, useMemo, useState } from "react";

const billingLabels = {
    "DIÁRIA": "Cobrança diária",
    "SEMANAL": "Cobrança semanal",
    "MENSAL": "Cobrança mensal",
    "ANUAL": "Cobrança anual",
};

const billingColors = {
    "DIÁRIA": "secondary",
    "SEMANAL": "warning",
    "MENSAL": "success",
    "ANUAL": "info",
};

function ManageCourses() {
    const [courses, setCourses] = useState(null);
    const [selectedDeleteRoute, setSelectedDeleteRoute] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');

    // busca cursos na api para popular a listagem principal
    useEffect(() => {
        async function loadCourses() {
            const response = await api.get('/api/manage-courses');
            setCourses(response.data);
        }
        loadCourses();
    }, []);

    const coursesOverview = useMemo(() => {
        const cycleCounts = {};
        (courses ?? []).forEach((course) => {
            const cycle = course.billingCycle ?? "N/D";
            cycleCounts[cycle] = (cycleCounts[cycle] || 0) + 1;
        });
        return { total: courses?.length ?? 0, cycleCounts };
    }, [courses]);

    const parseCurrencyValue = (value) => {
        if (value === null || value === undefined) return 0;
        if (typeof value === 'number') return value;
        const normalized = value.toString().replace(/[^\d,-]/g, '').replace(',', '.');
        const parsed = Number(normalized);
        return Number.isNaN(parsed) ? 0 : parsed;
    };

    const billingCycleChartData = useMemo(() => {
        const cycleEntries = Object.entries(coursesOverview.cycleCounts).filter(([, count]) => count > 0);
        const cyclePalette = {
            "DIÁRIA": ["rgba(37, 99, 235, 0.92)", "#2563eb"],
            "SEMANAL": ["rgba(245, 158, 11, 0.92)", "#f59e0b"],
            "MENSAL": ["rgba(16, 185, 129, 0.92)", "#10b981"],
            "ANUAL": ["rgba(14, 165, 233, 0.92)", "#0ea5e9"],
        };

        return {
            labels: cycleEntries.map(([cycle]) => billingLabels[cycle] ?? cycle),
            datasets: [{
                label: 'Cursos',
                data: cycleEntries.map(([, count]) => count),
                backgroundColor: cycleEntries.map(([cycle]) => cyclePalette[cycle]?.[0] ?? 'rgba(100, 116, 139, 0.92)'),
                borderColor: cycleEntries.map(([cycle]) => cyclePalette[cycle]?.[1] ?? '#64748b'),
                borderWidth: 1,
                hoverOffset: 8,
            }],
        };
    }, [coursesOverview.cycleCounts]);

    const filteredCourses = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return courses;

        return courses.filter((course) => {
            const searchableValues = [course.name, course.code, course.price, course.billingCycle];
            return searchableValues.some((value) =>
                value !== null && value !== undefined && value.toString().toLowerCase().includes(query)
            );
        });
    }, [courses, searchQuery]);

    const priceRankingChartData = useMemo(() => {
        const topCourses = [...(courses ?? [])]
            .map((course) => ({
                label: course.name,
                value: parseCurrencyValue(course.price),
            }))
            .sort((left, right) => right.value - left.value)
            .slice(0, 5)
            .reverse();

        return {
            labels: topCourses.map((course) => course.label),
            datasets: [{
                label: 'Valor do curso',
                data: topCourses.map((course) => course.value),
                backgroundColor: 'rgba(37, 99, 235, 0.86)',
                borderColor: '#2563eb',
                borderWidth: 1,
                borderRadius: 10,
                barThickness: 16,
            }],
        };
    }, [courses]);

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
                    label: (context) => `${context.label}: ${context.raw} cursos`,
                },
            },
        },
    }), []);

    const rankingOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    color: '#64748b',
                    callback: (value) => `R$ ${Number(value).toLocaleString('pt-BR')}`,
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
                    label: (context) => `Valor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.raw)}`,
                },
            },
        },
    }), []);

    const tableHeaders = [<i className="bi bi-gear"></i>, "NOME", "CÓDIGO", "VALOR", "COBRANÇA", ''];

    return courses ? (
        <div className="d-flex flex-column h-100 bg-light">
            <AppHeader
                title="GERENCIAR CURSOS"
                ModalComponent={() => <CourseFormModal title={'Cadastrar curso'} />}
                modalId={"#course-form-modal"}
                showSearch={activeTab === 'data'}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
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
            {activeTab === 'data' && (
                filteredCourses.length ? (
                    <DataTable 
                        headerContent={tableHeaders} 
                        bodyContent={filteredCourses} 
                        headerColumnClasses={{ 1: "width-1", 6: "width-1" }} 
                        bodyColumnClasses={{ 1: 'text-center p-0', 2: "text-start", 3: "font-monospace", 6: "text-center p-0" }} 
                        ignoredProperties={['id', 'userId']} 
                        startColumn={{
                            value: 'Profile', 
                            profileLink: true,
                            renderProfile: (itemId) => 
                                renderProfileLink('/manage-courses/', itemId, 'bi bi-mortarboard-fill')
                        }}
                        endColumn={{
                            delete: true, 
                            deleteCell: (itemId) => 
                                deleteActionCell('/api/manage-courses/', itemId, setSelectedDeleteRoute)
                        }}/>
                ) : (
                    <h3 className="text-center my-auto">{searchQuery ? 'Nenhum curso encontrado' : 'Sem cursos cadastrados'}</h3>
                )
            )}
            {activeTab === 'overview' && (
                <div className="p-3 p-md-4">
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-sm-6 col-lg-4">
                            <div className="card summary-card h-100 border-0 shadow-sm">
                                <div className="card-body p-4 text-center">
                                    <h5 className="card-title summary-card__title text-center">Total de Cursos</h5>
                                    <h1 className="summary-card__value text-center text-primary">{coursesOverview.total}</h1>
                                </div>
                            </div>
                        </div>
                        {['DIÁRIA', 'SEMANAL', 'MENSAL', 'ANUAL'].filter((cycle) => coursesOverview.cycleCounts[cycle]).map((cycle) => (
                            <div className="col-12 col-sm-6 col-lg-4" key={cycle}>
                                <div className="card summary-card h-100 border-0 shadow-sm">
                                    <div className="card-body p-4 text-center">
                                        <h5 className="card-title summary-card__title text-center">{billingLabels[cycle] ?? cycle}</h5>
                                        <h1 className={`summary-card__value text-center text-${billingColors[cycle] || "secondary"}`}>{coursesOverview.cycleCounts[cycle]}</h1>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {Object.keys(coursesOverview.cycleCounts).filter((cycle) => !["DIÁRIA", "SEMANAL", "MENSAL", "ANUAL"].includes(cycle)).map((cycle) => (
                            <div className="col-12 col-sm-6 col-lg-4" key={cycle}>
                                <div className="card summary-card h-100 border-0 shadow-sm">
                                    <div className="card-body p-4 text-center">
                                        <h5 className="card-title summary-card__title text-center">{billingLabels[cycle] ?? `Cobrança ${cycle.toLowerCase()}`}</h5>
                                        <h1 className="summary-card__value text-center text-secondary">{coursesOverview.cycleCounts[cycle]}</h1>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="row g-3">
                        <div className="col-12 col-lg-4">
                            <ChartCard
                                title="Distribuição por cobrança"
                                subtitle="Cursos agrupados por ciclo de cobrança"
                                type="doughnut"
                                data={billingCycleChartData}
                                options={doughnutOptions}
                                height={260}
                            />
                        </div>
                        <div className="col-12 col-lg-8">
                            <ChartCard
                                title="Cursos com maior valor"
                                subtitle="Top 5 cursos por preço cadastrado"
                                type="bar"
                                data={priceRankingChartData}
                                options={rankingOptions}
                                height={260}
                            />
                        </div>
                    </div>
                </div>
            )}
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

export default ManageCourses;
