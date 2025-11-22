import React, { useState, useCallback, useMemo, useRef } from 'react';

interface FrequencyControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

const FrequencyControl: React.FC<FrequencyControlProps> = ({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange
}) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Convert frequency to logarithmic scale (0-100) - memoized for performance
  const frequencyToSlider = useMemo(() => {
    const logMin = Math.log10(min);
    const logMax = Math.log10(max);
    return (freq: number): number => {
      const logFreq = Math.log10(Math.max(freq, min));
      return ((logFreq - logMin) / (logMax - logMin)) * 100;
    };
  }, [min, max]);

  // Convert slider value (0-100) to frequency - memoized for performance
  const sliderToFrequency = useMemo(() => {
    const logMin = Math.log10(min);
    const logMax = Math.log10(max);
    return (sliderValue: number): number => {
      const logFreq = logMin + (sliderValue / 100) * (logMax - logMin);
      return Math.round(Math.pow(10, logFreq) * 100) / 100;
    };
  }, [min, max]);

  const sliderValue = useMemo(() => frequencyToSlider(value), [value, frequencyToSlider]);

  // Immediate slider change with debounced final value
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sliderVal = parseFloat(e.target.value);
    const frequency = sliderToFrequency(sliderVal);
    
    // Update input immediately for visual feedback
    setInputValue(frequency.toString());
    
    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Debounce the actual audio change for performance
    debounceRef.current = setTimeout(() => {
      onChange(frequency);
    }, 50);
  }, [sliderToFrequency, onChange]);

  // Immediate input change with validation
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      // Immediate change for valid numbers
      onChange(numValue);
    }
  }, [min, max, onChange]);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      setInputValue(value.toString());
    }
  }, [inputValue, value, min, max]);

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  // Update input when prop changes, but not while focused
  React.useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  // Cleanup debounce on unmount
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Compact Label and Value Display */}
      <div className="flex justify-between items-center">
        <label className="text-base font-semibold text-silver-light flex items-center gap-2">
          <div className="w-1 h-4 bg-gradient-to-b from-silver-light to-silver-dark rounded-full" />
          {label}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            className="
              w-24 text-right
              bg-gray-800/30 border border-silver-border rounded-lg px-3 py-1.5
              text-silver-light font-medium text-sm
              focus:border-silver-light focus:bg-gray-800/50
              focus:ring-1 focus:ring-silver-light/50
              transition-all duration-200
              backdrop-blur-sm
            "
            min={min}
            max={max}
            step={step}
          />
          <span className="text-silver-dark text-sm">{unit}</span>
        </div>
      </div>

      {/* Optimized Slider */}
      <div className="relative">
        <div className="relative h-2 bg-gray-800/30 rounded-full overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-silver-light via-silver-dark to-silver-light rounded-full transition-all duration-150"
            style={{ width: `${sliderValue}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={handleSliderChange}
            className="
              absolute inset-0 w-full h-full
              appearance-none cursor-pointer bg-transparent
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(192,192,192,0.6)]
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-all
              [&::-webkit-slider-thumb]:duration-150
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:border-none
              [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(192,192,192,0.6)]
              [&::-moz-range-thumb]:cursor-pointer
            "
          />
        </div>
      </div>

      {/* Range Display */}
      <div className="flex justify-between text-xs text-silver-dark">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

export default React.memo(FrequencyControl);
