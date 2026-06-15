import { Link } from "react-router-dom";

function HomePage() {
    const quickActions = [
        { label: "Gerenciar alunos", to: "/manage-students", icon: "bi-person-lines-fill" },
        { label: "Gerenciar cursos", to: "/manage-courses", icon: "bi-journal-text" },
        { label: "Gerenciar turmas", to: "/manage-classes", icon: "bi-collection" },
        { label: "Acompanhar faturas", to: "/manage-invoices", icon: "bi-cash-coin" },
    ];

    const steps = [
        {
            title: "1. Cadastre os cursos",
            description: "Comece definindo nome, código, valor e ciclo de cobrança. Esses dados são a base para matrículas e faturamento.",
        },
        {
            title: "2. Configure as turmas",
            description: "Crie turmas vinculadas aos cursos e ajuste as vagas. O MatriX calcula ocupação e situação automaticamente.",
        },
        {
            title: "3. Cadastre os alunos",
            description: "Inclua os dados essenciais dos alunos para liberar matrículas e histórico acadêmico.",
        },
        {
            title: "4. Realize as matrículas",
            description: "Matricule o aluno em uma turma disponível. A partir desse fluxo, as cobranças recorrentes passam a ser geradas.",
        },
        {
            title: "5. Monitore indicadores",
            description: "Use os dashboards de cada módulo para acompanhar ocupação, status de matrícula e resultados financeiros.",
        },
    ];

    const bestPractices = [
        "Padronize o preenchimento de nomes de cursos e turmas para facilitar filtros e análises.",
        "Revise periodicamente turmas com lotação alta para antecipar abertura de novas vagas.",
        "Acompanhe status de faturas vencidas semanalmente para agir antes de impactos maiores.",
    ];

    return (
        <div className="home-page h-100 overflow-auto">
            <div className="home-page__hero px-3 px-md-4 py-4 py-md-5">
                <div className="home-page__hero-panel p-4 p-md-5">
                    <p className="home-page__eyebrow mb-2">Bem-vindo ao MatriX</p>
                    <h1 className="home-page__title mb-3">Página Inicial</h1>
                    <p className="home-page__subtitle mb-4">
                        Este guia rápido mostra como usar o sistema de forma clara, organizada e orientada a indicadores.
                    </p>

                    <div className="row g-2 g-md-3">
                        {quickActions.map((action) => (
                            <div className="col-12 col-sm-6 col-lg" key={action.to}>
                                <Link to={action.to} className="home-page__quick-action text-decoration-none">
                                    <i className={`bi ${action.icon} me-2`}></i>
                                    {action.label}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-3 px-md-4 pb-4 pb-md-5">
                <div className="row g-3 g-md-4">
                    <div className="col-12 col-xl-8">
                        <section className="home-section card border-0 shadow-sm h-100">
                            <div className="card-body p-4 p-md-5">
                                <h2 className="home-section__title mb-3">Tutorial de uso</h2>
                                <p className="home-section__description mb-4">
                                    Siga esta sequência para estruturar sua operação com menos retrabalho.
                                </p>

                                <div className="home-steps d-grid gap-3">
                                    {steps.map((step) => (
                                        <article className="home-step" key={step.title}>
                                            <h3 className="home-step__title mb-1">{step.title}</h3>
                                            <p className="home-step__description mb-0">{step.description}</p>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="col-12 col-xl-4">
                        <section className="home-section card border-0 shadow-sm h-100">
                            <div className="card-body p-4 p-md-5">
                                <h2 className="home-section__title mb-3">Boas práticas</h2>
                                <ul className="home-list mb-4">
                                    {bestPractices.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>

                                <div className="home-callout p-3 p-md-4">
                                    <h3 className="home-callout__title mb-2">Dica de gestão</h3>
                                    <p className="mb-0">
                                        Centralize a revisão dos dashboards no início da semana para identificar bloqueios de matrícula e quedas de receita com antecedência.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;