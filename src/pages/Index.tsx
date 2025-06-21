import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PDFUpload } from "@/components/PDFUpload";
import { PDFViewer } from "@/components/PDFViewer";
import { ChatInterface } from "@/components/ChatInterface";
import WaitingPage from "./WaitingPage";
import axios from "axios";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";
import PDFAnalysisWaitingPage from "./PDFAnalysisWaitingPage";

export interface PDFProject {
  id: string;
  title: string;
  fileName: string;
  uploadDate: Date;
  fileUrl?: string;
}

const Index = () => {
  const [projects, setProjects] = useState<PDFProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState<boolean>(true);

  const { isLoading, error, data } = useVisitorData();

  useEffect(() => {
    console.log("Projects updated:", projects);
    if (projects.length == 0) {
      const newProject: PDFProject = {
        id: crypto.randomUUID(),
        title: "New Project",
        fileName: "",
        uploadDate: new Date(),
      };
      setActiveProjectId(newProject.id);
      setProjects((prev) => [...prev, newProject]);
    }
  }, [projects]);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  useEffect(() => {
    console.log("Active project ID changed:", activeProjectId);
  }, [activeProjectId]);

  // Track file to upload if a new project is being created

  // Modified handleFileUpload to handle async project creation
  const handleFileUpload = (file: File) => {
    if (activeProject && !activeProject.fileUrl) {
      // Update existing project with PDF
      const updatedProject: PDFProject = {
        ...activeProject,
        title: file.name.replace(".pdf", ""),
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
      };
      setProjects((prev) =>
        prev.map((p) => (p.id === activeProject.id ? updatedProject : p))
      );
    } else {
      // Create new project, but delay upload until activeProjectId is updated
      const newProject: PDFProject = {
        id: crypto.randomUUID(),
        title: file.name.replace(".pdf", ""),
        fileName: file.name,
        uploadDate: new Date(),
        fileUrl: URL.createObjectURL(file),
      };
      setProjects((prev) => [...prev, newProject]);
      setActiveProjectId(newProject.id);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setActiveProjectId(projectId);
  };

  const handleCreateNewProject = () => {
    const newProject: PDFProject = {
      id: crypto.randomUUID(),
      title: "New Project",
      fileName: "",
      uploadDate: new Date(),
    };
    setUploadingPdf(true);
    setProjects((prev) => [...prev, newProject]);
    setActiveProjectId(newProject.id);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const uploadPdf = async (
    file: File,
    fingerprint: string
  ): Promise<string | null> => {
    const formData = new FormData();
    formData.append("activeProjectId", activeProjectId);
    console.log("inside upload pdf function : ", activeProjectId);
    formData.append("file", file); // must match FastAPI param name: 'file'
    formData.append("collection_name", "test_collection3");
    formData.append("fingerprint", fingerprint);
    if (activeProjectId !== null) {
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("Uploading pdf of  the id :", activeProjectId);
        console.log("Upload success:", response.data);
        setUploadingPdf(false);
        return response.data.filename;
      } catch (error: any) {
        console.error("Upload failed:", error);
        return null;
      }
    }
  };

  // Responsive: determine if screen is small (less than 768px, i.e., mobile)
  const [isMobile, setIsMobile] = React.useState(false);
  const [serverStarted, setServerStarted] = React.useState(false);

  const pingServer = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/");
      if (response.status === 200) {
        setServerStarted(true);
      }
    } catch (error) {
      console.error("Error pinging server:", error);
    }
  };

  React.useEffect(() => {
    pingServer(); // Check server status on mount
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Set on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!serverStarted || isLoading || error != undefined) {
    // console.log(" loading :", isLoading);
    // console.log("Server is not started yet, showing waiting page data: ", data);
    return <WaitingPage />;
  }

  return (
    <div className=" min-h-screen bg-gray-50 dark:bg-gray-900 w-full transition-colors duration-200">
      <div className="flex flex-col md:flex-row w-full min-h-screen h-[100vh]">
        {/* Sidebar Panel */}
        <div
          className={`w-full md:w-auto flex-shrink-0 ${
            isMobile ? "!max-h-[64px]" : "md:max-w-xs"
          } transition-all overflow-y-auto h-screen`}
          style={
            isMobile
              ? { position: "sticky", top: 0, zIndex: 20 }
              : { height: "100vh" }
          }
        >
          <Sidebar
            projects={projects}
            activeProjectId={activeProjectId}
            onProjectSelect={handleProjectSelect}
            onCreateNewProject={handleCreateNewProject}
            onDeleteProject={handleDeleteProject}
            isCollapsed={isSidebarCollapsed}
            onToggle={toggleSidebar}
          />
        </div>
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 h-full bg-gray-50 dark:bg-gray-900">
          {!activeProject || !activeProject.fileUrl ? (
            // Upload Area - Responsive Full Screen
            <div className="flex flex-1 items-center h-[100vh] justify-center px-2 py-4 sm:p-4 md:p-8 w-full min-h-[calc(100vh-64px)] md:min-h-0">
              <div className="w-full max-w-xl">
                <div className="text-center mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-200">
                    PDF Talks
                  </h1>
                  <p className="text-base md:text-xl text-gray-600 dark:text-gray-400 transition-colors duration-200">
                    Upload a PDF to start asking questions
                  </p>
                </div>
                <PDFUpload
                  onFileUpload={handleFileUpload}
                  activeProjectId={activeProjectId}
                  uploadPdf={uploadPdf}
                />
              </div>
            </div>
          ) : (
            // Responsive Split: stack vertically on mobile, side by side on desktop
            <div>
              {uploadingPdf ? (
                <PDFAnalysisWaitingPage />
              ) : (
                <div className="flex flex-col md:flex-row w-full h-full min-h-0">
                  <div className="w-full md:w-1/2 flex-1 min-h-[240px] max-h-full overflow-y-auto">
                    <PDFViewer project={activeProject} />
                  </div>
                  <div className="w-full md:w-1/2 flex-1 min-h-[240px] max-h-full overflow-y-auto">
                    <ChatInterface project={activeProject} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
