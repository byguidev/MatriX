import api from "../../services/api";

export default function DeleteModal({ 
    route, 
    method = "delete",
    payload = null,
    title = "Tem certeza?",
    message = "Essa ação não pode ser desfeita.",
    confirmLabel = "Excluir",
    confirmClass = "btn-danger"
}) {
    async function sendRequest() {
        if (!route) return;
        // remove item no backend e recarrega a lista para refletir o estado atual
        if (method === "delete") {
            await api.delete(route);
        } else {
            await api[method](route, payload);
        }
        window.location.reload(); // atualiza a tabela carregando os dados do servidor
    }

    return (
        <div className="modal fade" tabIndex="-1" id="delete-modal">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content row p-0 m-0">
                    <div className="modal-header col-12">
                        <h5 className="modal-title text-center w-100">{title}</h5>
                    </div>
                    <div className="modal-body col-12">
                        <p className="m-0 text-center fw-bold text-danger">{message}</p>
                    </div>
                    <div className="modal-footer col-12 d-block-flex pb-2">
                        <button type="button" className={`btn ${confirmClass} w-100`} onClick={sendRequest}>{confirmLabel}</button>
                        <button type="button" className="btn btn-secondary w-100" data-bs-dismiss="modal">Cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
