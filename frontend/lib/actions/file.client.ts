// Client-side file actions (runs in browser)
import { smartHttpClientClient } from '../utils';

export interface UploadFileProps {
  file: File;
  ownerId: string;
  accountId: string;
  path: string;
  onProgress?: (progress: number) => void;
}

// Client-side upload function with progress tracking (runs in browser)
export const uploadFileClient = async ({
  file,
  ownerId,
  accountId,
  path,
  onProgress,
}: UploadFileProps) => {
  try {
    console.log('🔍 Client upload started for file:', file.name, 'Size:', file.size);
    console.log('🔍 Owner ID:', ownerId);
    console.log('🔍 Account ID:', accountId);
    
    // Get token from cookies in client-side
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const token = getCookie('aws-session');
    const tokenFromLocalStorage = localStorage.getItem('aws-session');
    
    const finalToken = token || tokenFromLocalStorage;
    
    if (!finalToken) {
      throw new Error("No authentication token");
    }
    
    console.log('🔍 Using token:', finalToken ? 'Present' : 'Missing');

    // For large files (>5MB), use chunked upload
    let CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks
    const isLargeFile = file.size > 5 * 1024 * 1024; // 5MB threshold
    
    // For very large files (>50MB), use smaller chunks to avoid memory issues
    if (file.size > 50 * 1024 * 1024) {
      CHUNK_SIZE = 1 * 1024 * 1024; // 1MB chunks for very large files
    }
    
    console.log('🔍 File upload details:', {
      fileName: file.name,
      fileSize: file.size,
      fileSizeMB: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      isLargeFile,
      chunkSize: CHUNK_SIZE / (1024 * 1024) + ' MB',
      threshold: '5 MB'
    });

    if (isLargeFile) {
      console.log('🔍 Large file detected, using chunked upload');
      try {
        return await uploadLargeFile(file, finalToken, onProgress);
      } catch (error) {
        console.error('🔍 Chunked upload failed, falling back to direct upload:', error);
        // For files that are just slightly over the threshold, try direct upload as fallback
        if (file.size <= 10 * 1024 * 1024) { // Only fallback for files under 10MB
          console.log('🔍 Attempting fallback to direct upload');
          return await uploadSmallFile(file, finalToken, onProgress);
        } else {
          throw error; // Re-throw for very large files
        }
      }
    } else {
      console.log('🔍 Small file, using direct upload');
      return await uploadSmallFile(file, finalToken, onProgress);
    }
  } catch (error) {
    console.error('🔍 Client upload error:', error);
    throw error;
  }
};

// Upload small files directly
const uploadSmallFile = async (
  file: File, 
  token: string, 
  onProgress?: (progress: number) => void
) => {
  // Show initial progress
  if (onProgress) onProgress(10);

  // Convert file to base64 with progress updates
  const arrayBuffer = await file.arrayBuffer();
  if (onProgress) onProgress(30);
  
  const base64Data = Buffer.from(arrayBuffer).toString('base64');
  if (onProgress) onProgress(50);
  
  console.log('🔍 File converted to base64, length:', base64Data.length);

  // Make the upload request
  const response = await smartHttpClientClient(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileData: base64Data,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    }),
  });

  if (onProgress) onProgress(90);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🔍 Upload error response:', errorText);
    throw new Error(`Failed to upload file: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  if (onProgress) onProgress(100);
  
  console.log('🔍 Upload successful:', result);
  return result;
};

// Upload large files in chunks
const uploadLargeFile = async (
  file: File, 
  token: string, 
  onProgress?: (progress: number) => void
) => {
  const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  
  console.log(`🔍 Uploading ${totalChunks} chunks for file: ${file.name}`);
  
  // Initialize upload
  if (onProgress) onProgress(5);
  
  let uploadId, fileId;
  try {
    const initResponse = await smartHttpClientClient(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/upload/init`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        totalChunks,
      }),
    });

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      throw new Error(`Failed to initialize upload: ${initResponse.status} ${errorText}`);
    }

    const response = await initResponse.json();
    uploadId = response.uploadId;
    fileId = response.fileId;
    
    console.log('🔍 Upload initialized with ID:', uploadId);
    
    if (!uploadId || !fileId) {
      throw new Error('Invalid response from upload initialization');
    }
  } catch (error) {
    console.error('🔍 Failed to initialize upload:', error);
    throw new Error(`Upload initialization failed: ${error.message}`);
  }

  if (onProgress) onProgress(10);

  // Upload chunks
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    try {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      
      const chunkArrayBuffer = await chunk.arrayBuffer();
      const chunkBase64 = Buffer.from(chunkArrayBuffer).toString('base64');
      
      console.log(`🔍 Uploading chunk ${chunkIndex + 1}/${totalChunks} (${chunk.size} bytes)`);
      
      const chunkResponse = await smartHttpClientClient(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/upload/chunk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadId,
          fileId,
          chunkIndex,
          chunkData: chunkBase64,
          isLastChunk: chunkIndex === totalChunks - 1,
        }),
      });

      if (!chunkResponse.ok) {
        const errorText = await chunkResponse.text();
        throw new Error(`Failed to upload chunk ${chunkIndex}: ${chunkResponse.status} ${errorText}`);
      }

      // Update progress (10% to 90% for chunks)
      const chunkProgress = 10 + Math.round(((chunkIndex + 1) / totalChunks) * 80);
      if (onProgress) onProgress(chunkProgress);
      
      console.log(`🔍 Uploaded chunk ${chunkIndex + 1}/${totalChunks} (${chunkProgress}%)`);
      
      // Small delay to prevent overwhelming the server
      if (chunkIndex < totalChunks - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`🔍 Error uploading chunk ${chunkIndex}:`, error);
      throw new Error(`Failed to upload chunk ${chunkIndex}: ${error.message}`);
    }
  }

  // Complete upload
  if (onProgress) onProgress(95);
  
  try {
    const completeResponse = await smartHttpClientClient(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/upload/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uploadId,
        fileId,
      }),
    });

    if (!completeResponse.ok) {
      const errorText = await completeResponse.text();
      throw new Error(`Failed to complete upload: ${completeResponse.status} ${errorText}`);
    }

    const result = await completeResponse.json();
    if (onProgress) onProgress(100);
    
    console.log('🔍 Large file upload completed:', result);
    return result;
  } catch (error) {
    console.error('🔍 Failed to complete upload:', error);
    throw new Error(`Upload completion failed: ${error.message}`);
  }
};

// Client-side file management functions for live updates
export const deleteFileClient = async (fileId: string, bucketFileId: string) => {
  try {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const token = getCookie('aws-session');
    const tokenFromLocalStorage = localStorage.getItem('aws-session');
    
    if (!token && !tokenFromLocalStorage) {
      throw new Error("No authentication token");
    }
    
    const finalToken = token || tokenFromLocalStorage;

    const response = await smartHttpClientClient(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${finalToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete file: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('🔍 File deleted successfully:', result);
    return result;
  } catch (error) {
    console.error('🔍 Delete file error:', error);
    throw error;
  }
};

export const renameFileClient = async (fileId: string, newName: string) => {
  try {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const token = getCookie('aws-session');
    const tokenFromLocalStorage = localStorage.getItem('aws-session');
    
    if (!token && !tokenFromLocalStorage) {
      throw new Error("No authentication token");
    }
    
    const finalToken = token || tokenFromLocalStorage;

    const response = await smartHttpClientClient(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/files/${fileId}/rename`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${finalToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newName,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to rename file: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('🔍 File renamed successfully:', result);
    return result;
  } catch (error) {
    console.error('🔍 Rename file error:', error);
    throw error;
  }
};

export const shareFileClient = async (fileId: string, emails: string[]) => {
  try {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const token = getCookie('aws-session');
    const tokenFromLocalStorage = localStorage.getItem('aws-session');
    
    if (!token && !tokenFromLocalStorage) {
      throw new Error("No authentication token");
    }
    
    const finalToken = token || tokenFromLocalStorage;

    const response = await smartHttpClientClient(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/files/${fileId}/share`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${finalToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emails,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to share file: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('🔍 File shared successfully:', result);
    return result;
  } catch (error) {
    console.error('🔍 Share file error:', error);
    throw error;
  }
};

export const getSharedFilesClient = async () => {
  try {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const token = getCookie('aws-session');
    const tokenFromLocalStorage = localStorage.getItem('aws-session');
    
    if (!token && !tokenFromLocalStorage) {
      throw new Error("No authentication token");
    }
    
    const finalToken = token || tokenFromLocalStorage;

    const response = await smartHttpClientClient(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/files/shared-with-me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${finalToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get shared files: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('🔍 Shared files retrieved successfully:', result);
    return result;
  } catch (error) {
    console.error('🔍 Get shared files error:', error);
    throw error;
  }
};

export const downloadSharedFileClient = async (fileId: string) => {
  try {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const token = getCookie('aws-session');
    const tokenFromLocalStorage = localStorage.getItem('aws-session');
    
    if (!token && !tokenFromLocalStorage) {
      throw new Error("No authentication token");
    }
    
    const finalToken = token || tokenFromLocalStorage;

    const response = await smartHttpClientClient(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/files/${fileId}/download-shared`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${finalToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to download shared file: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('🔍 Shared file download URL generated:', result);
    return result;
  } catch (error) {
    console.error('🔍 Download shared file error:', error);
    throw error;
  }
}; 