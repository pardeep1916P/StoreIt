"use client";

import React, { useEffect, useState } from "react";
import Sort from "@/components/Sort";
import { getFiles } from "@/lib/actions/file.actions";
import { getSharedFilesClient } from "@/lib/actions/file.client";
import Card from "@/components/Card";
import { getFileTypesParams, convertFileSize } from "@/lib/utils";
import { FileType, SearchParamProps } from "@/types";

const Page = ({ searchParams, params }: SearchParamProps) => {
  const [type, setType] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [sort, setSort] = useState<string>("");
  const [files, setFiles] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Handle async params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      const resolvedSearchParams = await searchParams;
      
      setType((resolvedParams?.type as string) || "");
      setSearchText((resolvedSearchParams?.query as string) || "");
      setSort((resolvedSearchParams?.sort as string) || "");
    };
    
    resolveParams();
  }, [params, searchParams]);

  const types = getFileTypesParams(type) as FileType[];

  const loadFiles = async () => {
    try {
      console.log('🔍 Loading files for category:', type);
      console.log('🔍 Types to match:', types);
      
      // Fetch regular files
      const filesData = await getFiles({ types, searchText, sort });
      console.log('🔍 Regular files loaded:', filesData);
      
      // Fetch shared files
      let sharedFilesData = { documents: [] };
      try {
        sharedFilesData = await getSharedFilesClient();
        console.log('🔍 Shared files loaded in category page:', sharedFilesData);
        console.log('🔍 Number of shared files:', sharedFilesData.documents?.length || 0);
      } catch (error) {
        console.error('Failed to load shared files:', error);
        // Continue with regular files even if shared files fail
      }
      
      // Merge regular files and shared files
      const allFiles = {
        documents: [
          ...(filesData?.documents || []),
          ...(sharedFilesData?.documents || []).map((sharedFile: any) => {
            console.log('🔍 Processing shared file for category:', {
              fileName: sharedFile.name,
              originalType: sharedFile.type,
              fileType: sharedFile.fileType,
              extension: sharedFile.extension,
              category: type
            });
            
            // Extract type from fileType (e.g., "image/jpeg" -> "image")
            let normalizedType = sharedFile.type;
            
            // PRIORITY 1: Check extension first for better accuracy
            if (sharedFile.extension) {
              const ext = sharedFile.extension.toLowerCase();
              if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
                normalizedType = 'image';
              } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) {
                normalizedType = 'video';
              } else if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext)) {
                normalizedType = 'audio';
              } else if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'csv'].includes(ext)) {
                normalizedType = 'document';
              }
            }
            
            // PRIORITY 2: If no type from extension, try to get it from fileType
            if (!normalizedType || (normalizedType && normalizedType.includes('/'))) {
              if (sharedFile.fileType && typeof sharedFile.fileType === 'string') {
                // Handle cases like "image/jpeg", "video/mp4", etc.
                const parts = sharedFile.fileType.split('/');
                if (parts.length > 0) {
                  // For CSV files, prioritize "document" over "text"
                  if (sharedFile.extension === 'csv') {
                    normalizedType = 'document';
                  } else {
                    normalizedType = parts[0];
                  }
                }
              }
            }
            
            // PRIORITY 3: Fallback to 'other' if still no type
            normalizedType = normalizedType || 'other';
            
            console.log('🔍 Final normalized type:', {
              fileName: sharedFile.name,
              originalType: sharedFile.type,
              normalizedType: normalizedType,
              willMatchCategory: types.includes(normalizedType),
              category: type,
              types: types
            });
            
            return {
              ...sharedFile,
              // Ensure type field is set correctly - OVERRIDE the original type
              type: normalizedType,
              // Owner field is now set by the backend
              owner: sharedFile.owner || "Unknown"
            };
          })
        ]
      };
      
      console.log('🔍 All files before filtering:', {
        totalFiles: allFiles.documents.length,
        regularFiles: filesData?.documents?.length || 0,
        sharedFiles: sharedFilesData?.documents?.length || 0,
        allFileTypes: allFiles.documents.map((f: any) => ({ 
          name: f.name, 
          type: f.type, 
          isShared: !!f.sharedBy,
          extension: f.extension,
          fileType: f.fileType
        }))
      });
      
      // Filter by type if not showing all files
      if (types.length > 0) {
        console.log('🔍 Filtering by types:', types);
        console.log('🔍 Files before filtering:', allFiles.documents.map((f: any) => ({ name: f.name, type: f.type, isShared: !!f.sharedBy })));
        
        allFiles.documents = allFiles.documents.filter((file: any) => {
          const matches = types.includes(file.type);
          console.log(`🔍 File ${file.name}: type=${file.type}, matches=${matches}, types=${JSON.stringify(types)}`);
          return matches;
        });
        
        console.log('🔍 Files after filtering:', allFiles.documents.map((f: any) => ({ name: f.name, type: f.type, isShared: !!f.sharedBy })));
      }
      
      // Apply search filter if provided
      if (searchText) {
        allFiles.documents = allFiles.documents.filter(file =>
          file.name.toLowerCase().includes(searchText.toLowerCase())
        );
      }
      
      // Apply sorting
      if (sort) {
        allFiles.documents.sort((a, b) => {
          switch (sort) {
            case 'name':
              return a.name.localeCompare(b.name);
            case 'size':
              return b.size - a.size;
            case 'date':
              return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
            default:
              return 0;
          }
        });
      } else {
        // Default sort by date (newest first)
        allFiles.documents.sort((a, b) => 
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        );
      }
      
      setFiles(allFiles);
    } catch (error) {
      console.error('Failed to load files:', error);
      setFiles({ documents: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [type, searchText, sort]);

  const handleFileDelete = (deletedFileId: string) => {
    setFiles((prevFiles: any) => ({
      ...prevFiles,
      documents: prevFiles.documents.filter((file: any) => file.$id !== deletedFileId)
    }));
  };

  const handleFileRename = (fileId: string, newName: string) => {
    setFiles((prevFiles: any) => {
      if (!prevFiles) return prevFiles;
      
      return {
        ...prevFiles,
        documents: prevFiles.documents.map((file: any) => 
          file.$id === fileId ? { ...file, name: newName } : file
        )
      };
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Calculate total storage for this category (only uploaded files, not shared)
  const totalStorage = files?.documents?.reduce((total: number, file: any) => {
    // Only count files that are not shared (i.e., files where owner === current user or no sharedBy)
    if (!file.sharedBy || file.sharedBy === file.owner) {
      return total + file.size;
    }
    return total;
  }, 0) || 0;

  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">{type}</h1>

        <div className="total-size-section">
          <p className="body-1">
            Total: <span className="h5">{convertFileSize(totalStorage)}</span>
          </p>

          <div className="sort-container">
            <p className="body-1 hidden text-light-200 sm:block">Sort by:</p>

            <Sort />
          </div>
        </div>
      </section>

      {/* Render the files */}
      {files?.documents && files.documents.length > 0 ? (
        <section className="file-list">
          {files.documents.map((file: any) => (
            <Card key={file.$id} file={file} onFileDelete={handleFileDelete} onFileRename={handleFileRename} />
          ))}
        </section>
      ) : (
        <p className="empty-list">No files available</p>
      )}
    </div>
  );
};

export default Page;
