import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function UserLogin() {

    const userSchema = z.object({
        email: z.string()
            .email('E-mail inválido'),
        password: z.string()
            .min(6, 'A senha precisa ter no minimo 6 caracteres')
            .min(6)
            .max(16, 'A senha pode ter no maximo 16 caracteres')
    });

    const {
        register,
        handleSubmit,
        formState: {errors}
    } = useForm({ resolver: zodResolver(userSchema) });

    async function onSubmit(data) {
        const payload = data;
        try {
            const response = await api.post("/api/login", payload);
            console.log(response);
        } catch(err) {
            console.log(err.response.data.message);
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