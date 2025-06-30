import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, Activity } from 'lucide-react';

const StretchCountdownPage = () => {
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [initialTime, setInitialTime] = useState<number>(60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedTime, setSelectedTime] = useState<number>(60);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const presetTimes = [
    { label: '30秒', value: 30 },
    { label: '1分钟', value: 60 },
    { label: '2分钟', value: 120 },
    { label: '5分钟', value: 300 },
    { label: '10分钟', value: 600 },
    { label: '15分钟', value: 900 }
  ];

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            if (soundEnabled) console.log('🔔 倒计时完成！');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
  }
};

  }, [isRunning, timeLeft, soundEnabled]);

  const toggleTimer = () => {
    if (isCompleted) resetTimer();
    else setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
    setIsCompleted(false);
  };

  const setNewTime = (seconds: number): void => {
    setSelectedTime(seconds);
    setInitialTime(seconds);
    setTimeLeft(seconds);
    setIsRunning(false);
    setIsCompleted(false);
    setShowSettings(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => ((initialTime - timeLeft) / initialTime) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-6">
        {/* 顶部栏 */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
            <Activity className="w-6 h-6 text-indigo-500" />
            拉伸倒计时
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 时间设置 */}
        {showSettings && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-700">选择时间</h3>
            <div className="grid grid-cols-3 gap-2">
              {presetTimes.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setNewTime(preset.value)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTime === preset.value
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 时间显示 */}
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 mb-1">
            {isCompleted ? '🎉' : formatTime(timeLeft)}
          </div>
          <p className="text-sm text-gray-500">
            {isCompleted ? '拉伸完成！' : isRunning ? '正在计时...' : '准备开始'}
          </p>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all"
            style={{ width: `${getProgress()}%` }}
          ></div>
        </div>
        <p className="text-center text-xs text-gray-500">进度: {Math.round(getProgress())}%</p>

        {/* 按钮 */}
        <div className="flex justify-center gap-3">
          <button
            onClick={toggleTimer}
            className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
              isCompleted
                ? 'bg-green-600 text-white hover:bg-green-700'
                : isRunning
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-indigo-500 text-white hover:bg-indigo-600'
            }`}
          >
            {isCompleted ? <RotateCcw className="w-5 h-5" /> : isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isCompleted ? '重新开始' : isRunning ? '暂停' : '开始'}
          </button>
          <button
            onClick={resetTimer}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
        </div>

        {/* 拉伸提示 */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1 text-sm text-gray-600">
          <h3 className="font-medium flex items-center gap-1 text-gray-700">
            <Activity className="w-4 h-4 text-indigo-500" />
            拉伸提示
          </h3>
          <p>• 保持深呼吸，放松身体</p>
          <p>• 动作要缓慢，避免急躁</p>
          <p>• 感受肌肉的伸展</p>
          <p>• 如有不适请立即停止</p>
        </div>
      </div>
    </div>
  );
};

export default StretchCountdownPage;
