import React from 'react';

// renderiza tabela reutilizavel para diferentes modulos do sistema
function DataTable({
    headerContent = [],
    bodyContent = [],
    headerColumnClasses = {},
    bodyColumnClasses = {},
    ignoredProperties = [],
    startColumn = {},
    endColumn = {},
    columnOrder = {},
}) {

    // remove campos tecnicos que nao devem aparecer para o usuario
    const properties = bodyContent[0]
        ? Object.keys(bodyContent[0]).filter(key => !ignoredProperties.includes(key))
        : [];
    
    // reposiciona colunas quando a tela precisa de uma ordem especifica
    if (Object.keys(columnOrder).length !== 0) {
        const columnOrderKeys = Object.keys(columnOrder);
        for (let i = 0; i < columnOrderKeys.length; i++) {
            const key = columnOrderKeys[i];
            const targetOneBased = Number(key);
            if (Number.isNaN(targetOneBased)) continue;

            // a primeira coluna e reservada para acoes, por isso o ajuste de indice
            const propTargetIndex = targetOneBased - 2;
            const propName = columnOrder[key];
            const currentIndex = properties.indexOf(propName);

            if (currentIndex === -1) continue;
            if (propTargetIndex < 0 || propTargetIndex >= properties.length) continue;

            const temp = properties[propTargetIndex];
            properties[propTargetIndex] = propName;
            properties[currentIndex] = temp;
        }
    }

    // aplica classes personalizadas do cabecalho por posicao de coluna
    const getHeaderClass = colIndex => {
        return `sticky-top text-center app-table__head-cell ${headerColumnClasses[colIndex + 1] || ''}`;
    };

    // centraliza por padrao e respeita alinhamentos especificos por coluna
    const getBodyClass = colIndex => {
        const columnClass = bodyColumnClasses[colIndex + 1] || "";
        return `${columnClass.includes("text-start") || columnClass.includes("text-end") ? columnClass : `${columnClass} text-center`}`;
    };

    return (
        <div
            className="table-responsive flex-grow-1 w-100 overflow-auto app-table-shell"
            style={{ minWidth: 0, maxHeight: '100%' }}
        >
            <table className="table table-hover align-middle text-nowrap m-0 app-table">
                <thead className="app-table__head border-bottom">
                    <tr>
                        {headerContent.map((headerLabel, colIndex) => (
                            <th key={colIndex} className={`${getHeaderClass(colIndex)} border-0`}>
                                {headerLabel}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="app-table__body">
                    {bodyContent.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td className={getBodyClass(0)}>{startColumn.profileLink ? startColumn.renderProfile(row['id']) : startColumn.value}</td>
                            {properties.map((prop, colIndex) => {
                                const cellContent = row[prop];
                                return <td key={prop} className={(getBodyClass(colIndex + 1))}>{cellContent}</td>
                            })}
                            <td className={getBodyClass(properties.length + 1)}>{endColumn.delete ? endColumn.deleteCell(row['id']) : endColumn.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
