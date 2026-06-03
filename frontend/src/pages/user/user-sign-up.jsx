import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

export default function UserSignUp() {

    const userSchema = z.object({
        name: z.string()
            .min(3, 'Informe o nome completo'),
        email: z.string()
            .email('E-mail inválido'),
        password: z.string()
            .min(6, 'A senha precisa ter no minimo 6 caracteres')
            .max(16, 'A senha pode ter no maximo 16 caracteres'),
        confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
        message: 'As senhas precisam ser iguais',
        path: ['confirmPassword']
    });

    const {
        register,
        handleSubmit,
        formState: {errors}
    } = useForm({ resolver: zodResolver(userSchema) });

    function onSubmit(data) {
        console.log(data);
    }

    function onError(error) {
        console.log(error);
    }

    return (
        <section className='auth-screen'>
            <div className='container-sm auth-shell' style={{ maxWidth: '600px' }}>
                <form onSubmit={handleSubmit(onSubmit, onError)} className='auth-card w-100'>
                    <p className='auth-eyebrow mb-2 text-center'>matrix</p>
                    <h1 className='auth-title h3 mb-4 text-center'>Criar conta</h1>

                    <div className='mb-3'>
                        <label className='form-label'>Nome completo</label>
                        <input
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                            type='text'
                            placeholder='Seu nome completo'
                            {...register('name')}
                        />
                        {errors.name && <div className='invalid-feedback'>{errors.name.message}</div>}
                    </div>

                    <div className='mb-3'>
                        <label className='form-label'>E-mail</label>
                        <input
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            type='email'
                            placeholder='voce@exemplo.com'
                            {...register('email')}
                        />
                        {errors.email && <div className='invalid-feedback'>{errors.email.message}</div>}
                    </div>

                    <div className='mb-3'>
                        <label className='form-label'>Senha</label>
                        <input
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            type='password'
                            placeholder='Crie uma senha'
                            {...register('password')}
                        />
                        {errors.password && <div className='invalid-feedback'>{errors.password.message}</div>}
                    </div>

                    <div className='mb-4'>
                        <label className='form-label'>Confirmar senha</label>
                        <input
                            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                            type='password'
                            placeholder='Repita a senha'
                            {...register('confirmPassword')}
                        />
                        {errors.confirmPassword && <div className='invalid-feedback'>{errors.confirmPassword.message}</div>}
                    </div>

                    <div>
                        <button type='submit' className='btn btn-primary w-100 mb-3'>Cadastrar</button>
                        <p className='m-0 text-center'>
                            <span className='text-body-secondary'>Já possui conta? </span>
                            <Link to='/login' className='fw-semibold text-decoration-none'>
                                Entrar
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </section>
    );
}