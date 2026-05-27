import CourseFormModal from "../../components/course/course-form-modal";
import DataTable from "../../components/.common/data-table";
import AppHeader from "../../components/.common/app-header";
import api from "../../services/api";
import renderProfileLink from "../../components/.common/render-profile-link";
import deleteActionCell from "../../components/.common/delete-cell";
import DeleteModal from "../../components/.common/delete-modal";
import { useEffect, useState } from "react";

function ManageCourses() {
    const [courses, setCourses] = useState(null);
    const [selectedDeleteRoute, setSelectedDeleteRoute] = useState(null);
    const [activeTab, setActiveTab] = useState('data');

    // busca cursos na api para popular a listagem principal
    useEffect(() => {
        async function loadCourses() {
            const response = await api.get('/api/manage-courses');
            setCourses(response.data);
        }
        loadCourses();
    }, []);

    const tableHeaders = [<i className="bi bi-gear"></i>, "NOME", "CÓDIGO", "VALOR", "COBRANÇA", ''];

    // mostra indicador de carregamento ate receber os dados
    return courses ? (
        <div className="d-flex flex-column h-100 bg-light">
            <AppHeader
                title="GERENCIAR CURSOS"
                ModalComponent={() => <CourseFormModal title={'Cadastrar curso'} />}
                modalId={"#course-form-modal"}
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
                    courses.length ? (
                        <DataTable 
                        headerContent={tableHeaders} 
                        bodyContent={courses} 
                        headerColumnClasses={{ 1: "width-1", 6: "width-1" }} 
                        bodyColumnClasses={{ 1: 'text-center p-0', 2: "text-start", 3: "font-monospace", 6: "text-center p-0" }} 
                        ignoredProperties={['id']} 
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
                        <h3 className="text-center my-auto">Sem cursos cadastrados</h3>
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

export default ManageCourses;
