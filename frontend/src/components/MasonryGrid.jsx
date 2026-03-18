import React, { useState, useEffect } from 'react';

const MasonryGrid = ({ items, renderItem, breakpoints }) => {
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      // Breakpoints must be sorted descending by minWidth
      for (const bp of breakpoints) {
        if (width >= bp.minWidth) {
          setColumns(bp.columns);
          return;
        }
      }
      setColumns(breakpoints[breakpoints.length - 1]?.columns || 1);
    };

    // Initial calculation
    updateColumns();

    // Add resize listener
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [breakpoints]);

  // Distribute items left-to-right dynamically depending on current column count
  const columnData = Array.from({ length: columns }, () => []);
  items.forEach((item, index) => {
    columnData[index % columns].push({ item, originalIndex: index });
  });

  return (
    <div className="flex gap-4 items-start w-full transition-all">
      {columnData.map((colItems, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-4 flex-1 w-full min-w-0">
          {colItems.map(({ item, originalIndex }) => renderItem(item, originalIndex))}
        </div>
      ))}
    </div>
  );
};

export default MasonryGrid;
