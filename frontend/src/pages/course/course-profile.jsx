import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import CourseFormModal from '../../components/course/course-form-modal';

function CourseProfile() {
    const badgeColors = {PLANEJADA: "warning", ABERTA: "success", CONCLUIDA: "info", COMPLETA: "secondary"};

    const { id } = useParams();
    let [data, setData] = useState(null);
    let [activeTab, setActiveTab] = useState('details');

    // busca detalhes do curso para preencher card e modal de edicao
    useEffect(() => {
        async function carregarDados() {
            try {
                const req = await api.get(`/api/manage-courses/${id}`);
                const classGroups = req.data.classGroups ?? [];
                setData({ ...req.data, classGroups });
            } catch(e) {
                console.error(e);
            }
        }
        carregarDados();
    }, [id])

    // exibe carregamento enquanto os dados nao chegam do backend
    return data ? (
        
        <div className="d-flex flex-column h-100 w-100">
            <CourseFormModal data={data} title={'Editar dados'} />
            <div className="d-flex flex-column align-items-start p-4 gap-3">
                <Link to="/manage-courses" className='app-header__eyebrow'>
                    <i className="bi bi-house-fill"></i>
                    <span>Voltar</span>
                </Link>
                <h1 className="app-header__title">DETALHES DO CURSO</h1>
            </div>
            <div className="card shadow-sm border-0 w-100 placeholder-glow">
                <div className="card-body p-4">
                    <div className="d-flex align-items-start justify-content-between mb-4 gap-4">
                        <div className="d-flex align-items-center gap-4">
                            <h3 className="mb-1">{data.name}</h3>
                        </div>
                    </div>

                    <div className="profile-tabs mb-4 overflow-hidden">
                        <button
                            className={`profile-tab ${activeTab === 'details' ? 'active' : ''}`}
                            onClick={() => setActiveTab('details')}
                        >
                            <i className="bi bi-info-circle-fill me-2"></i>Dados do Curso
                        </button>
                        <button
                            className={`profile-tab ${activeTab === 'classes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('classes')}
                        >
                            <i className="bi bi-collection-fill me-2"></i>Turmas
                            <span className="tab-badge">{data.classGroups.length}</span>
                        </button>
                    </div>

                    {activeTab === 'details' && (
                        <div className="row g-3">
                            <button className="btn btn-outline-primary col" type="button" data-bs-toggle="modal" data-bs-target="#course-form-modal">
                                <i className="bi bi-pencil-fill me-2"></i>Editar
                            </button>
                            <div className="col-12">
                                <label className="text-muted small text-uppercase">código</label>
                                <p className="fs-6 fw-bold mb-0 text-break">{data.code}</p>
                            </div>
                            <div className="col-12">
                                <label className="text-muted small text-uppercase">valor</label>
                                <p className="fs-6 fw-bold mb-0 text-break">{data.price}</p>
                            </div>
                            <div className="col-12">
                                <label className="text-muted small text-uppercase">cobrança</label>
                                <p className="fs-6 fw-bold mb-0 text-break">{data.billingCycle}</p>
                            </div>
                        </div>
                    )}
                    {activeTab === 'classes' && (
                        <>
                            {data.classGroups.length > 0 ? (
                                <div className='enrollment-section'>
                                    <div className='table-responsive'>
                                        <table className='enrollment-table'>
                                            <thead>
                                                <tr>
                                                    <th className='text-start'>Turma</th>
                                                    <th>Ano</th>
                                                    <th>Vagas</th>
                                                    <th>Disponíveis</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.classGroups.map((classGroup) => (
                                                    <tr key={classGroup.id} className='enrollment-row'>
                                                <td className='enrollment-cell enrollment-cell--course'>
                                                    <Link to={`/manage-classes/${classGroup.id}`} className="text-decoration-none" style={{ color: 'inherit' }}>
                                                        {classGroup.name}
                                                    </Link>
                                                </td>
                                                        <td className='enrollment-cell font-monospace'>{classGroup.year}</td>
                                                        <td className='enrollment-cell font-monospace'>{classGroup.maxSeats}</td>
                                                        <td className='enrollment-cell font-monospace'>{classGroup.availableSeats ?? '-'}</td>
                                                        <td className='enrollment-cell enrollment-cell--status'>
                                                            <span className={"badge text-bg-"+(badgeColors[classGroup.status] ?? "secondary")}>
                                                                {classGroup.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <h3 className="text-center m-0">Sem turmas vinculadas</h3>
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

// exporta a tela de detalhes do curso
export default CourseProfile;
