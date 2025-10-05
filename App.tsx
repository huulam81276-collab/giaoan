
import React, { useState, useEffect } from 'react';
import { LessonPlanForm } from './components/LessonPlanForm';
import { LessonPlanDisplay } from './components/LessonPlanDisplay';
import { LoadingSpinner } from './components/icons/LoadingSpinner';
import { DocumentPlusIcon } from './components/icons/DocumentPlusIcon';
import { ApiKeyForm } from './components/ApiKeyForm';
import type { LessonPlanInput, GeneratedLessonPlan } from './types';
import { generateLessonPlanStream } from './services/geminiService';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LessonPlanInput>({
    teacherName: 'Nguyễn Văn A',
    subject: '',
    grade: '',
    duration: { level: 'THCS', periods: '' },
    lessonTitle: '',
    congVan: '5512',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedLessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('google-ai-api-key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('google-ai-api-key', key);
    setApiKey(key);
    setApiKeyError(null); 
  };

  const handleChangeApiKey = () => {
    localStorage.removeItem('google-ai-api-key');
    setApiKey(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files: File[] = Array.from(e.target.files);
      setSelectedFiles(files);
      
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(newPreviews);
    }
  };
  
  const handleFileRemove = (indexToRemove: number) => {
    URL.revokeObjectURL(imagePreviews[indexToRemove]);
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      setError('Mật khẩu chưa được thiết lập. Vui lòng làm mới trang và nhập lại.');
      return;
    }
    if (selectedFiles.length === 0) {
      setError('Vui lòng tải lên ít nhất một hình ảnh sách giáo khoa.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedPlan(null); 

    try {
      const imageParts = await Promise.all(
        selectedFiles.map(async (file) => {
          const base64Data = await fileToBase64(file);
          return {
            inlineData: {
              mimeType: file.type,
              data: base64Data,
            },
          };
        })
      );
      
      const stream = await generateLessonPlanStream(formData, imageParts, apiKey);
      let fullResponseText = '';

      for await (const chunk of stream) {
        fullResponseText += chunk.text;
      }
      
      try {
        const jsonString = fullResponseText.trim();

        if (!jsonString) {
          throw new Error("Phản hồi từ AI trống.");
        }
        
        const finalPlan: GeneratedLessonPlan = JSON.parse(jsonString);
        
        setFormData(prev => ({
            ...prev,
            lessonTitle: finalPlan.lessonTitle || prev.lessonTitle,
            subject: finalPlan.subject || prev.subject,
            grade: finalPlan.grade || prev.grade,
        }));
        
        setGeneratedPlan(finalPlan);
      } catch (parseErr) {
          console.error("Failed to parse the final JSON response:", parseErr);
          console.error("Raw response from API:", fullResponseText);
          setError('Đã xảy ra lỗi khi xử lý kết quả từ AI. Định dạng dữ liệu không hợp lệ.');
          setGeneratedPlan(null);
      }

    } catch (err) {
      console.error(err);
      const errorMessage = (err instanceof Error) ? err.message : 'Đã xảy ra lỗi không xác định.';
      
      if (errorMessage.startsWith('[API_KEY_ERROR]')) {
        const userFriendlyError = errorMessage.replace('[API_KEY_ERROR] ', '');
        setApiKeyError(userFriendlyError);
        handleChangeApiKey();
      } else {
        setError(errorMessage);
      }
      setGeneratedPlan(null); 
    } finally {
      setIsLoading(false);
    }
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <ApiKeyForm onSave={handleSaveApiKey} initialError={apiKeyError || undefined} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-12">
          <div className="inline-block bg-slate-800 text-indigo-400 p-3 rounded-xl mb-4 ring-1 ring-white/10">
             <DocumentPlusIcon className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 tracking-tight">
            SOẠN KẾ HOẠCH BÀI DẠY
          </h1>
           <div className="mt-4">
            <span className="inline-block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white text-sm font-bold px-5 py-2 rounded-full shadow-lg transform hover:scale-105 transition-transform">
              Bản miễn phí 7 ngày
            </span>
          </div>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Tạo giáo án chuyên nghiệp theo Công văn 5512 và 2345 từ hình ảnh Sách giáo khoa.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-lg p-6 md:p-8 rounded-2xl shadow-lg ring-1 ring-white/10">
            <LessonPlanForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              onFileChange={handleFileChange}
              imagePreviews={imagePreviews}
              onFileRemove={handleFileRemove}
            />
          </div>
          
          <div className="lg:col-span-3 bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-lg ring-1 ring-white/10 sticky top-8">
            <div className="p-6 md:p-8 h-[85vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-3">Kết quả Giáo án</h2>
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
                  <LoadingSpinner className="w-12 h-12 mb-4" />
                  <p className="text-lg font-medium animate-pulse">AI đang soạn bài, vui lòng chờ...</p>
                  <p className="text-sm max-w-sm mx-auto mt-2">AI đang phân tích và soạn giáo án hoàn chỉnh. Quá trình này có thể mất một chút thời gian.</p>
                </div>
              )}
              {error && (
                <div className="flex flex-col items-center justify-center h-full text-red-300 bg-red-900/50 p-4 rounded-lg border border-red-500/30">
                  <p className="font-semibold mb-2">Đã xảy ra lỗi</p>
                  <p className="text-sm text-center">{error}</p>
                </div>
              )}
              {!isLoading && !error && !generatedPlan && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center space-y-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" />
                  </svg>
                  <p className="font-semibold text-lg text-slate-300">Giáo án của bạn sẽ xuất hiện ở đây.</p>
                  <p className="text-sm">Hãy điền thông tin và tải ảnh SGK để AI bắt đầu soạn bài.</p>
                </div>
              )}
              {generatedPlan && (
                <LessonPlanDisplay plan={generatedPlan} basicInfo={formData} isLoading={isLoading} />
              )}
            </div>
          </div>
        </div>
        <footer className="text-center mt-16 pt-8 border-t border-slate-800 text-slate-400 text-sm">
            <p className="font-semibold text-slate-300">Trung tâm Tin học ứng dụng Bal Digitech</p>
            <p className="mt-2">Cung cấp: Tài khoản Canva, ứng dụng hỗ trợ giáo viên.</p>
            <p>Đào tạo: Trí tuệ nhân tạo, E-learning, ứng dụng AI trong giáo dục.</p>
            <p className="mt-2">
                Liên hệ đào tạo: <a href="tel:0972300864" className="text-indigo-400 hover:underline font-medium">0972.300.864 - Thầy Giới</a>
            </p>
            <div className="mt-4">
              <button
                onClick={handleChangeApiKey}
                className="text-xs text-slate-500 hover:text-indigo-400 transition-colors"
              >
                Thay đổi Mật khẩu
              </button>
            </div>
             <p className="mt-2 text-xs text-slate-500">
                Ứng dụng được phát triển bởi Thầy Giới.
            </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
