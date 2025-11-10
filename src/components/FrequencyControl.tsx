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
    <div className="space-y-4">
      {/* Label and Value Display */}
      <div className="flex justify-between items-center">
        <label className="text-lg font-semibold text-white">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="frequency-input w-28 text-right"
            min={min}
            max={max}
            step={step}
            style={{ width: '8rem' }} // 24% larger
          />
          <span className="text-brand-golden font-semibold">{unit}</span>
        </div>
      </div>

      {/* Premium Slider */}
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={handleSliderChange}
          className="frequency-slider w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #DAA520 0%, #DAA520 ${sliderValue}%, #374151 ${sliderValue}%, #374151 100%)`
          }}
        />
      </div>

      {/* Range Display */}
      <div className="flex justify-between text-sm text-gray-400">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>

      {/* Frequency Info */}
      <div className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-300">
          {label === 'Carrier Frequency' 
            ? 'Base frequency for the audio tone'
            : 'Rate of beats or pulses per second'
          }
        </p>
      </div>
    </div>
  );
};

export default FrequencyControl;
