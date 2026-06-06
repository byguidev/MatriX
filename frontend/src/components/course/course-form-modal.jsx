import api from '../../services/api';
import { IMask, IMaskInput } from 'react-imask';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';

function CourseFormModal({ data, title }) {
    const [serverError, setServerError] = useState(null);
    // garante formato minimo dos dados antes de salvar curso
    const courseSchema = z.object({
        name: 
            z.string()
            .min(1, "Campo obrigatório.")
            .max(300, "O nome não deve exceder 300 caracteres.")
            .regex(/^[a-zA-Z0-9\s\-áéíóúàâãõç]+$/, "Contém caracteres inválidos"),
        code: 
            z.string()
            .min(1, "Campo obrigatório")
            .max(30, "O código não deve exceder 30 caracteres."),
        price: 
            z.coerce.number()
            .positive("O preço deve ser positivo")
            .max(999999, "Preço máximo excedido")
            .multipleOf(0.01, "Máximo de 2 casas decimais"),
        billingCycle: 
            z.enum(["DIÁRIA", "SEMANAL", "MENSAL", "ANUAL"], { message: "Valor inválido" })
    });

    const { 
        control,
        watch,
        register, 
        handleSubmit, 
        formState: { errors, dirtyFields } } 
        = useForm({ 
            resolver: zodResolver(courseSchema), 
            defaultValues: {
                name: data ? data.name : '',
                code: data ? data.code : '',
                price: data ? data.price
                    .replace(/[^\d,]/g, "")
                    .split(",")[0]
                    : '',
                billingCycle: data ? data.billingCycle : 'MENSAL',
    }});

    const onSubmit = async (formData) => {
        const payload = data ? Object.fromEntries(
            Object.entries(formData).filter(([campo]) => dirtyFields[campo])
        ) : formData;

        try {
            // alterna entre edicao e cadastro conforme presenca de dados iniciais
            if (data) {
                await api.patch(`/api/manage-courses/${data.id}`, payload);
            } else {
                await api.post('/api/manage-courses', payload);
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
        <div className="modal fade p-0" tabIndex="-1" id="course-form-modal" data-bs-backdrop="static" data-bs-keyboard="false" style={{zIndex: "5000"}}>
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
                            <div className="col">
                                <label>Nome:</label>
                                <input className='form-control' type="text" {...register('name')}/>
                                {errors.name && (<span className='text-danger'>{errors.name.message}</span>)}
                            </div>
                            <div className="col">
                                <label htmlFor="codigo-curso">Código:</label>
                                <input className='form-control' type="text" {...register('code')}/>
                                {errors.code && (<span className='text-danger'>{errors.code.message}</span>)}
                            </div>
                            <div className="col">
                                <label>Valor:</label>
                                <Controller
                                name="price"
                                control={control}
                                render={({ field }) => (
                                    <IMaskInput
                                    {...field}
                                    className="form-control"
                                    mask={Number}
                                    scale={2}
                                    radix=","
                                    thousandsSeparator="."
                                    onAccept={(value, mask) => {
                                        field.onChange(mask.unmaskedValue);
                                    }}
                                    />
                                )}
                                />
                                {errors.price && (<span className='text-danger'>{errors.price.message}</span>)}
                            </div>
                            <div className="col">
                                <label>Cobrança:</label>
                                <select className='form-select' {...register('billingCycle')}>
                                    <option value="DIÁRIA">Diária</option>
                                    <option value="SEMANAL">Semanal</option>
                                    <option value="MENSAL">Mensal</option>
                                    <option value="ANUAL">Anual</option>
                                </select>
                                {errors.billingCycle && (<span className='text-danger'>{errors.billingCycle.message}</span>)}
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

export default CourseFormModal;
