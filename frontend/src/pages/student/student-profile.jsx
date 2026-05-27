import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import api from '../../services/api';
import StudentFormModal from '../../components/student/student-form-modal';
import EnrollmentFormModal from '../../components/enrollment/enrollment-form-modal';
import DeleteModal from '../../components/.common/delete-modal';

function StudentProfile() {
    const ppColor = '#5e5e5e';
    const badgeColors = {ativa: "success", trancada: "secondary", cancelada: "danger"};
    const invoiceColors = { ABERTA: "warning", VENCIDA: "danger", PAGA: "success" };

    const { id } = useParams();
    let [studentData, setStudentData] = useState(null);
    let [studentStatus, setStudentStatus] = useState({message: "SEM MATRÍCULA", color: "warning"});
    let [cancelRoute, setCancelRoute] = useState(null);
    let [activeTab, setActiveTab] = useState('personal');
    let [showCanceled, setShowCanceled] = useState(false);
    let [showPaid, setShowPaid] = useState(false);
    let [serverError, setServerError] = useState(null);

    const enrollmentStatusSchema = z.object({
        status: z.enum(["ATIVA", "TRANCADA", "CANCELADA"], { message: "Valor inválido" })
    });
    const cancelPayload = enrollmentStatusSchema.parse({ status: "CANCELADA" });

    // limpa serverError automaticamente após 3 segundos
    useEffect(() => {
        if (!serverError) return;
        const timer = setTimeout(() => setServerError(null), 3000);
        return () => clearTimeout(timer);
    }, [serverError]);

    // busca dados completos do aluno para exibir e editar no mesmo fluxo
    useEffect(() => {
        async function carregarDados() {
            try {
                const response = await api.get(`/api/manage-students/${id}`);
                const enrollments = response.data.enrollments ?? [];
                const invoices = response.data.invoices ?? [];
                setStudentData({ ...response.data, enrollments, invoices });
                const activeEnrollments = enrollments.filter(e => e.status !== "CANCELADA");
                const hasActiveEnrollments = activeEnrollments.length > 0;
                const allLocked = hasActiveEnrollments && activeEnrollments.every(e => e.status === "TRANCADA");
                const statusMessage = allLocked
                    ? { message: "TRANCADO", color: "secondary" }
                    : hasActiveEnrollments
                        ? { message: "MATRICULADO", color: "success" }
                        : { message: "PENDENTE", color: "warning" };

                setStudentStatus(statusMessage);
            } catch(e) {
                console.error(e);
            }
        }
        carregarDados();
    }, [id])

    const changeEnrollmentStatus = async (enrollmentId, nextStatus) => {
        try {
            const payload = enrollmentStatusSchema.parse({ status: nextStatus });
            await api.patch(`/api/manage-enrollments/${enrollmentId}`, payload);
            window.location.reload();
        } catch (err) {
            const message = err.response?.data?.message || 'Erro ao conectar com o servidor';
            setServerError(message);
        }
    };

    const activeEnrollments = studentData?.enrollments?.filter(e => e.status !== "CANCELADA") ?? [];
    const canceledEnrollments = studentData?.enrollments?.filter(e => e.status === "CANCELADA") ?? [];
    const openInvoices = studentData?.invoices?.filter(i => i.status !== "PAGA") ?? [];
    const paidInvoices = studentData?.invoices?.filter(i => i.status === "PAGA") ?? [];

    // renderiza spinner ate o retorno da api
    return studentData ? (
        
        <div className="d-flex flex-column h-100 w-100">
            <StudentFormModal data={studentData} title={'Editar dados'} />
            <EnrollmentFormModal studentId={id} />
            {serverError && (
                <div className="position-fixed bottom-0 start-50 translate-middle-x p-3" style={{ zIndex: 1100 }}>
                    <div className="toast show align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
                        <div className="d-flex">
                            <div className="toast-body">{serverError}</div>
                            <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setServerError(null)} data-bs-dismiss="toast" aria-label="Fechar"></button>
                        </div>
                    </div>
                </div>
            )}
            <div className="d-flex flex-column align-items-start p-4 gap-3">
                <Link to="/manage-students" className='app-header__eyebrow'>
                    <i className="bi bi-house-fill"></i>
                    <span>Voltar</span>
                </Link>
                <h1 className="app-header__title">PERFIL DO ALUNO</h1>
            </div>
            <div className="card shadow-sm border-0 w-100 placeholder-glow">
                <div className="card-body p-4">
                    <div className="d-flex align-items-start justify-content-between mb-4 gap-4">
                        <div className="d-flex align-items-center gap-4">
                            <div className="fw-bold text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '80px', height: '80px', fontSize: '2rem', backgroundColor: `${ppColor}`}}>
                                <span>{studentData.fullName[0]}</span>
                            </div>
                            <div>
                                <h3 className="mb-1">{studentData.fullName}</h3>
                                <p className="text-muted m-0">Situação: <span className={"badge text-bg-"+studentStatus.color}>{studentStatus.message}</span></p>
                                <p className="text-muted m-0">Cadastrado em: {studentData.enrollmentDate}</p>
                            </div>
                        </div>
                    </div>

                    <div className="profile-tabs mb-4 overflow-hidden">
                        <button
                            className={`profile-tab ${activeTab === 'personal' ? 'active' : ''}`}
                            onClick={() => setActiveTab('personal')}
                        >
                            <i className="bi bi-person-fill me-2"></i>Dados Pessoais
                        </button>
                        <button
                            className={`profile-tab ${activeTab === 'enrollments' ? 'active' : ''}`}
                            onClick={() => setActiveTab('enrollments')}
                        >
                            <i className="bi bi-bookmark-fill me-2"></i>Matrículas
                            <span className="tab-badge">{studentData.enrollments.filter(e => e.status !== 'CANCELADA').length}</span>
                        </button>
                        <button
                            className={`profile-tab ${activeTab === 'invoices' ? 'active' : ''}`}
                            onClick={() => setActiveTab('invoices')}
                        >
                            <i className="bi bi-receipt-cutoff me-2"></i>Faturas
                            <span className="tab-badge">{openInvoices.length}</span>
                        </button>
                    </div>

                    {activeTab === 'personal' && (
                        <div className="row g-3 mx-0">
                            <button className="btn btn-outline-primary col" type="button" data-bs-toggle="modal" data-bs-target="#student-form-modal">
                                <i className="bi bi-pencil-fill me-2"></i>Editar
                            </button>
                            <div className="col-12">
                                <label className="text-muted small text-uppercase">cpf</label>
                                <p className="fs-6 fw-bold mb-0 text-break">{studentData.cpf}</p>
                            </div>
                            <div className="col-12">
                                <label className="text-muted small text-uppercase">data de nascimento</label>
                                <p className="fs-6 fw-bold mb-0 text-break">{studentData.birthDate}</p>
                            </div>
                            <div className="col-12">
                                <label className="text-muted small text-uppercase">e-mail</label>
                                <p className="fs-6 fw-bold mb-0 text-break">{studentData.email}</p>
                            </div>
                            <div className="col-12">
                                <label className="text-muted small text-uppercase">telefone</label>
                                <p className="fs-6 fw-bold mb-0 text-break">{studentData.phone}</p>
                            </div>
                        </div>
                    )}
                    {activeTab === 'enrollments' && (
                        <button className='btn btn-outline-primary w-100 mb-4' type='button' data-bs-toggle="modal" data-bs-target="#enrollment-form-modal">
                            <i className='bi bi-plus-lg me-2'></i>Nova Matrícula
                        </button>   
                    )}
                    {activeTab === 'enrollments' && (
                        <>
                            {activeEnrollments.length > 0 ? (
                                <div className='enrollment-section'>
                                    <div className='table-responsive'>
                                        <table className='enrollment-table'>
                                            <thead>
                                                <tr>
                                                    <th className='text-start'>Curso</th>
                                                    <th>Matrícula</th>
                                                    <th>Turma</th>
                                                    <th>Status</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activeEnrollments.map(e => (
                                                    <tr key={e.name} className='enrollment-row'>
                                                        <td className='enrollment-cell enrollment-cell--course'>
                                                            <Link to={`/manage-courses/${e.courseId}`} className="text-decoration-none" style={{ color: 'inherit' }}>
                                                                {e.courseName}
                                                            </Link>
                                                        </td>
                                                        <td className='enrollment-cell font-monospace'>{e.name}</td>
                                                        <td className='enrollment-cell font-monospace'>
                                                            <Link to={`/manage-classes/${e.classGroupId}`} className="text-decoration-none" style={{ color: 'inherit' }}>
                                                                {e.classGroupName}
                                                            </Link>
                                                        </td>
                                                        <td className='enrollment-cell enrollment-cell--status'>
                                                            <span className={"fw-bold badge text-bg-"+badgeColors[`${e.status.toLowerCase()}`]}>
                                                                {e.status}
                                                            </span>
                                                        </td>
                                                        <td className='enrollment-cell enrollment-cell--action position absolute' data-bs-display="static">
                                                            <DeleteModal 
                                                                route={cancelRoute}
                                                                method="patch"
                                                                payload={cancelPayload}
                                                                title="Cancelar matrícula?"
                                                                message="Essa matrícula será cancelada e não poderá mudar de status."
                                                                confirmLabel="Cancelar matrícula"
                                                            />
                                                            <button className='enrollment-action-btn' type='button' title='Ações' data-bs-toggle="dropdown">
                                                                <i className='bi bi-three-dots-vertical'></i>
                                                            </button>
                                                            <ul className="dropdown-menu">
                                                                {e.status === "ATIVA" && (
                                                                    <li className='dropdown-item btn' onClick={() => changeEnrollmentStatus(e.id, "TRANCADA")}>
                                                                        <p className='m-0'>Trancar</p>
                                                                    </li>
                                                                )}
                                                                {e.status === "TRANCADA" && (
                                                                    <li className='dropdown-item btn' onClick={() => changeEnrollmentStatus(e.id, "ATIVA")}>
                                                                        <p className='m-0'>Ativar</p>
                                                                    </li>
                                                                )}
                                                                <li className='dropdown-item btn' data-bs-toggle="modal" data-bs-target="#delete-modal" onClick={() => setCancelRoute('/api/manage-enrollments/'+e.id)}>
                                                                    <p className='text-danger m-0'>Cancelar</p>
                                                                </li>
                                                            </ul>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <h3 className="text-center m-0">Sem matrículas ativas</h3>
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
                                                    <th className='text-start'>Curso</th>
                                                    <th>Matrícula</th>
                                                    <th>Turma</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {canceledEnrollments.map(e => (
                                                    <tr key={e.name} className='enrollment-row'>
                                                        <td className='enrollment-cell enrollment-cell--course'>
                                                            <Link to={`/manage-courses/${e.courseId}`} className="text-decoration-none" style={{ color: 'inherit' }}>
                                                                {e.courseName}
                                                            </Link>
                                                        </td>
                                                        <td className='enrollment-cell font-monospace'>{e.name}</td>
                                                        <td className='enrollment-cell font-monospace'>
                                                            <Link to={`/manage-classes/${e.classGroupId}`} className="text-decoration-none" style={{ color: 'inherit' }}>
                                                                {e.classGroupName}
                                                            </Link>
                                                        </td>
                                                        <td className='enrollment-cell enrollment-cell--status'>
                                                            <span className={"fw-bold badge text-bg-"+badgeColors[`${e.status.toLowerCase()}`]}>
                                                                {e.status}
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
                    {activeTab === 'invoices' && (
                        <>
                            {openInvoices.length > 0 ? (
                                <div className='enrollment-section'>
                                    <div className='table-responsive'>
                                        <table className='enrollment-table'>
                                            <thead>
                                                <tr>
                                                    <th className='text-start'>Curso</th>
                                                    <th>Turma</th>
                                                    <th>Matrícula</th>
                                                    <th>Emissão</th>
                                                    <th>Vencimento</th>
                                                    <th>Valor</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {openInvoices.map((invoice) => (
                                                    <tr key={invoice.id} className='enrollment-row'>
                                                        <td className='enrollment-cell enrollment-cell--course'>
                                                            {invoice.courseId ? (
                                                                <Link to={`/manage-courses/${invoice.courseId}`} className="text-decoration-none" style={{ color: 'inherit' }}>
                                                                    {invoice.courseName}
                                                                </Link>
                                                            ) : (
                                                                invoice.courseName
                                                            )}
                                                        </td>
                                                        <td className='enrollment-cell font-monospace'>
                                                            {invoice.classGroupId ? (
                                                                <Link to={`/manage-classes/${invoice.classGroupId}`} className="text-decoration-none" style={{ color: 'inherit' }}>
                                                                    {invoice.classGroupName}
                                                                </Link>
                                                            ) : (
                                                                invoice.classGroupName
                                                            )}
                                                        </td>
                                                        <td className='enrollment-cell font-monospace'>{invoice.enrollmentName}</td>
                                                        <td className='enrollment-cell font-monospace'>{invoice.issueDate}</td>
                                                        <td className='enrollment-cell font-monospace'>{invoice.dueDate}</td>
                                                        <td className='enrollment-cell font-monospace'>{invoice.value}</td>
                                                        <td className='enrollment-cell enrollment-cell--status'>
                                                            <span className={`status-label badge text-bg-${invoiceColors[invoice.status] ?? "secondary"}`}>
                                                                <span className="status-label__dot" aria-hidden="true"></span>
                                                                {invoice.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <h3 className="text-center m-0">Sem faturas em aberto</h3>
                            )}
                            {paidInvoices.length > 0 && (
                                <button className={`btn btn-outline-secondary w-100 mt-4 mb-${showPaid ? "4" : "0"}`} type='button' onClick={() => setShowPaid((current) => !current)}>
                                    {showPaid ? 'Ocultar pagas' : `Mostrar pagas (${paidInvoices.length})`}
                                </button>
                            )}
                            {showPaid && paidInvoices.length > 0 && (
                                <div className='enrollment-section'>
                                    <div className='table-responsive'>
                                        <table className='enrollment-table'>
                                            <thead>
                                                <tr>
                                                    <th className='text-start'>Curso</th>
                                                    <th>Turma</th>
                                                    <th>Matrícula</th>
                                                    <th>Emissão</th>
                                                    <th>Vencimento</th>
                                                    <th>Valor</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paidInvoices.map((invoice) => (
                                                    <tr key={invoice.id} className='enrollment-row'>
                                                        <td className='enrollment-cell enrollment-cell--course'>
                                                            {invoice.courseId ? (
                                                                <Link to={`/manage-courses/${invoice.courseId}`} className="text-decoration-none" style={{ color: 'inherit' }}>
                                                                    {invoice.courseName}
                                                                </Link>
                                                            ) : (
                                                                invoice.courseName
                                                            )}
                                                        </td>
                                                        <td className='enrollment-cell font-monospace'>
                                                            {invoice.classGroupId ? (
                                                                <Link to={`/manage-classes/${invoice.classGroupId}`} className="text-decoration-none" style={{ color: 'inherit' }}>
                                                                    {invoice.classGroupName}
                                                                </Link>
                                                            ) : (
                                                                invoice.classGroupName
                                                            )}
                                                        </td>
                                                        <td className='enrollment-cell font-monospace'>{invoice.enrollmentName}</td>
                                                        <td className='enrollment-cell font-monospace'>{invoice.issueDate}</td>
                                                        <td className='enrollment-cell font-monospace'>{invoice.dueDate}</td>
                                                        <td className='enrollment-cell font-monospace'>{invoice.value}</td>
                                                        <td className='enrollment-cell enrollment-cell--status'>
                                                            <span className={`status-label badge text-bg-${invoiceColors[invoice.status] ?? "secondary"}`}>
                                                                {invoice.status}
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

// exporta a tela de perfil do aluno
export default StudentProfile;
