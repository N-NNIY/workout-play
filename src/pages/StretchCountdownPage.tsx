import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, Activity, Timer, Repeat, Coffee, Dumbbell, Moon, CheckCircle, Bed, Zap, Clock, X, Check } from 'lucide-react';

type TimerType = 'stretch' | 'exercise' | 'break' | 'meditation';

interface TimerConfig {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  accentColor: string;
  defaultTime: number;
  description: string;
}

const CountdownTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [totalSets, setTotalSets] = useState(1);
  const [currentSet, setCurrentSet] = useState(1);
  const [restTime, setRestTime] = useState(10);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(10);


  const timerTypes: Record<TimerType, TimerConfig> = {
    stretch: {
      name: 'Stretch',
      icon: Activity,
      color: 'from-emerald-500 to-teal-500',
      accentColor: 'emerald',
      defaultTime: 60, // 修改这里：1 分钟 = 60 秒
      description: 'Body stretching and relaxation'
    },
    exercise: {
      name: 'Exercise',
      icon: Dumbbell,
      color: 'from-orange-500 to-red-500',
      accentColor: 'orange',
      defaultTime: 300, // 修改这里：5 分钟 = 300 秒
      description: 'Strength training session'
    },
    break: {
      name: 'Break',
      icon: Coffee,
      color: 'from-amber-500 to-orange-500',
      accentColor: 'amber',
      defaultTime: 60, // 修改这里：1 分钟 = 60 秒
      description: 'Short relaxation break'
    },
    meditation: {
      name: 'Meditation',
      icon: Moon,
      color: 'from-green-500 to-emerald-600',
      accentColor: 'green',
      defaultTime: 600, // 这里保持不变：10 分钟 = 600 秒
      description: 'Mindfulness meditation'
    }
  };

  const [timerType, setTimerType] = useState<TimerType>('stretch');
  const [initialTime, setInitialTime] = useState(timerTypes.stretch.defaultTime);
  const [tempInitialTime, setTempInitialTime] = useState(timerTypes.stretch.defaultTime);
  const [timeLeft, setTimeLeft] = useState(timerTypes.stretch.defaultTime);

  const intervalRef = useRef<number | null>(null);

  // Temporary settings state for the modal

  const [tempTotalSets, setTempTotalSets] = useState(1);
  const [tempRestTime, setTempRestTime] = useState(10);

  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const completeSoundRef = useRef<HTMLAudioElement | null>(null);
  const countdownSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    bgmRef.current = new Audio('/bgm.mp3');
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.5;

    startSoundRef.current = new Audio('/start.mp3');
    completeSoundRef.current = new Audio('/complete.mp3');
    countdownSoundRef.current = new Audio('/countdown.wav'); // 添加倒计时音效引用
  }, []);


  const currentTimer = timerTypes[timerType];

  // Initialize temp settings when modal opens
  useEffect(() => {
    if (showSettings) {
      setTempInitialTime(initialTime);
      setTempTotalSets(totalSets);
      setTempRestTime(restTime);
    }
  }, [showSettings, initialTime, totalSets, restTime]);
  useEffect(() => {
    // Exit early if the timer isn't running
    if (!isRunning) {
      return;
    }

    // Single interval to manage all time-based state changes
    intervalRef.current = setInterval(() => {
      if (isResting) {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            // End of rest, start next set
            setIsResting(false);
            setTimeLeft(initialTime);
            if (soundEnabled) console.log('Rest finished, next set starting!');
            return 0; // Reset rest timer immediately
          }
          return prev - 1;
        });
      } else { // Not resting, main timer is running
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Check if there are more sets to run
            if (currentSet < totalSets) {
              setIsResting(true);
              setRestTimeLeft(restTime);
              setCurrentSet(c => c + 1);
              if (soundEnabled) console.log('🔔 Set completed, rest time!');
              return 0; // Return 0 to avoid counting down from initialTime for one tick
            } else {
              // All sets completed
              setIsRunning(false);
              setIsCompleted(true);
              if (soundEnabled && completeSoundRef.current) {
                completeSoundRef.current.play();
              }
              if (bgmRef.current) {
                bgmRef.current.pause();
                bgmRef.current.currentTime = 0;
              }
              return 0;
            }
          }
          const newTime = prev - 1;
          // 在剩余5秒时播放音效
          if (newTime === 5 && soundEnabled && countdownSoundRef.current) {
            countdownSoundRef.current.currentTime = 0;
            countdownSoundRef.current.play();
          }
          return newTime;
        });
      }
    }, 1000);

    // The cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // The dependency array should only include what's necessary to re-trigger the interval setup.
  }, [isRunning, isResting, initialTime, restTime, currentSet, totalSets, soundEnabled]);

  const toggleTimer = () => {
    if (isCompleted) {
      resetTimer();
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
      }
    } else {
      if (!isRunning) {
        if (soundEnabled && startSoundRef.current) {
          startSoundRef.current.play();
        }
        if (bgmRef.current) {
          bgmRef.current.play();
        }
      } else {
        if (bgmRef.current) {
          bgmRef.current.pause();
        }
      }
      setIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
    setRestTimeLeft(restTime);
    setCurrentSet(1);
    setIsCompleted(false);
    setIsResting(false);
  };

  const changeTimerType = (type: TimerType) => {
    setTimerType(type);
    setInitialTime(timerTypes[type].defaultTime);
    setTimeLeft(timerTypes[type].defaultTime);
    resetTimer();
  };

  const setNewTime = (seconds: number) => {
    setTempInitialTime(seconds);
  };

  const confirmSettings = () => {
    setInitialTime(tempInitialTime);
    setTimeLeft(tempInitialTime);
    setTotalSets(tempTotalSets);
    setRestTime(tempRestTime);
    setRestTimeLeft(tempRestTime);
    // Reset all timer states to initial values
    setIsRunning(false);
    setCurrentSet(1);
    setIsCompleted(false);
    setIsResting(false);
    setShowSettings(false);
  };

  const cancelSettings = () => {
    setShowSettings(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (isResting) {
      return ((restTime - restTimeLeft) / restTime) * 100;
    }
    return ((initialTime - timeLeft) / initialTime) * 100;
  };

  const getTotalProgress = () => {
    const completedSets = currentSet - 1;
    const currentSetProgress = isResting ? 1 : (initialTime - timeLeft) / initialTime;
    return ((completedSets + currentSetProgress) / totalSets) * 100;
  };

  const presetTimes = [
    { label: '30 s', value: 30 },
    { label: '1 min', value: 60 },
    { label: '5 min', value: 300 },
    { label: '10 min', value: 600 },
    { label: '15 min', value: 900 },
    { label: '20 min', value: 1200 },
    { label: '25 min', value: 1500 },
    { label: '30 min', value: 1800 }
  ];

  const presetSets = [1, 2, 3, 4, 5, 6];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Dynamic background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br ${currentTimer.color} opacity-20 rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr ${currentTimer.color} opacity-20 rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r ${currentTimer.color} opacity-10 rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${currentTimer.color} shadow-lg transform hover:scale-105 transition-all duration-300`}>
              <currentTimer.icon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{currentTimer.name}</h1>
              <p className="text-gray-400 mt-1">{currentTimer.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${soundEnabled ? 'bg-white/10 text-white' : 'bg-gray-700 text-gray-400'}`}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${showSettings ? 'bg-white/10 text-white' : 'bg-gray-700 text-gray-400'}`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Timer type selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {Object.entries(timerTypes).map(([key, timer]) => (
            <button
              key={key}
              onClick={() => changeTimerType(key as TimerType)}
              className={`p-4 rounded-2xl transition-all duration-300 hover:scale-105 transform ${timerType === key
                ? `bg-gradient-to-r ${timer.color} shadow-lg`
                : 'bg-white/5 hover:bg-white/10'
                }`}
            >
              <timer.icon className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">{timer.name}</p>
            </button>
          ))}
        </div>

        {/* Settings modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Settings className="w-8 h-8" />
                  Timer Settings
                </h2>
                <button
                  onClick={cancelSettings}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-8">
                {/* Time settings */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Timer className="w-5 h-5" />
                    Set Time
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {presetTimes.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => setNewTime(preset.value)}
                        className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${tempInitialTime === preset.value
                          ? `bg-gradient-to-r ${currentTimer.color}`
                          : 'bg-white/10 hover:bg-white/20'
                          }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sets settings */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Repeat className="w-5 h-5" />
                    Set Count
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {presetSets.map((sets) => (
                      <button
                        key={sets}
                        onClick={() => setTempTotalSets(sets)}
                        className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${tempTotalSets === sets
                          ? `bg-gradient-to-r ${currentTimer.color}`
                          : 'bg-white/10 hover:bg-white/20'
                          }`}
                      >
                        {sets}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rest time settings */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Coffee className="w-5 h-5" />
                    Rest Time
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[5, 10, 15, 30].map((time) => (
                      <button
                        key={time}
                        onClick={() => setTempRestTime(time)}
                        className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${tempRestTime === time
                          ? `bg-gradient-to-r ${currentTimer.color}`
                          : 'bg-white/10 hover:bg-white/20'
                          }`}
                      >
                        {time}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Confirmation buttons */}
              <div className="flex justify-center gap-4 pt-6 border-t border-white/10">
                <button
                  onClick={cancelSettings}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSettings}
                  className={`px-8 py-3 bg-gradient-to-r ${currentTimer.color} hover:opacity-90 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                >
                  <Check className="w-5 h-5" />
                  Confirm Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main timer area */}
        <div className="text-center mb-12">
          {/* Set display */}
          {totalSets > 1 && (
            <div className="mb-8">
              <div className="text-2xl font-bold mb-4">
                Set {currentSet} of {totalSets}
              </div>
              <div className="w-full max-w-md mx-auto bg-white/10 rounded-full h-2">
                <div
                  className={`h-full bg-gradient-to-r ${currentTimer.color} rounded-full transition-all duration-500`}
                  style={{ width: `${getTotalProgress()}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Total Progress: {Math.round(getTotalProgress())}%
              </div>
            </div>
          )}

          {/* Time display */}
          <div className="relative">
            <div className={`text-8xl md:text-9xl font-bold mb-6 tracking-wider transition-all duration-500 ${isCompleted ? 'animate-bounce' : isRunning ? 'animate-pulse' : ''
              }`}>
              {isCompleted ? (
                <CheckCircle className="w-32 h-32 mx-auto text-green-500" />
              ) : (
                formatTime(isResting ? restTimeLeft : timeLeft)
              )}
            </div>

            {/* Circular progress */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeDasharray={`${getProgress()}, 100`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={isResting ? '#3B82F6' : '#06B6D4'} />
                    <stop offset="100%" stopColor={isResting ? '#8B5CF6' : '#10B981'} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{Math.round(getProgress())}%</span>
              </div>
            </div>

            <div className="text-2xl text-gray-300 mb-2">
              {isCompleted
                ? <div className="flex items-center justify-center gap-2"><CheckCircle className="w-8 h-8 text-green-500" />All Complete!</div>
                : isResting
                  ? <div className="flex items-center justify-center gap-2"><Bed className="w-8 h-8 text-blue-400" />Resting...</div>
                  : isRunning
                    ? <div className="flex items-center justify-center gap-2"><Zap className="w-8 h-8 text-yellow-400" />In Progress...</div>
                    : <div className="flex items-center justify-center gap-2"><Clock className="w-8 h-8 text-gray-400" />Ready to Start</div>}
            </div>

            {isResting && (
              <div className="text-lg text-blue-400 font-medium animate-pulse">
                Next set starting soon
              </div>
            )}
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex justify-center gap-6 mb-8">
          <button
            onClick={toggleTimer}
            className={`px-12 py-4 rounded-2xl font-bold text-xl flex items-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-lg ${isCompleted
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
              : isRunning
                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                : `bg-gradient-to-r ${currentTimer.color} hover:opacity-90`
              }`}
          >
            {isCompleted ? (
              <>
                <RotateCcw className="w-6 h-6" />
                Restart
              </>
            ) : isRunning ? (
              <>
                <Pause className="w-6 h-6" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                Start
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300 transform hover:scale-105"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
        </div>

        {/* Usage tips */}
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
            <currentTimer.icon className="w-6 h-6" />
            Usage Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
            <p>• Choose the right timer type</p>
            <p>• Adjust time and set settings</p>
            <p>• Stay focused, avoid distractions</p>
            <p>• Rest time is equally important</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;