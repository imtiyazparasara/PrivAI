import React, { useState, useEffect } from 'react';
import { getStats } from '../services/textProcessingService';
import { initLLM, generateArticle, LLMStatus } from '../services/llmService';
import { PenTool, Copy, Check, Trash2, RefreshCw, ArrowRight, FileText } from 'lucide-react';

const ArticlePage: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState('');
  const [requirements, setRequirements] = useState('');
  const [wordCount, setWordCount] = useState<number>(500);
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [copied, setCopied] = useState(false);
  const [llmStatus, setLlmStatus] = useState<LLMStatus>({ status: 'idle', progress: '', progressValue: 0 });

  const outputStats = getStats(outputText);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      setElapsedTime(0);
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      // Initialize LLM if needed
      if (llmStatus.status !== 'ready') {
        await initLLM((status) => setLlmStatus(status));
      }
      const result = await generateArticle(
        topic,
        format,
        requirements,
        wordCount,
        (p) => setProgress(p)
      );
      setOutputText(result);
    } catch (error) {
      console.error("Article generation failed:", error);
      alert("Failed to generate article. Please try again.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearInputs = () => {
    setTopic('');
    setFormat('');
    setRequirements('');
    setWordCount(500);
    setOutputText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Article Generator</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Create custom articles with specific topics, formats, and requirements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* Settings Card */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6 transition-colors">

            {/* Model Loading Progress */}
            {llmStatus.status === 'loading' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex justify-between text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                  <span>{llmStatus.progress}</span>
                  <span>{Math.round(llmStatus.progressValue * 100)}%</span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                  <div
                    className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${llmStatus.progressValue * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Topic Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-wider">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., The Future of AI"
                  className="w-full p-3 rounded-lg bg-slate-100 dark:bg-slate-700 border-none text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Format Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-wider">Format</label>
                <input
                  type="text"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  placeholder="e.g., Narrative, News, Blog Post"
                  className="w-full p-3 rounded-lg bg-slate-100 dark:bg-slate-700 border-none text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Requirements Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-wider">Requirements</label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="e.g., Include 3 key statistics, use a friendly tone..."
                  className="w-full p-3 h-32 rounded-lg bg-slate-100 dark:bg-slate-700 border-none text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              {/* Word Count Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-wider">Word Count</label>
                <input
                  type="number"
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value) || 0)}
                  placeholder="500"
                  className="w-full p-3 rounded-lg bg-slate-100 dark:bg-slate-700 border-none text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isProcessing || !topic}
            className={`w-full py-4 px-6 rounded-xl flex items-center justify-center gap-2 text-lg font-bold text-white shadow-lg transition-all transform active:scale-[0.98] ${isProcessing || !topic
              ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 hover:shadow-indigo-200 dark:hover:shadow-none'
              }`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center text-sm">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating... {progress > 0 && `${progress}%`}
                </div>
                {progress > 0 && (
                  <span className="text-xs opacity-80 font-normal mt-1">
                    {elapsedTime}s elapsed
                  </span>
                )}
              </div>
            ) : (
              <>
                <PenTool className="w-5 h-5" />
                Generate Article
              </>
            )}
          </button>
          
           <button
                onClick={clearInputs}
                className="w-full py-2 px-4 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Clear All
            </button>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl flex-1 flex flex-col overflow-hidden relative h-[600px] lg:h-auto transition-colors">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Generated Article</span>
              <button
                onClick={handleCopy}
                disabled={!outputText}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${copied
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                  }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/30 relative">
              {outputText ? (
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-slate-800 dark:text-slate-200 leading-relaxed">
                  {outputText}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                  <FileText className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-sm font-medium">Your article will appear here</p>
                </div>
              )}
              {outputText && (
                <div className="absolute bottom-4 right-6 text-xs text-slate-400 dark:text-slate-500 font-medium pointer-events-none bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded backdrop-blur-sm">
                  {outputStats.words} words | {outputStats.chars} chars
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ArticlePage;
