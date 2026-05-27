import StudentFormModal from "../../components/student/student-form-modal";
import DataTable from "../../components/.common/data-table";
import AppHeader from "../../components/.common/app-header";
import api from "../../services/api";
import renderProfileLink from "../../components/.common/render-profile-link";
import deleteActionCell from "../../components/.common/delete-cell";
import DeleteModal from "../../components/.common/delete-modal";
import { useEffect, useState } from "react";

function ManageStudents() {
    const badgeColors = { PENDENTE: "warning", MATRICULADO: "success", TRANCADO: "secondary" };
    const [students, setStudents] = useState(null);
    const [selectedDeleteRoute, setSelectedDeleteRoute] = useState(null);
    const [activeTab, setActiveTab] = useState('data');

    // carrega lista inicial para alimentar a tabela de alunos
    useEffect(() => {
        async function loadStudents() {
            const response = await api.get('/api/manage-students');
            
            setStudents(
                response.data.map(s => {
                    const { enrollmentStatus, ...rest } = s;
                    const statusLabel = enrollmentStatus ?? (s.enrollmentCount ? "MATRICULADO" : "PENDENTE");
                    const statusColor = badgeColors[statusLabel] || "secondary";

                    return {
                        ...rest,
                        status: (
                            <span className={`status-label text-${statusColor}`}>
                                <span className="status-label__dot" aria-hidden="true"></span>
                                {statusLabel}
                            </span>
                        )
                    };
                })
            );
        }
        loadStudents();
    }, []);

    const tableHeaders = [<i className="bi bi-gear"></i>, "NOME", "CPF", "DATA DE NASCIMENTO", "E-MAIL", "TELEFONE", 'SITUAÇÃO', ''];

    // exibe spinner enquanto a api ainda nao retornou os registros
    return students ? (
        <div className="d-flex flex-column h-100 bg-light">
            <AppHeader
                title="GERENCIAR ALUNOS"
                ModalComponent={() => <StudentFormModal title={'Cadastrar aluno'} />}
                modalId={"#student-form-modal"}
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
                    students.length ? (
                        <DataTable 
                        headerContent={tableHeaders} 
                        bodyContent={students} 
                        headerColumnClasses={{ 1: "width-1", 7: "width-1" }} 
                        bodyColumnClasses={{ 1: 'text-center p-0', 2: "text-start", 3: "font-monospace", 4: "font-monospace", 6: "font-monospace", 5: "text-start", 8: "text-center p-0 width-1" }} 
                        ignoredProperties={['id', 'enrollmentDate', 'enrollmentCount']} 
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
                        <h3 className="text-center my-auto">Sem alunos cadastrados</h3>
                    )
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
