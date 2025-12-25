import { useCallback } from "react";
import { useResumes, useUploadResume } from "@/hooks/use-resumes";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { format } from "date-fns";

export default function Resume() {
  const { data: resumes } = useResumes();
  const uploadResume = useUploadResume();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    
    try {
      await uploadResume.mutateAsync(formData);
    } catch (e) {
      console.error(e);
    }
  }, [uploadResume]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display">Resume Management</h1>
        <p className="text-muted-foreground mt-1">Upload your resume to generate tailored interview questions.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card className="h-full border-dashed border-2 border-border/60 bg-muted/20 hover:bg-muted/30 transition-colors">
            <CardContent className="h-full">
              <div 
                {...getRootProps()} 
                className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 cursor-pointer"
              >
                <input {...getInputProps()} />
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                  isDragActive ? "bg-primary text-primary-foreground scale-110" : "bg-primary/10 text-primary"
                }`}>
                  {uploadResume.isPending ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {isDragActive ? "Drop it here!" : "Upload Resume"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Drag and drop your PDF, DOCX, or TXT file here, or click to browse.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
           <h2 className="font-semibold text-lg flex items-center gap-2">
             <FileText className="w-5 h-5 text-primary" />
             Your Resumes
           </h2>
           
           {resumes?.length === 0 && (
             <div className="text-sm text-muted-foreground italic p-4 border rounded-lg">
               No resumes uploaded yet.
             </div>
           )}

           {resumes?.map((resume) => (
             <Card key={resume.id} className="group hover:shadow-md transition-all">
               <CardContent className="p-4 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-muted rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                     <FileText className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="font-medium truncate max-w-[200px]">{resume.fileName}</p>
                     <p className="text-xs text-muted-foreground">
                       Uploaded {format(new Date(resume.createdAt!), "MMM d, yyyy")}
                     </p>
                   </div>
                 </div>
                 <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                 </div>
               </CardContent>
             </Card>
           ))}
        </div>
      </div>
    </Layout>
  );
}
