import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, Activity, Timer, Repeat } from 'lucide-react';

const StretchCountdownPage = () => {
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [initialTime, setInitialTime] = useState<number>(60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedTime, setSelectedTime] = useState<number>(60);
  const [totalSets, setTotalSets] = useState<number>(1);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [restTime, setRestTime] = useState<number>(5);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [restTimeLeft, setRestTimeLeft] = useState<number>(5);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const presetTimes = [
    { label: '30秒', value: 30 },
    { label: '1分钟', value: 60 },
    { label: '2分钟', value: 120 },
    { label: '3分钟', value: 180 },
    { label: '5分钟', value: 300 },
    { label: '10分钟', value: 600 }
  ];

  const presetSets = [1, 2, 3, 4, 5, 6];
  const presetRestTimes = [3, 5, 10, 15, 20, 30];

  useEffect(() => {
    if (isRunning) {
      if (isResting && restTimeLeft > 0) {
        // 休息倒计时
        intervalRef.current = setInterval(() => {
          setRestTimeLeft(prev => {
            if (prev <= 1) {
              setIsResting(false);
              setTimeLeft(initialTime);
              if (soundEnabled) console.log('🔔 休息结束，开始下一组！');
              return restTime;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (!isResting && timeLeft > 0) {
        // 运动倒计时
        intervalRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              if (currentSet < totalSets) {
                // 还有下一组
                setIsResting(true);
                setRestTimeLeft(restTime);
                setCurrentSet(c => c + 1);
                if (soundEnabled) console.log('🔔 本组完成，开始休息！');
              } else {
                // 全部完成
                setIsRunning(false);
                setIsCompleted(true);
                if (soundEnabled) console.log('🎉 全部拉伸完成！');
              }
              return initialTime;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, restTimeLeft, isResting, currentSet, totalSets, initialTime, restTime, soundEnabled]);

  const toggleTimer = () => {
    if (isCompleted) {
      resetTimer();
    } else {
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

  const setNewTime = (seconds: number): void => {
    setSelectedTime(seconds);
    setInitialTime(seconds);
    setTimeLeft(seconds);
    resetTimer();
    setShowSettings(false);
  };

  const setNewSets = (sets: number): void => {
    setTotalSets(sets);
    resetTimer();
  };

  const setNewRestTime = (seconds: number): void => {
    setRestTime(seconds);
    setRestTimeLeft(seconds);
    resetTimer();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (isResting) {
      return ((restTime - restTimeLeft) / restTime) * 100;
    }
    return ((initialTime - timeLeft) / initialTime) * 100;
  };

  const getTotalProgress = (): number => {
    const completedSets = currentSet - 1;
    const currentSetProgress = isResting ? 1 : (initialTime - timeLeft) / initialTime;
    return ((completedSets + currentSetProgress) / totalSets) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4/5 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8 space-y-8">
        {/* 顶部栏 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-3 text-stone-800">
            <div className="p-2 bg-stone-100 rounded-xl">
              <Activity className="w-6 h-6 text-stone-600" />
            </div>
            拉伸计时器
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-600 transition-all duration-200"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-600 transition-all duration-200"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 设置面板 */}
        {showSettings && (
          <div className="bg-stone-50/80 border border-stone-200 rounded-2xl p-6 space-y-6">
            {/* 时间设置 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <Timer className="w-4 h-4" />
                拉伸时间
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {presetTimes.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setNewTime(preset.value)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedTime === preset.value
                        ? 'bg-stone-600 text-white shadow-lg scale-105'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 组数设置 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                拉伸组数
              </h3>
              <div className="grid grid-cols-6 gap-2">
                {presetSets.map((sets) => (
                  <button
                    key={sets}
                    onClick={() => setNewSets(sets)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      totalSets === sets
                        ? 'bg-stone-600 text-white shadow-lg scale-105'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300'
                    }`}
                  >
                    {sets}组
                  </button>
                ))}
              </div>
            </div>

            {/* 休息时间设置 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-stone-700">组间休息时间</h3>
              <div className="grid grid-cols-3 gap-2">
                {presetRestTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setNewRestTime(time)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      restTime === time
                        ? 'bg-stone-600 text-white shadow-lg scale-105'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300'
                    }`}
                  >
                    {time}秒
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 组数显示 */}
        <div className="text-center bg-stone-50/50 rounded-2xl p-4">
          <div className="text-lg font-medium text-stone-600 mb-2">
            第 {currentSet} 组 / 共 {totalSets} 组
          </div>
          <div className="w-full bg-stone-200 rounded-full h-2">
            <div
              className="h-full bg-stone-400 rounded-full transition-all duration-500"
              style={{ width: `${getTotalProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* 时间显示 */}
        <div className="text-center">
          <div className="text-6xl font-bold text-stone-800 mb-3">
            {isCompleted ? '🎉' : isResting ? formatTime(restTimeLeft) : formatTime(timeLeft)}
          </div>
          <div className="text-lg text-stone-600 mb-2">
            {isCompleted 
              ? '全部拉伸完成！' 
              : isResting 
                ? '休息中...' 
                : isRunning 
                  ? '正在拉伸...' 
                  : '准备开始'}
          </div>
          {isResting && (
            <div className="text-sm text-stone-500">
              下一组即将开始
            </div>
          )}
        </div>

        {/* 当前进度条 */}
        <div className="space-y-2">
          <div className="w-full bg-stone-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                isResting ? 'bg-blue-400' : 'bg-stone-500'
              }`}
              style={{ width: `${getProgress()}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-stone-500">
            {isResting ? '休息' : '拉伸'}进度: {Math.round(getProgress())}%
          </p>
        </div>

        {/* 控制按钮 */}
        <div className="flex gap-4">
          <button
            onClick={toggleTimer}
            className={`flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all duration-200 text-lg ${
              isCompleted
                ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl'
                : isRunning
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl'
                : 'bg-stone-600 text-white hover:bg-stone-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isCompleted ? (
              <>
                <RotateCcw className="w-6 h-6" />
                重新开始
              </>
            ) : isRunning ? (
              <>
                <Pause className="w-6 h-6" />
                暂停
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                开始
              </>
            )}
          </button>
          <button
            onClick={resetTimer}
            className="px-6 py-4 bg-stone-100 hover:bg-stone-200 rounded-2xl text-stone-700 font-semibold flex items-center gap-2 transition-all duration-200"
          >
            <RotateCcw className="w-5 h-5" />
            重置
          </button>
        </div>

        {/* 拉伸提示 */}
        <div className="bg-stone-50/50 border border-stone-200 rounded-2xl p-6 space-y-3 text-sm text-stone-600">
          <h3 className="font-semibold flex items-center gap-2 text-stone-700 text-base">
            <Activity className="w-5 h-5 text-stone-500" />
            拉伸要点
          </h3>
          <div className="space-y-2">
            <p className="flex items-start gap-2">
              <span className="text-stone-400 mt-0.5">•</span>
              <span>保持深呼吸，让身体自然放松</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-stone-400 mt-0.5">•</span>
              <span>动作缓慢温和，避免过度用力</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-stone-400 mt-0.5">•</span>
              <span>感受肌肉的伸展，保持专注</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-stone-400 mt-0.5">•</span>
              <span>如有不适或疼痛请立即停止</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StretchCountdownPage;