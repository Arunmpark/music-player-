import React, { useState, useRef } from 'react';
import { 
  X, 
  CloudUpload, 
  CheckCircle2, 
  FileAudio, 
  Sparkles, 
  AlertCircle,
  HardDrive
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const CloudUploadModal: React.FC = () => {
  const { isCloudUploadOpen, setIsCloudUploadOpen, uploadCloudTrack } = useMusic();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('Electronic');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isCloudUploadOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|flac|wav|aac|ogg|m4a)$/i)) {
      setErrorMsg('Please select an audio file (FLAC, WAV, MP3, AAC)');
      return;
    }

    setErrorMsg('');
    setSelectedFile(file);
    
    // Guess title and artist from filename
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    if (cleanName.includes('-')) {
      const parts = cleanName.split('-');
      setArtist(parts[0].trim());
      setTitle(parts.slice(1).join('-').trim());
    } else {
      setTitle(cleanName);
      setArtist('Original Artist');
    }
    setAlbum('Cloud Masters Locker');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(20);

    try {
      // Create object URL for client preview
      const localUrl = URL.createObjectURL(selectedFile);
      const isLossless = selectedFile.name.endsWith('.flac') || selectedFile.name.endsWith('.wav');
      const format = isLossless ? (selectedFile.name.endsWith('.flac') ? 'FLAC' : 'WAV') : 'MP3';

      setUploadProgress(60);

      await uploadCloudTrack({
        title: title || selectedFile.name,
        artist: artist || 'Original Artist',
        album: album || 'Cloud Masters',
        genre: genre || 'Master Upload',
        audioDataUrl: localUrl,
        format: format,
        fileSize: selectedFile.size,
        duration: 215
      });

      setUploadProgress(100);
      setIsSuccess(true);
      setTimeout(() => {
        setIsCloudUploadOpen(false);
        setIsSuccess(false);
        setSelectedFile(null);
        setIsUploading(false);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="bg-[#0f0a08] border border-[#1a1512] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1a1512] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#ff4e00]/10 text-[#ff4e00] border border-[#ff4e00]/20">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif italic text-white">Upload to Cloud Locker</h3>
              <p className="text-xs text-[#8e8279]">Sync uncompressed FLAC & WAV files across all devices</p>
            </div>
          </div>

          <button
            onClick={() => setIsCloudUploadOpen(false)}
            className="p-1.5 rounded-full hover:bg-[#140e0b] text-[#8e8279] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-[#ff4e00] bg-[#ff4e00]/10 scale-[1.01]'
                : selectedFile
                ? 'border-[#ff4e00]/50 bg-[#ff4e00]/5'
                : 'border-[#251d18] hover:border-[#ff4e00]/40 bg-[#140e0b]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.flac,.wav,.mp3,.aac,.m4a"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-[#ff4e00]/20 text-[#ff4e00] flex items-center justify-center mx-auto">
                  <FileAudio className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{selectedFile.name}</p>
                  <p className="text-[11px] text-[#8e8279] font-mono">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; High-Resolution Master
                  </p>
                </div>
                <span className="text-[10px] text-[#ff7300] hover:underline">Click or drop another to replace</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-[#140e0b] border border-[#251d18] text-[#8e8279] flex items-center justify-center mx-auto">
                  <CloudUpload className="w-6 h-6 text-[#ff7300]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Drag & drop your audio file</p>
                  <p className="text-[11px] text-[#6d5f56] mt-0.5">Supports 24-bit FLAC, WAV, MP3, AAC</p>
                </div>
                <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-[#1a1512] text-[#e0d8d0] border border-[#251d18]">
                  Browse Files
                </span>
              </div>
            )}
          </div>

          {/* Metadata Fields */}
          {selectedFile && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6d5f56]">Track Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 bg-[#0f0a08] border border-[#1a1512] focus:border-[#ff4e00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#6d5f56]">Artist</label>
                  <input
                    type="text"
                    required
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full mt-1 bg-[#0f0a08] border border-[#1a1512] focus:border-[#ff4e00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#6d5f56]">Genre</label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full mt-1 bg-[#0f0a08] border border-[#1a1512] focus:border-[#ff4e00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-[#8e8279]">
                <span>Encoding & Uploading to Cloud...</span>
                <span className="font-mono text-[#ff4e00]">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#0a0502] h-2 rounded-full overflow-hidden border border-[#1a1512]">
                <div
                  className="bg-gradient-to-r from-[#ff4e00] to-[#ffd000] h-full rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
              isSuccess
                ? 'bg-gradient-to-r from-[#ff4e00] to-[#ffd000] text-[#0a0502]'
                : selectedFile && !isUploading
                ? 'bg-gradient-to-r from-[#ff4e00] to-[#ffd000] hover:brightness-110 text-[#0a0502] active:scale-98 shadow-[#ff4e00]/20'
                : 'bg-[#140e0b] text-[#6d5f56] border border-[#1a1512] cursor-not-allowed'
            }`}
          >
            {isSuccess ? (
              <span className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Uploaded & Synced to Cloud
              </span>
            ) : isUploading ? (
              'Processing Audio File...'
            ) : (
              'Upload to Cloud Locker'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
