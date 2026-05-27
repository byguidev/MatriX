import DataTable from "../../components/.common/data-table";
import ClassFormModal from "../../components/class/class-form-modal";
import AppHeader from "../../components/.common/app-header";
import api from "../../services/api";
import renderProfileLink from "../../components/.common/render-profile-link";
import deleteActionCell from "../../components/.common/delete-cell";
import DeleteModal from "../../components/.common/delete-modal";
import { useEffect, useState } from "react";

function ManageClasses() {
    const [classes, setClasses] = useState(null);
    const [selectedDeleteRoute, setSelectedDeleteRoute] = useState(null);
    const [activeTab, setActiveTab] = useState('data');

    // carrega turmas com dados agregados de curso para a tabela
    useEffect(() => {
        async function loadClasses() {
            const response = await api.get('/api/manage-classes');
            setClasses(response.data);
        }
        loadClasses();
    }, []);

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
