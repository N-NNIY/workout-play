import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, Activity, Timer, Repeat } from 'lucide-react';
import { t } from 'i18next';
import { X } from 'lucide-react';
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
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [showSetsModal, setShowSetsModal] = useState<boolean>(false);
  const [showRestModal, setShowRestModal] = useState<boolean>(false);
  const presetTimes = [
    { label: '30 s', value: 30 },
    { label: '1 min', value: 60 },
    { label: '2 min', value: 120 },
    { label: '3 min', value: 180 },
    { label: '5 min', value: 300 },
    { label: '10 min', value: 600 }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
      {/* 模糊背景遮罩 */}
      {(showTimeModal || showSetsModal || showRestModal) && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => {
          setShowTimeModal(false);
          setShowSetsModal(false); 
          setShowRestModal(false);
        }} />
      )}

      <div className={`w-full max-w-4/5 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 space-y-8 transition-all duration-300 ${(showTimeModal || showSetsModal || showRestModal) ? 'blur-sm' : ''}`}>
        {/* 顶部栏 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
            <div className="p-2 bg-gray-100 rounded-xl">
              <Activity className="w-6 h-6 text-gray-600" />
            </div>
            {t('stretchTimer')}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-all duration-200"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-all duration-200"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 设置面板 */}
        {showSettings && (
          <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-6 space-y-6">
            {/* 时间设置 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Timer className="w-4 h-4" />
                {t('stretchTime')}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setShowTimeModal(true)}
                  className="col-span-3 p-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md"
                >
                  选择时间: {presetTimes.find(p => p.value === selectedTime)?.label || '1 min'}
                </button>
              </div>
            </div>

            {/* 组数设置 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                {t('stretchSets')}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setShowSetsModal(true)}
                  className="p-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md"
                >
                  选择组数: {totalSets} {t('sets')}
                </button>
              </div>
            </div>

            {/* 休息时间设置 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">{t('restTimeBetweenSets')}</h3>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setShowRestModal(true)}
                  className="p-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md"
                >
                  选择休息时间: {restTime} s
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 组数显示 */}
        <div className="text-center bg-gray-50/50 rounded-2xl p-4">
          <div className="text-lg font-medium text-gray-600 mb-2">
            {currentSet} {t('sets')} / {totalSets} {t('sets')}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-full bg-gray-500 rounded-full transition-all duration-500"
              style={{ width: `${getTotalProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* 时间显示 */}
        <div className="text-center">
          <div className="text-6xl font-bold text-gray-800 mb-3">
            {isCompleted ? '🎉' : isResting ? formatTime(restTimeLeft) : formatTime(timeLeft)}
          </div>
          <div className="text-lg text-gray-600 mb-2">
            {t(isCompleted
              ? 'completedAll'
              : isResting
                ? 'resting'
                : isRunning
                  ? 'stretching'
                  : 'readyToStart')}
          </div>
          {isResting && (
            <div className="text-sm text-gray-500">
              {t('nextSet')}
            </div>
          )}
        </div>

        {/* 当前进度条 */}
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${isResting ? 'bg-blue-400' : 'bg-gray-600'
                }`}
              style={{ width: `${getProgress()}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-500">
            {t(isResting ? 'rest' : 'stretch')} {t('progress')}: {Math.round(getProgress())}%
          </p>
        </div>

        {/* 控制按钮 */}
        <div className="flex gap-4">
          <button
            onClick={toggleTimer}
            className={`flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all duration-200 text-lg transform hover:scale-105 ${isCompleted
                ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl'
                : isRunning
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl'
                  : 'bg-gray-700 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
              }`}
          >
            {isCompleted ? (
              <>
                <RotateCcw className="w-6 h-6" />
                {t('restart')}
              </>
            ) : isRunning ? (
              <>
                <Pause className="w-6 h-6" />
                {t('pause')}
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                {t('start')}
              </>
            )}
          </button>
          <button
            onClick={resetTimer}
            className="px-6 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl text-gray-700 font-semibold flex items-center gap-2 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
          >
            <RotateCcw className="w-5 h-5" />
            {t('reset')}
          </button>
        </div>

        {/* 拉伸提示 */}
        <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-6 space-y-3 text-sm text-gray-600">
          <h3 className="font-semibold flex items-center gap-2 text-gray-700 text-base">
            <Activity className="w-5 h-5 text-gray-500" />
            {t('stretchTipsTitle')}
          </h3>
          <div className="space-y-2">
            <p className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">•</span>
              <span>{t('tipBreath')}</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">•</span>
              <span>{t('tipGentle')}</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">•</span>
              <span>{t('tipFocus')}</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">•</span>
              <span>{t('tipStop')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 时间选择弹窗 */}
      {showTimeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 max-w-md w-full transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Timer className="w-5 h-5 text-gray-600" />
                {t('selectStretchTime')}
              </h2>
              <button
                onClick={() => setShowTimeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {presetTimes.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => {
                    setNewTime(preset.value);
                    setShowTimeModal(false);
                  }}
                  className={`p-4 rounded-2xl text-base font-medium transition-all duration-200 transform hover:scale-105 ${selectedTime === preset.value
                      ? 'bg-gray-800 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md border border-gray-200'
                    }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowTimeModal(false)}
                className="w-full py-3 bg-gray-800 text-white rounded-2xl font-medium hover:bg-gray-900 transition-colors"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 组数选择弹窗 */}
      {showSetsModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 max-w-md w-full transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Repeat className="w-5 h-5 text-gray-600" />
                选择拉伸组数
              </h2>
              <button
                onClick={() => setShowSetsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {presetSets.map((sets) => (
                <button
                  key={sets}
                  onClick={() => {
                    setNewSets(sets);
                    setShowSetsModal(false);
                  }}
                  className={`p-4 rounded-2xl text-base font-medium transition-all duration-200 transform hover:scale-105 ${totalSets === sets
                      ? 'bg-gray-800 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md border border-gray-200'
                    }`}
                >
                  {sets} 组
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowSetsModal(false)}
                className="w-full py-3 bg-gray-800 text-white rounded-2xl font-medium hover:bg-gray-900 transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 休息时间选择弹窗 */}
      {showRestModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 max-w-md w-full transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Timer className="w-5 h-5 text-gray-600" />
                选择休息时间
              </h2>
              <button
                onClick={() => setShowRestModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {presetRestTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => {
                    setNewRestTime(time);
                    setShowRestModal(false);
                  }}
                  className={`p-4 rounded-2xl text-base font-medium transition-all duration-200 transform hover:scale-105 ${restTime === time
                      ? 'bg-gray-800 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md border border-gray-200'
                    }`}
                >
                  {time} 秒
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowRestModal(false)}
                className="w-full py-3 bg-gray-800 text-white rounded-2xl font-medium hover:bg-gray-900 transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StretchCountdownPage;