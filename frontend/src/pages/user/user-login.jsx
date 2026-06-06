import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function UserLogin() {
    const navigate = useNavigate();
    const [apiError, setApiError] = useState('');

    const userSchema = z.object({
        email: z.string()
            .email('E-mail inválido'),
        password: z.string()
            .min(6, 'A senha precisa ter no minimo 6 caracteres')
            .max(16, 'A senha pode ter no maximo 16 caracteres')
    });

    const {
        register,
        handleSubmit,
        formState: {errors}
    } = useForm({ resolver: zodResolver(userSchema) });

    async function onSubmit(data) {
        const payload = data;
        setApiError('');
        try {
            const response = await api.post("/api/login", payload);
            localStorage.setItem("token", response.data);
            navigate("/home");
        } catch(err) {
            const message = err?.response?.data?.message || 'Não foi possível realizar o login. Tente novamente.';
            setApiError(message);
        }

    }

    function onError(error) {
        console.log(error);
    }

    return (
        <section className='auth-screen'>
            <div className='container-sm auth-shell' style={{ maxWidth: '600px' }}>
                <form onSubmit={handleSubmit(onSubmit, onError)} className='auth-card w-100'>
                    <p className='auth-eyebrow mb-2 text-center'>matrix</p>
                    <h1 className='auth-title h3 mb-4 text-center'>Entrar na conta</h1>

                    {apiError && (
                        <div className='alert alert-danger' role='alert'>
                            {apiError}
                        </div>
                    )}

                    <div className='mb-3'>
                        <label className='form-label'>E-mail</label>
                        <input
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            type='email'
                            placeholder='você@exemplo.com'
                            {...register('email')}
                        />
                        {errors.email && <div className='invalid-feedback'>{errors.email.message}</div>}
                    </div>

                    <div className='mb-4'>
                        <label className='form-label'>Senha</label>
                        <input
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            type='password'
                            placeholder='Digite sua senha'
                            {...register('password')}
                        />
                        {errors.password && <div className='invalid-feedback'>{errors.password.message}</div>}
                    </div>

                    <div>
                        <button type='submit' className='btn btn-primary w-100 mb-3'>Entrar</button>
                        <p className='m-0 text-center'>
                            <span className='text-body-secondary'>Não tem conta? </span>
                            <Link to='/sign-up' className='fw-semibold text-decoration-none'>
                                Criar cadastro
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </section>
    );
}
