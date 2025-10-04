
import React from 'react';
import type { LessonPlanInput } from '../types';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { XCircleIcon } from './icons/XCircleIcon';

interface LessonPlanFormProps {
  formData: LessonPlanInput;
  setFormData: React.Dispatch<React.SetStateAction<LessonPlanInput>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreviews: string[];
  onFileRemove: (index: number) => void;
}

export const LessonPlanForm: React.FC<LessonPlanFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  isLoading,
  onFileChange,
  imagePreviews,
  onFileRemove,
}) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'level' || name === 'periods') {
      setFormData((prev) => ({
        ...prev,
        duration: { ...prev.duration, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const inputStyles = "w-full px-3 py-2 bg-slate-900/70 text-slate-100 border-0 rounded-md shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm transition";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 mb-6">Thông tin bài giảng</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="teacherName" className="block text-sm font-medium text-slate-300 mb-1">
            Tên giáo viên
          </label>
          <input
            type="text"
            id="teacherName"
            name="teacherName"
            value={formData.teacherName}
            onChange={handleInputChange}
            className={inputStyles}
            required
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-1">
            Môn học
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="AI tự xác định nếu trống"
            className={inputStyles}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-slate-300 mb-1">
            Lớp
          </label>
          <input
            type="text"
            id="grade"
            name="grade"
            value={formData.grade}
            onChange={handleInputChange}
            placeholder="AI tự xác định nếu trống"
            className={inputStyles}
          />
        </div>
         <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
                Thời gian thực hiện
            </label>
            <div className="grid grid-cols-2 gap-2">
                <select
                    name="level"
                    value={formData.duration.level}
                    onChange={handleInputChange}
                    className={inputStyles}
                >
                    <option value="THCS">Cấp THCS (45 phút)</option>
                    <option value="TieuHoc">Cấp Tiểu học (35 phút)</option>
                </select>
                <input
                    type="number"
                    name="periods"
                    value={formData.duration.periods}
                    onChange={handleInputChange}
                    placeholder="Số tiết"
                    min="1"
                    className={inputStyles + " [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"}
                />
            </div>
            <p className="text-xs text-slate-400 mt-1">Để trống số tiết để AI tự đề xuất.</p>
        </div>
      </div>
      
      <div>
        <label htmlFor="lessonTitle" className="block text-sm font-medium text-slate-300 mb-1">
          Tên bài dạy (tùy chọn)
        </label>
        <input
          type="text"
          id="lessonTitle"
          name="lessonTitle"
          value={formData.lessonTitle}
          onChange={handleInputChange}
          placeholder="AI sẽ tự xác định nếu để trống"
          className={inputStyles}
        />
      </div>

      <div>
          <label htmlFor="congVan" className="block text-sm font-medium text-slate-300 mb-1">
            Mẫu giáo án theo
          </label>
          <select
            id="congVan"
            name="congVan"
            value={formData.congVan}
            onChange={handleInputChange}
            className={inputStyles}
          >
            <option value="5512">Công văn 5512</option>
          </select>
        </div>


      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Tải lên hình ảnh Sách giáo khoa
        </label>
        {imagePreviews.length > 0 ? (
          <div className="mt-2">
            <div className="grid grid-cols-3 gap-3">
               {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group aspect-square">
                  <img src={preview} alt={`preview ${index}`} className="w-full h-full object-cover rounded-lg shadow-sm ring-1 ring-white/10" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => onFileRemove(index)}
                      className="text-white hover:text-red-400 transition-colors"
                      aria-label="Remove image"
                    >
                      <XCircleIcon className="w-8 h-8" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
             <label htmlFor="file-upload" className="relative mt-3 inline-flex items-center cursor-pointer rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 focus-within:ring-indigo-500">
                <span>Thêm hoặc thay đổi ảnh...</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={onFileChange} />
              </label>
          </div>
        ) : (
          <div className="mt-2">
             <label htmlFor="file-upload" className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-colors">
                 <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-2 text-sm text-slate-400">
                        <span className="font-semibold text-indigo-400">Nhấn để tải lên</span> hoặc kéo thả
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        PNG, JPG, GIF
                      </p>
                 </div>
                 <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={onFileChange} />
             </label>
          </div>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="w-5 h-5" />
              <span className="animate-pulse">Đang tạo...</span>
            </>
          ) : (
            'Tạo Giáo án'
          )}
        </button>
      </div>
    </form>
  );
};
