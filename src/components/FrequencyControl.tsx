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
  const [isFocused, setIsFocused] = useState(false);

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
    const roundedFreq = Math.round(frequency * 1000) / 1000;
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
    setIsFocused(false);
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      setInputValue(value.toString());
    }
  }, [inputValue, value, min, max]);

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  // Update input value when prop value changes
  React.useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Label and Value Display - Premium Design */}
      <div className="flex justify-between items-center">
        <label className="text-lg font-semibold text-white flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
          {label}
        </label>
        <div className="flex items-center gap-2">
          <div className={`
            relative
            transition-all duration-300
            ${isFocused ? 'scale-105' : ''}
          `}>
            <input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onFocus={handleInputFocus}
              className="
                w-32 text-right
                bg-gray-800/50 border-2 rounded-lg px-4 py-2
                text-white font-semibold
                focus:border-purple-500 focus:bg-gray-800
                focus:ring-2 focus:ring-purple-500/50
                transition-all duration-300
                backdrop-blur-sm
              "
              min={min}
              max={max}
              step={step}
            />
            {isFocused && (
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 -z-10 blur-sm" />
            )}
          </div>
          <span className="text-purple-400 font-bold text-lg">{unit}</span>
        </div>
      </div>

      {/* Premium Slider with Gradient */}
      <div className="relative">
        <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
          {/* Background gradient track */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 rounded-full transition-all duration-300"
            style={{ width: `${sliderValue}%` }}
          />
          
          {/* Slider input */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={handleSliderChange}
            className="
              absolute inset-0 w-full h-full
              appearance-none cursor-pointer
              bg-transparent
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-6
              [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(140,82,255,0.8)]
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-all
              [&::-webkit-slider-thumb]:duration-200
              [&::-webkit-slider-thumb]:hover:scale-125
              [&::-webkit-slider-thumb]:hover:shadow-[0_0_20px_rgba(140,82,255,1)]
              [&::-moz-range-thumb]:w-6
              [&::-moz-range-thumb]:h-6
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:border-none
              [&::-moz-range-thumb]:shadow-[0_0_15px_rgba(140,82,255,0.8)]
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:hover:scale-125
            "
          />
        </div>
        
        {/* Frequency markers */}
        <div className="flex justify-between mt-2">
          {[0, 25, 50, 75, 100].map((mark) => (
            <div
              key={mark}
              className={`
                h-1.5 w-0.5 rounded-full transition-all duration-200
                ${sliderValue >= mark ? 'bg-purple-400' : 'bg-gray-600'}
              `}
            />
          ))}
        </div>
      </div>

      {/* Range Display - Premium Design */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-400 font-medium">{min} {unit}</span>
        <span className="text-gray-400 font-medium">{max} {unit}</span>
      </div>

      {/* Frequency Info Card - Enhanced */}
      <div className="
        bg-gradient-to-br from-gray-800/50 to-gray-900/50
        border border-gray-700/50
        rounded-xl p-4
        backdrop-blur-sm
        transition-all duration-300
        hover:border-purple-500/30
      ">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {label === 'Carrier Frequency' 
              ? 'Base frequency for the audio tone. Higher frequencies create brighter tones.'
              : 'Rate of beats or pulses per second. Different frequencies target different brainwave states.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default FrequencyControl;
