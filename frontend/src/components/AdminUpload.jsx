import { useParams, NavLink } from 'react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../utils/axiosClient';

function AdminUpload() {
  const { problemId } = useParams();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors,
  } = useForm();

  const selectedFile = watch('videoFile')?.[0];

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data) => {
    const file = data.videoFile[0];
    setUploading(true);
    setUploadProgress(0);
    clearErrors();

    try {
      const { data: sigData } = await axiosClient.get(`/video/create/${problemId}`);
      const { signature, timestamp, public_id, api_key, upload_url } = sigData;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('public_id', public_id);
      formData.append('api_key', api_key);

      const { data: cloudinaryResult } = await axios.post(upload_url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      const { data: metaData } = await axiosClient.post('/video/save', {
        problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
      });

      setUploadedVideo(metaData.videoSolution);
      reset();
    } catch (err) {
      setError('root', {
        type: 'manual',
        message: err.response?.data?.message || 'Upload failed. Please try again.',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">

      {/* Navbar */}
      <nav className="bg-base-100 border-b border-base-300 px-6 h-13 flex items-center justify-between sticky top-0 z-10">
        <NavLink to="/" className="flex items-center gap-2 font-medium text-base">
          <div className="w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          CodeForge
        </NavLink>
        <NavLink to="/admin"
          className="flex items-center gap-1.5 text-sm text-base-content/60 border border-base-300 px-3 py-1.5 rounded-lg hover:bg-base-200 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          Admin panel
        </NavLink>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-xl font-medium mb-1">Upload editorial video</h1>
        <p className="text-sm text-base-content/50 mb-6">
          Upload a video solution for problem <span className="font-mono text-base-content/70">#{problemId}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* File picker */}
          <div className="bg-base-100 border border-base-300 rounded-2xl p-6 mb-4">
            <label className="block text-xs font-medium text-base-content/60 mb-3">
              Video file
            </label>

            {/* Drop zone style */}
            <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors
              ${errors.videoFile
                ? 'border-error bg-red-50'
                : selectedFile
                ? 'border-amber-300 bg-amber-50'
                : 'border-base-300 hover:border-base-content/30 bg-base-200'}`}>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                disabled={uploading}
                {...register('videoFile', {
                  required: 'Please select a video file',
                  validate: {
                    isVideo: (files) =>
                      files?.[0]?.type.startsWith('video/') || 'Please select a valid video file',
                    fileSize: (files) =>
                      !files?.[0] || files[0].size <= 100 * 1024 * 1024 || 'File must be under 100 MB',
                  },
                })}
              />

              {selectedFile ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-base-content/80 truncate max-w-xs">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-base-content/50 mt-1">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <span className="text-xs text-amber-600 font-medium">Click to change file</span>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center">
                    <svg className="w-5 h-5 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-base-content/70">Click to select a video</p>
                    <p className="text-xs text-base-content/40 mt-1">MP4, MOV, AVI up to 100 MB</p>
                  </div>
                </>
              )}
            </label>

            {errors.videoFile && (
              <p className="text-xs text-error mt-2">{errors.videoFile.message}</p>
            )}
          </div>

          {/* Upload progress */}
          {uploading && (
            <div className="bg-base-100 border border-base-300 rounded-2xl p-5 mb-4">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-base-content/70 font-medium">Uploading...</span>
                <span className="font-medium text-amber-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-base-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%`, background: '#f5a623' }}
                />
              </div>
              <p className="text-xs text-base-content/40 mt-2">
                Please don't close this page while uploading
              </p>
            </div>
          )}

          {/* Error */}
          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          {/* Success */}
          {uploadedVideo && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-emerald-700 mb-1">Upload successful!</p>
              <div className="text-xs text-emerald-600 space-y-0.5">
                <p>Duration: {formatDuration(uploadedVideo.duration)}</p>
                <p>Uploaded: {new Date(uploadedVideo.uploadedAt).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full h-11 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: '#f5a623' }}>
            {uploading
              ? <><span className="loading loading-spinner loading-xs" /> Uploading...</>
              : <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  Upload video
                </>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminUpload;