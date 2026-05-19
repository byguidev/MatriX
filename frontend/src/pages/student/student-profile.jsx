import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import StudentFormModal from '../../components/student/student-form-modal';

function StudentProfile() {
    const ppColor = '#5e5e5e';
    const badgeColors = {pendente: "warning", matriculado: "success"};

    const { id } = useParams();
    let [studentData, setStudentData] = useState(null);

    // busca dados completos do aluno para exibir e editar no mesmo fluxo
    useEffect(() => {
        async function carregarDados() {
            try {
                const response = await api.get(`/api/manage-students/${id}`);
                setStudentData({...response.data, status: response.data.enrollmentCount ? "MATRICULADO" : "PENDENTE"})
            } catch(e) {
                console.error(e);
            }
        }
        carregarDados();
    }, [id])

    // renderiza spinner ate o retorno da api
    return studentData ? (
        
        <div className="d-flex flex-column h-100 w-100">
            <StudentFormModal data={studentData} title={'Editar dados'} />
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
                                <p className="text-muted m-0">Situação: <span className={"badge text-bg-"+badgeColors[`${studentData.status.toLowerCase()}`]}>{studentData.status}</span></p>
                                <p className="text-muted m-0">Cadastrado em: {studentData.enrollmentDate}</p>
                            </div>
                        </div>
                    </div>

                    <hr className="mb-4" />

                    <div className="row g-3">
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
                        {studentData.enrollments && studentData.enrollments.length && (
                            <>
                                <hr />
                                <table className='table table-striped m-0'>
                                    <thead>
                                        <tr className='text-center'>
                                            <th>CURSO</th>
                                            <th>MATRÍCULA</th>
                                            <th>TURMA</th>
                                            <th>STATUS</th>
                                            <th><i className='bi bi-gear'></i></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentData.enrollments.map(e => (
                                            <tr className='text-center font-monospace'>
                                                <td>{e.courseName}</td>
                                                <td>{e.name}</td>
                                                <td>{e.classGroupName}</td>
                                                <td>{e.status}</td>
                                                <td><i className='bi bi-three-dots'></i></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>
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
