import api from '../../services/api';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

export default function EnrollmentFormModal() {
    let [courses, setCourses] = useState(null);
    let [classes, setClasses] = useState(null);
    let [serverError, setServerError] = useState(null);
    const { id } = useParams();

    const enrollmentSchema = useMemo(() => z.object({
        courseId: 
            z.coerce.number()
            .int()
            .positive()
            .refine((val) => courses.map(c => c.id).includes(val), { message: "Valor inválido" })
            .nullish(),
        classGroupId: 
            z.coerce.number()
            .int()
            .positive()
            .refine((val) => classes.map(c => c.id).includes(val), { message: "Valor inválido" })
            .nullish(),
    }), [courses, classes]);

    // no cadastro, carrega turmas para permitir matricula imediata
    useEffect(() => {
        async function loadClasses() {
            const response = await api.get('/api/manage-classes');
            setClasses(response.data);
        }
        loadClasses();
    }, []);

    // carrega cursos apenas no fluxo de cadastro
    useEffect(() => {
        async function loadCourses() {
            const response = await api.get('/api/manage-courses');
            response.data.length && setCourses(response.data);
        }
        loadCourses();
    }, []);

    const { 
        control, 
        watch, 
        register, 
        handleSubmit, 
        setValue, 
        formState: { errors, dirtyFields } } 
        = useForm({resolver: zodResolver(enrollmentSchema), defaultValues: {
            classGroupId: '',
        }});

    const hasOpenClasses = classes && classes.filter(classGroup => (watch('courseId') == classGroup.courseId) && classGroup.status == "ABERTA").length > 0;

    // atualiza turma selecionada para manter curso e turma consistentes
    useEffect(() => {
        if (courses && classes) {
            const validClasses = classes.filter(classGroup => classGroup.courseId == watch('courseId') && classGroup.availableSeats > 0);
            validClasses.length ? setValue('classGroupId', validClasses[0].id) : setValue('classGroupId', "");
        }
    }, [watch('courseId')]);

    const onSubmit = async (formData) => {
        const payload = {...formData, studentId: id};
        try {
            await api.post(`/api/manage-students/${id}`, payload);
            window.location.reload();
        } catch(err) {
            const message = err.response?.data?.message || 'Erro ao conectar com o servidor';
            setServerError(message);
        }
    };

    const onError = (errors) => {
        console.log("Erro no envio do formulário:", errors);
    };

    return (
        <div className="modal fade p-0" tabIndex="-1" id="enrollment-form-modal" data-bs-backdrop="static" data-bs-keyboard="false" style={{zIndex: "5000"}}>
            <div className="modal-dialog modal-dialog-centered w-100 modal-lg modal-fullscreen-md-down">
                <div className="modal-content">
                    <div className="modal-header justify-content-center">
                        <h1 className="modal-title text-center m-0 fs-4">Criar Matrícula</h1>
                    </div>
                    <form className="modal-body" onSubmit={handleSubmit(onSubmit, onError)}>
                        {serverError && (
                            <div className="alert alert-danger d-flex align-items-center col-12" role="alert">
                                <div>
                                    Internal server error: {serverError}
                                </div>
                            </div>
                        )}
                        <div className="row row-cols-2 gx-2 gy-4">
                            <div className="col">
                                <label>Curso:</label>
                                <select className='form-select' {...register('courseId')} disabled={courses ? false : true}>
                                    {
                                        courses
                                        ?
                                        <>
                                            <option value="">-- SELECIONE UM CURSO --</option>
                                            {courses.map((course, i) => (
                                                <option key={i} value={course.id}>{course.name}</option>
                                            ))}                    
                                        </> 
                                        :
                                        (<option value="">SEM CURSOS CADASTRADOS</option>)
                                    }
                                </select>
                                {errors.courseId && (<span className='text-danger'>{errors.courseId.message}</span>)}
                            </div>
                            <div className="col">
                                <label>Turma:</label>
                                <select className='form-select' {...register('classGroupId')} disabled={!watch('courseId') || !hasOpenClasses ? true : false}>
                                    {
                                        classes 
                                        &&
                                        classes.filter(classGroup => classGroup.courseId == watch('courseId') && classGroup.status == 'ABERTA' && classGroup.availableSeats > 0).length 
                                        ?
                                        classes.filter(classGroup => classGroup.courseId == watch('courseId') && classGroup.status == 'ABERTA' && classGroup.availableSeats > 0).map((classGroup, i) => (
                                            <option key={i} value={classGroup.id}>{classGroup.name}</option>
                                        ))                   
                                        :
                                        (<option disabled value="">SEM TURMAS ABERTAS PARA O CURSO</option>)
                                    }
                                </select>
                                {errors.classGroupId && (<span className='text-danger'>{errors.classGroupId.message}</span>)}
                            </div>
                            <div className="col-12 d-flex gap-3">
                                <button type="submit" className="btn btn-success w-100">Finalizar</button>
                                <button type="button" className="btn btn-secondary w-100" data-bs-dismiss="modal">Sair</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}