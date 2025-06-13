import { useEffect, useRef, useMemo, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const WysiwygEditor = ({ value, onChange, placeholder }: WysiwygEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoize modules and formats to prevent unnecessary re-renders
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  }), []);

  const formats = useMemo(() => [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'align', 'color', 'background',
    'script'
  ], []);

  // Handle change with proper typing
  const handleChange = (content: string, delta: any, source: any, editor: any) => {
    onChange(content);
  };

  // Suppress the findDOMNode warning specifically for ReactQuill
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' && 
        (args[0].includes('findDOMNode') || args[0].includes('ReactDOM.findDOMNode'))
      ) {
        return;
      }
      originalError(...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  // Show loading placeholder until client-side render
  if (!isClient) {
    return (
      <div className="h-[350px] border rounded-md animate-pulse bg-gray-100 flex items-center justify-center">
        <span className="text-gray-500">Loading editor...</span>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ height: '300px', marginBottom: '50px' }}
      />
    </div>
  );
};