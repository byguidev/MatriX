import api from '../../services/api';
import { IMask, IMaskInput } from 'react-imask';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { useEffect, useState, useMemo } from 'react';

function ClassFormModal({ data, title }) {
    let [courses, setCourses] = useState(null);
    const [serverError, setServerError] = useState(null);

    // valida limites de vagas e campos obrigatorios antes do envio para api
    const classSchema = useMemo(() => z.object({
        courseId: 
            z.coerce.number()
            .refine((val) => courses ? courses.some((e) => e.id == val) : false, { message: "Sem cursos válidos para criar a turma." }),
        maxSeats: 
            z.coerce.number()
            .min(1, 'A turma deve ter pelo menos um aluno.')
            .max(1000, 'Limite de alunos excedido.'),
        status: 
            z.enum(["PLANEJADA", "ABERTA", "CONCLUIDA"], { message: "Valor inválido" }),
    }), [courses]);

    const { 
        register, 
        watch, 
        setValue, 
        handleSubmit, 
        formState: { errors, dirtyFields } } 
        = useForm({ 
            resolver: zodResolver(classSchema), 
            defaultValues: {
                courseId: data && data.courseId,
                maxSeats: data && data.maxSeats,
                status: data ? data.status : 'PLANEJADA',
    }});

    // carrega cursos para preencher o seletor de turma
    useEffect(() => {
        async function loadCourses() {
            const response = await api.get('/api/manage-courses');
            response.data.length && setCourses(response.data);
        }
        loadCourses();
    }, []);

    // no cadastro, seleciona automaticamente o primeiro curso disponivel
    useEffect(() => {
        if (!data && courses && !watch('courseId')) {
            setValue('courseId', courses[0].id);
        } else if (data) {
            setValue('courseId', data.courseId);
        }
    }, [courses]);

    const onSubmit = async (formData) => {
        const payload = data ? Object.fromEntries(
            Object.entries(formData).filter(([campo]) => dirtyFields[campo])
        ) : formData;

        try {
            // reaproveita o mesmo formulario para cadastro e edicao
            if (data) {
                await api.patch(`/api/manage-classes/${data.id}`, payload);
            } else {
                await api.post('/api/manage-classes', payload);
            }

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
        <div className="modal fade p-0" tabIndex="-1" id="class-form-modal" data-bs-backdrop="static" data-bs-keyboard="false" style={{zIndex: "5000"}}>
            <div className="modal-dialog modal-dialog-centered w-100 modal-lg modal-fullscreen-md-down">
                <div className="modal-content">
                    <div className="modal-header justify-content-center">
                        <h1 className="modal-title text-center m-0 fs-4">{title}</h1>
                    </div>
                    <form className="modal-body" onSubmit={handleSubmit(onSubmit, onError)}>
                        {serverError && (
                            <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                                <div>Internal server error: {serverError}</div>
                            </div>
                        )}
                        <div className="row row-cols-2 gx-2 gy-4">
                            <div className="col form-group">
                                <label>Curso:</label>
                                <select className='form-select' {...register('courseId')} disabled={courses ? false : true}>
                                    { courses 
                                        ? 
                                        (
                                            courses && courses.map((course, i) => (
                                                <option key={i} value={course.id}>{course.name}</option>
                                            ))
                                        )
                                        :
                                        (
                                            <option value="">SEM CURSOS CADASTRADOS</option>
                                        )
                                    }                             
                                </select>
                                {errors.courseId && <span className='text-danger'>{errors.courseId.message}</span>}
                            </div>
                            <div className="col form-group">
                                <label>Quantidade de alunos:</label>
                                <input className='form-control' type="number" {...register('maxSeats')}/>
                                {errors.maxSeats && (<span className='text-danger'>{errors.maxSeats.message}</span>)}
                            </div>
                            <div className="col-12 form-group">
                                <label>Status:</label>
                                <select className='form-select' {...register('status')}>
                                    <option value="PLANEJADA">Planejada</option>
                                    <option value="ABERTA">Aberta</option>
                                    {data && (
                                        <option value="CONCLUIDA">Concluída</option>
                                    )}
                                </select>
                                {errors.status && (<span className='text-danger'>{errors.status.message}</span>)}
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
    );
}

export default ClassFormModal;
