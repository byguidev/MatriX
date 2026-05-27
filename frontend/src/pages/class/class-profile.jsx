import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import ClassFormModal from '../../components/class/class-form-modal';

function ClassProfile() {
    const classBadgeColors = {PLANEJADA: "warning", ABERTA: "success", CONCLUIDA: "info", COMPLETA: "secondary"};
    const enrollmentBadgeColors = {ativa: "success", trancada: "secondary", cancelada: "danger"};

    const { id } = useParams();
    let [data, setData] = useState(null);
    let [activeTab, setActiveTab] = useState('details');
    let [showCanceled, setShowCanceled] = useState(false);

    // busca detalhes da turma para exibir indicadores e permitir edicao
    useEffect(() => {
        async function carregarDados() {
            try {
                const req = await api.get(`/api/manage-classes/${id}`);
                const enrollments = req.data.enrollments ?? [];
                setData({ ...req.data, enrollments });
            } catch(e) {
                console.error(e);
            }
        }
        carregarDados();
    }, [id])

    const activeEnrollments = data?.enrollments?.filter(e => e.status !== "CANCELADA") ?? [];
    const canceledEnrollments = data?.enrollments?.filter(e => e.status === "CANCELADA") ?? [];

    // mantém spinner ativo ate os dados serem carregados
    return data ? (
        
        <div className="d-flex flex-column h-100 w-100">
            <ClassFormModal data={data} title={'Editar dados'} />
            <div className="d-flex flex-column align-items-start p-4 gap-3">
                <Link to="/manage-classes" className='app-header__eyebrow'>
                    <i className="bi bi-house-fill"></i>
                    <span>Voltar</span>
                </Link>
                <h1 className="app-header__title">DETALHES DA TURMA</h1>
            </div>
            <div className="card shadow-sm border-0 w-100 placeholder-glow">
                <div className="card-body p-4">
                    <div className="d-flex align-items-start justify-content-between mb-4 gap-4">
                        <div className="d-flex flex-column justify-content-center gap-2">
                            <h3 className="mb-1">{data.name}</h3>
                            <p className="text-muted m-0">Situação: <span className={"badge text-bg-"+(classBadgeColors[`${data.status}`] ?? "secondary")}>{data.status}</span></p>
                        </div>
                    </div>

                    <div className="profile-tabs mb-4 overflow-hidden">
                        <button
                            className={`profile-tab ${activeTab === 'details' ? 'active' : ''}`}
                            onClick={() => setActiveTab('details')}
                        >
                            <i className="bi bi-info-circle-fill me-2"></i>Dados da Turma
                        </button>
                        <button
                            className={`profile-tab ${activeTab === 'students' ? 'active' : ''}`}
                            onClick={() => setActiveTab('students')}
                        >
                            <i className="bi bi-people-fill me-2"></i>Alunos
                            <span className="tab-badge">{activeEnrollments.length}</span>
                        </button>
                    </div>

                    {activeTab === 'details' && (
                        <div className="row g-3">
                            <button className="btn btn-outline-primary col" type="button" data-bs-toggle="modal" data-bs-target="#class-form-modal">
                                <i className="bi bi-pencil-fill me-2"></i>Editar
                            </button>
                            <div className="col-12">
                                <label className="text-muted small text-uppercase">Curso</label>
                                <p className="fs-6 fw-bold mb-0 text-break">{data.courseName}</p>
                            </div>
                            <div className="col-12">
                                <label className="text-muted small text-uppercase">Ano</label>
                                <p className="fs-6 fw-bold mb-0 text-break">{data.year}</p>
                            </div>
                            <div className="col-12">
                                <label className="text-muted small text-uppercase">Máximo de vagas</label>
                                <p className="fs-6 fw-bold mb-0 text-break">{data.maxSeats}</p>
                            </div>
                            <div className="col-12">
                                <label className="text-muted small text-uppercase">Vagas disponíveis</label>
                                <p className="fs-6 fw-bold mb-0 text-break">{data.availableSeats}</p>
                            </div>
                            <div className="col-12">
                                <label className="text-muted small text-uppercase">Alunos Matriculados</label>
                                <p className="fs-6 fw-bold mb-0 text-break">{data.studentCount}</p>
                            </div>
                        </div>
                    )}
                    {activeTab === 'students' && (
                        <>
                            {activeEnrollments.length > 0 ? (
                                <div className='enrollment-section'>
                                    <div className='table-responsive'>
                                        <table className='enrollment-table'>
                                            <thead>
                                                <tr>
                                                    <th className='text-start'>Aluno</th>
                                                    <th>Matrícula</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activeEnrollments.map((enrollment) => (
                                                    <tr key={enrollment.id} className='enrollment-row'>
                                                        <td className='enrollment-cell enrollment-cell--course'>
                                                            <Link to={`/manage-students/${enrollment.studentId}`} className="text-decoration-none" style={{ color: 'inherit' }}>
                                                                {enrollment.studentName}
                                                            </Link>
                                                        </td>
                                                        <td className='enrollment-cell font-monospace'>{enrollment.name}</td>
                                                        <td className='enrollment-cell enrollment-cell--status'>
                                                            <span className={"fw-bold text-"+enrollmentBadgeColors[`${enrollment.status.toLowerCase()}`]}>
                                                                {enrollment.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <h3 className="text-center m-0">Sem alunos matriculados</h3>
                            )}
                            {canceledEnrollments.length > 0 && (
                                <button className={`btn btn-outline-secondary w-100 mt-4 mb-${showCanceled ? "4" : "0"}`} type='button' onClick={() => setShowCanceled((current) => !current)}>
                                    {showCanceled ? 'Ocultar canceladas' : `Mostrar canceladas (${canceledEnrollments.length})`}
                                </button>
                            )}
                            {showCanceled && canceledEnrollments.length > 0 && (
                                <div className='enrollment-section'>
                                    <div className='table-responsive'>
                                        <table className='enrollment-table'>
                                            <thead>
                                                <tr>
                                                    <th className='text-start'>Aluno</th>
                                                    <th>Matrícula</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {canceledEnrollments.map((enrollment) => (
                                                    <tr key={enrollment.id} className='enrollment-row'>
                                                        <td className='enrollment-cell enrollment-cell--course'>
                                                            <Link to={`/manage-students/${enrollment.studentId}`} className="text-decoration-none" style={{ color: 'inherit' }}>
                                                                {enrollment.studentName}
                                                            </Link>
                                                        </td>
                                                        <td className='enrollment-cell font-monospace'>{enrollment.name}</td>
                                                        <td className='enrollment-cell enrollment-cell--status'>
                                                            <span className={"fw-bold text-"+enrollmentBadgeColors[`${enrollment.status.toLowerCase()}`]}>
                                                                {enrollment.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    ) : (
        <div className="d-flex justify-content-center align-items-center h-100">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">carregando...</span>
            </div>
        </div>
    );
}

// exporta a tela de detalhes da turma
export default ClassProfile;
