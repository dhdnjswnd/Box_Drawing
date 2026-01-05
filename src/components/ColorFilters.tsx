import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ColorFilterType } from '../types';

const ColorFilters: React.FC = () => {
  const { colorFilter, setColorFilter } = useAppContext();

  const handleFilterChange = (filter: ColorFilterType) => {
    setColorFilter(filter);
  };

  return (
    <div className="filter-section">
      <h3>Color Filters</h3>
      <div className="filter-controls">
        <label>
          <input
            type="radio"
            name="colorFilter"
            value="volume"
            checked={colorFilter === 'volume'}
            onChange={() => handleFilterChange('volume')}
          />
          Volume
        </label>
        <label>
          <input
            type="radio"
            name="colorFilter"
            value="height"
            checked={colorFilter === 'height'}
            onChange={() => handleFilterChange('height')}
          />
          Height
        </label>
        <label>
          <input
            type="radio"
            name="colorFilter"
            value="area"
            checked={colorFilter === 'area'}
            onChange={() => handleFilterChange('area')}
          />
          Surface Area
        </label>
        <label>
          <input
            type="radio"
            name="colorFilter"
            value="position"
            checked={colorFilter === 'position'}
            onChange={() => handleFilterChange('position')}
          />
          Position
        </label>
      </div>
    </div>
  );
};

export default ColorFilters;
