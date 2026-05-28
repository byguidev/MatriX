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
    const hasStartColumn = Boolean(startColumn.profileLink || startColumn.renderProfile || startColumn.value !== undefined);

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

            // quando existe coluna inicial, a ordenacao precisa compensar esse espaco
            const propTargetIndex = targetOneBased - (hasStartColumn ? 2 : 1);
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
        return `text-center ${headerColumnClasses[colIndex + 1] || ''}`;
    };

    // centraliza por padrao e respeita alinhamentos especificos por coluna
    const getBodyClass = colIndex => {
        const columnClass = bodyColumnClasses[colIndex + 1] || "";
        const alignment = columnClass.includes("text-start") || columnClass.includes("text-end")
            ? columnClass
            : `${columnClass} text-center`;
        return `enrollment-cell ${alignment}`;
    };

    return (
        <div
            className="table-responsive flex-grow-1 w-100 overflow-auto"
            style={{ minWidth: 0, maxHeight: '100%' }}
        >
            <table className="enrollment-table text-nowrap">
                <thead>
                    <tr>
                        {headerContent.map((headerLabel, colIndex) => (
                            <th key={colIndex} className={getHeaderClass(colIndex)}>
                                {headerLabel}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {bodyContent.map((row, rowIndex) => (
                        <tr key={rowIndex} className="enrollment-row">
                            {hasStartColumn && (
                                <td className={getBodyClass(0)}>{startColumn.profileLink ? startColumn.renderProfile(row['id']) : startColumn.value}</td>
                            )}
                            {properties.map((prop, colIndex) => {
                                const cellContent = row[prop];
                                return <td key={prop} className={(getBodyClass(colIndex + (hasStartColumn ? 1 : 0)))}>{cellContent}</td>
                            })}
                            <td className={getBodyClass(properties.length + (hasStartColumn ? 1 : 0))}>{endColumn.delete ? endColumn.deleteCell(row['id']) : endColumn.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
