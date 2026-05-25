function AppHeader({ title, ModalComponent, modalId }) {
    
    return (
        // padrao de cabecalho compartilhado entre as telas de gerenciamento
        <div className="app-header px-3 px-md-4 py-3 m-0 border-bottom">
            <div className="container-fluid flex-column flex-md-row align-items-start align-items-md-center justify-content-center justify-content-md-between">
                <div className="row">
                    <p className="app-header__eyebrow mb-1 col-12">Painel administrativo</p>
                    <div className="col-12 col-md-4">
                        <h1 className="app-header__title">{title}</h1>
                    </div>
                    <form action="#" method="#" className="d-flex col-12 col-md-8 gap-1 gap-md-3 mt-3 mt-md-0">
                        <div className="input-group align-items-start">
                            <span className="input-group-text"><i className="bi bi-search"></i></span>
                            <input type="search" placeholder="Buscar" name="#" id="#" className="form-control"/>
                        </div>
                        {/* o botao abre o modal de cadastro/edicao recebido por props */}
                        <button type="button" className="btn w-100 align-self-start app-header__add" data-bs-toggle="modal" data-bs-target={modalId}>Adicionar +</button>
                    </form>
                    {ModalComponent && <ModalComponent />}
                </div>
            </div>
        </div>
    );
}

export default AppHeader;
