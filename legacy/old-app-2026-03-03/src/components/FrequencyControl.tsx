import React, { useState, useCallback, useMemo } from 'react';

interface FrequencyControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

export const FrequencyControl: React.FC<FrequencyControlProps> = React.memo(({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange
}) => {
  const [inputValue, setInputValue] = useState(value.toString());

  // Convert frequency to logarithmic scale (0-100)
  const frequencyToSlider = useCallback((freq: number): number => {
    const logMin = Math.log10(min);
    const logMax = Math.log10(max);
    const logFreq = Math.log10(Math.max(freq, min));
    return ((logFreq - logMin) / (logMax - logMin)) * 100;
  }, [min, max]);

  // Convert slider value (0-100) to frequency
  const sliderToFrequency = useCallback((sliderValue: number): number => {
    const logMin = Math.log10(min);
    const logMax = Math.log10(max);
    const logFreq = logMin + (sliderValue / 100) * (logMax - logMin);
    return Math.pow(10, logFreq);
  }, [min, max]);

  const sliderValue = useMemo(() => frequencyToSlider(value), [value, frequencyToSlider]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sliderVal = parseFloat(e.target.value);
    const frequency = sliderToFrequency(sliderVal);
    const roundedFreq = Math.round(frequency * 1000) / 1000; // Round to 3 decimal places
    onChange(roundedFreq);
    setInputValue(roundedFreq.toString());
  }, [sliderToFrequency, onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  }, [min, max, onChange]);

  const handleInputBlur = useCallback(() => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      setInputValue(value.toString());
    }
  }, [inputValue, value, min, max]);

  // Update input value when prop value changes
  React.useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-lg font-medium text-white">
          {label}
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            min={min}
            max={max}
            step={step}
            className="w-32 px-6 py-3 bg-white/20 backdrop-blur-md text-white text-center rounded-full border-0 focus:outline-none focus:ring-3 focus:ring-blue-400/50 transition-all duration-200 text-lg font-medium shadow-inner"
            style={{ width: '8rem' }} // 24% larger than default
          />
          <span className="text-white/80 text-lg font-medium min-w-[2rem]">{unit}</span>
        </div>
      </div>
      
      <div className="relative">
        {/* Slider track background */}
        <div className="h-3 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full relative overflow-hidden">
          {/* Slider fill */}
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-200"
            style={{ width: `${sliderValue}%` }}
          />
        </div>
        
        {/* Custom slider input */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={handleSliderChange}
          className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
        />
        
        {/* Custom slider thumb */}
        <div 
          className="absolute top-1/2 w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full border-3 border-white shadow-lg transform -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-200 hover:scale-110"
          style={{ left: `${sliderValue}%` }}
        />
      </div>
      
      <div className="flex justify-between text-sm text-white/60">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
});

