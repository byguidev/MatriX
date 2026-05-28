import StudentFormModal from "../../components/student/student-form-modal";
import DataTable from "../../components/.common/data-table";
import AppHeader from "../../components/.common/app-header";
import ChartCard from "../../components/.common/chart-card";
import api from "../../services/api";
import renderProfileLink from "../../components/.common/render-profile-link";
import deleteActionCell from "../../components/.common/delete-cell";
import DeleteModal from "../../components/.common/delete-modal";
import { useEffect, useMemo, useState } from "react";

const badgeColors = { PENDENTE: "warning", MATRICULADO: "success", TRANCADO: "secondary" };

function ManageStudents() {
    const [students, setStudents] = useState(null);
    const [selectedDeleteRoute, setSelectedDeleteRoute] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [studentsNumbers, setStudentsNumbers] = useState({total: 0, enrolled: 0, pendingEnrollment: 0, lockedEnrollments: 0});

    const parseBrDate = (dateString) => {
        if (!dateString) return null;
        const [day, month, year] = dateString.split('/').map(Number);
        if (!day || !month || !year) return null;
        return new Date(year, month - 1, day);
    };

    // carrega lista inicial para alimentar a tabela de alunos
    useEffect(() => {
        async function loadStudents() {
            const response = await api.get('/api/manage-students');
            const mapped = response.data.map(s => {
                const { enrollmentStatus, ...rest } = s;
                const statusLabel = enrollmentStatus ?? (s.enrollmentCount ? "MATRICULADO" : "PENDENTE");
                const statusColor = badgeColors[statusLabel] || "secondary";

                return {
                    ...rest,
                    // mantém a label em texto para facilitar contagens posteriores
                    statusLabel,
                    status: (
                        <span className={`status-label text-${statusColor}`}>
                            <span className="status-label__dot" aria-hidden="true"></span>
                            {statusLabel}
                        </span>
                    )
                };
            });

            // calcula os números por status
            const totals = { total: response.data.length, enrolled: 0, pendingEnrollment: 0, lockedEnrollments: 0 };
            response.data.forEach(s => {
                const statusLabel = s.enrollmentStatus ?? (s.enrollmentCount ? "MATRICULADO" : "PENDENTE");
                if (statusLabel === 'MATRICULADO') totals.enrolled += 1;
                else if (statusLabel === 'PENDENTE') totals.pendingEnrollment += 1;
                else if (statusLabel === 'TRANCADO') totals.lockedEnrollments += 1;
            });

            setStudents(mapped);
            setStudentsNumbers(totals);
        }
        loadStudents();
    }, []);

    const statusChartData = useMemo(() => {
        const labels = ["MATRICULADO", "PENDENTE", "TRANCADO"];
        return {
            labels,
            datasets: [{
                label: "Alunos",
                data: labels.map((status) => (students ?? []).filter((student) => student.statusLabel === status).length),
                backgroundColor: ["rgba(16, 185, 129, 0.92)", "rgba(245, 158, 11, 0.92)", "rgba(100, 116, 139, 0.92)"],
                borderColor: ["#10b981", "#f59e0b", "#64748b"],
                borderWidth: 1,
                hoverOffset: 8,
            }],
        };
    }, [students]);

    const filteredStudents = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return students;

        return students.filter((student) => {
            const searchableValues = [
                student.name,
                student.cpf,
                student.birthDate,
                student.email,
                student.phone,
                student.statusLabel,
                student.enrollmentDate,
            ];

            return searchableValues.some((value) =>
                value !== null && value !== undefined && value.toString().toLowerCase().includes(query)
            );
        });
    }, [searchQuery, students]);

    const enrollmentTrendData = useMemo(() => {
        const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
        const now = new Date();
        const months = Array.from({ length: 6 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - (5 - index), 1));
        const buckets = new Map(
            months.map((date) => {
                const key = `${date.getFullYear()}-${date.getMonth()}`;
                return [key, { label: monthFormatter.format(date).replace('.', '').toUpperCase(), total: 0 }];
            })
        );

        (students ?? []).forEach((student) => {
            const enrollmentDate = parseBrDate(student.enrollmentDate);
            if (!enrollmentDate) return;

            const bucket = buckets.get(`${enrollmentDate.getFullYear()}-${enrollmentDate.getMonth()}`);
            if (bucket) bucket.total += 1;
        });

        const monthlySummary = [...buckets.values()];

        return {
            labels: monthlySummary.map((item) => item.label),
            datasets: [{
                label: 'Novos alunos',
                data: monthlySummary.map((item) => item.total),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.12)',
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                tension: 0.35,
                fill: true,
            }],
        };
    }, [students]);

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
                    label: (context) => `${context.label}: ${context.raw} alunos`,
                },
            },
        },
    }), []);

    const trendOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                    color: '#64748b',
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.18)',
                },
            },
            x: {
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
                    label: (context) => `${context.raw} alunos cadastrados`,
                },
            },
        },
    }), []);

    // contadores agora calculados quando os alunos são carregados

    const tableHeaders = [<i className="bi bi-gear"></i>, "NOME", "CPF", "DATA DE NASCIMENTO", "E-MAIL", "TELEFONE", 'SITUAÇÃO', ''];

    // exibe spinner enquanto a api ainda nao retornou os registros
    return students ? (
        <div className="d-flex flex-column h-100 bg-light">
            <AppHeader
                title="GERENCIAR ALUNOS"
                ModalComponent={() => <StudentFormModal title={'Cadastrar aluno'} />}
                modalId={"#student-form-modal"}
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
            {
                activeTab === 'data' && (
                    filteredStudents.length ? (
                        <DataTable 
                        headerContent={tableHeaders} 
                        bodyContent={filteredStudents} 
                        headerColumnClasses={{ 1: "width-1", 7: "width-1" }} 
                        bodyColumnClasses={{ 1: 'text-center p-0', 2: "text-start", 3: "font-monospace", 4: "font-monospace", 6: "font-monospace", 5: "text-start", 8: "text-center p-0 width-1" }} 
                        ignoredProperties={['id', 'enrollmentDate', 'enrollmentCount', 'statusLabel']} 
                        startColumn={{
                            value: 'Profile', 
                            profileLink: true,
                            renderProfile: (itemId) => 
                                renderProfileLink('/manage-students/', itemId, 'bi bi-person-square')
                        }}
                        endColumn={{
                            delete: true, 
                            deleteCell: (itemId) => 
                                deleteActionCell('/api/manage-students/', itemId, setSelectedDeleteRoute)
                        }}/>
                    ) : (
                        <h3 className="text-center my-auto">{searchQuery ? 'Nenhum aluno encontrado' : 'Sem alunos cadastrados'}</h3>
                    )
                )
            }
            {
                activeTab === 'overview' && (
                    <div className="p-3 p-md-4">
                        <div className="row g-3 mb-3">
                            <div className="col-12 col-sm-6 col-lg-3">
                                <div className="card summary-card h-100 border-0 shadow-sm">
                                    <div className="card-body p-4 text-center">
                                        <h5 className="card-title summary-card__title text-center">Total de Alunos</h5>
                                        <h1 className="summary-card__value text-center text-primary">{studentsNumbers.total}</h1>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-lg-3">
                                <div className="card summary-card h-100 border-0 shadow-sm">
                                    <div className="card-body p-4 text-center">
                                        <h5 className="card-title summary-card__title text-center">Matrícula Ativa</h5>
                                        <h1 className="summary-card__value text-center text-success">{studentsNumbers.enrolled}</h1>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-lg-3">
                                <div className="card summary-card h-100 border-0 shadow-sm">
                                    <div className="card-body p-4 text-center">
                                        <h5 className="card-title summary-card__title text-center">Matrícula Pendente</h5>
                                        <h1 className="summary-card__value text-center text-warning">{studentsNumbers.pendingEnrollment}</h1>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-lg-3">
                                <div className="card summary-card h-100 border-0 shadow-sm">
                                    <div className="card-body p-4 text-center">
                                        <h5 className="card-title summary-card__title text-center">Matrícula Trancada</h5>
                                        <h1 className="summary-card__value text-center text-secondary">{studentsNumbers.lockedEnrollments}</h1>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row g-3">
                            <div className="col-12 col-lg-4">
                                <ChartCard
                                    title="Distribuição de matrículas"
                                    subtitle="Status atual dos alunos cadastrados"
                                    type="doughnut"
                                    data={statusChartData}
                                    options={doughnutOptions}
                                    height={260}
                                />
                            </div>
                            <div className="col-12 col-lg-8">
                                <ChartCard
                                    title="Novas matrículas por mês"
                                    subtitle="Últimos 6 meses com base na data de matrícula"
                                    type="line"
                                    data={enrollmentTrendData}
                                    options={trendOptions}
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

export default ManageStudents;
