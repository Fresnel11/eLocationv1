import React, { useState, useEffect, useCallback } from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  value,
  onChange
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), localValue[1]);
    const newValue: [number, number] = [newMin, localValue[1]];
    setLocalValue(newValue);
    onChange(newValue);
  }, [localValue, onChange]);

  const handleMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), localValue[0]);
    const newValue: [number, number] = [localValue[0], newMax];
    setLocalValue(newValue);
    onChange(newValue);
  }, [localValue, onChange]);

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      <div className="relative h-6">
        {/* Track */}
        <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-2 bg-gray-200 rounded-full"></div>
        
        {/* Active range */}
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 h-2 bg-blue-600 rounded-full"
          style={{
            left: `${getPercentage(localValue[0])}%`,
            width: `${getPercentage(localValue[1]) - getPercentage(localValue[0])}%`
          }}
        ></div>
        
        {/* Min slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={localValue[0]}
          onChange={handleMinChange}
          onMouseDown={() => setActiveThumb('min')}
          onMouseUp={() => setActiveThumb(null)}
          className={`absolute w-full h-6 bg-transparent appearance-none cursor-pointer slider-thumb ${activeThumb === 'min' ? 'z-20' : 'z-10'}`}
        />
        
        {/* Max slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={localValue[1]}
          onChange={handleMaxChange}
          onMouseDown={() => setActiveThumb('max')}
          onMouseUp={() => setActiveThumb(null)}
          className={`absolute w-full h-6 bg-transparent appearance-none cursor-pointer slider-thumb ${activeThumb === 'max' ? 'z-20' : 'z-10'}`}
        />
      </div>
      
      {/* Value display */}
      <div className="flex justify-between items-center text-sm">
        <div className="bg-gray-50 px-3 py-2 rounded-lg border">
          <span className="text-gray-600">Min: </span>
          <span className="font-medium">{localValue[0].toLocaleString()} FCFA</span>
        </div>
        <div className="bg-gray-50 px-3 py-2 rounded-lg border">
          <span className="text-gray-600">Max: </span>
          <span className="font-medium">{localValue[1].toLocaleString()} FCFA</span>
        </div>
      </div>
      
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          pointer-events: all;
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          pointer-events: all;
        }
        
        .slider-thumb::-webkit-slider-track {
          background: transparent;
        }
        
        .slider-thumb::-moz-range-track {
          background: transparent;
        }
        
        .slider-thumb {
          pointer-events: none;
        }
        
        .slider-thumb::-webkit-slider-thumb {
          pointer-events: all;
        }
        
        .slider-thumb::-moz-range-thumb {
          pointer-events: all;
        }
      `}</style>
    </div>
  );
};