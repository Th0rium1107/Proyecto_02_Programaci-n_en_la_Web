import React from 'react';

const ColoresDisplay = ({ colores }) => {
  // Si no hay colores
  if (!colores || colores.trim() === '') {
    return <span className="colores-badge">Sin colores</span>;
  }

  // Separar colores por comas
  const listaColores = colores.split(',').map(c => c.trim()).filter(c => c);
  
  if (listaColores.length === 0) {
    return <span className="colores-badge">Sin colores</span>;
  }

  // Mostrar solo el texto de los colores
  return (
    <span className="colores-badge">
      {listaColores.join(', ')}
    </span>
  );
};

export default ColoresDisplay;