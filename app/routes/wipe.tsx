import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

interface ResumeData {
  id: string;
  resumePath: string;
  imagePath: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  feedback: any;
}

const WipeApp = () => {
  const { auth, isLoading, error, clearError, fs, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeData[]>([]);

  // Load all resumes from KV
  const loadResumes = async () => {
    const keys = await kv.list("resume:");
    if (!keys) return;
    const results: ResumeData[] = [];

    for (const item of keys) {
      const key = typeof item === "string" ? item : item.key;
      const data = await kv.get(key);
      if (!data) continue;
      try {
        results.push(JSON.parse(data));
      } catch (err) {
        console.error("Invalid resume data in KV:", err);
      }
    }
    setResumes(results);
  };

  useEffect(() => {
    loadResumes();
  }, []);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading]);

  // Delete one resume
  const handleDeleteResume = async (resume: ResumeData) => {
    await fs.delete(resume.resumePath);
    await fs.delete(resume.imagePath);
    await kv.delete(`resume:${resume.id}`);
    loadResumes();
  };

  // Wipe everything
  const handleWipeAll = async () => {
    // delete all files
    for (const resume of resumes) {
      await fs.delete(resume.resumePath);
      await fs.delete(resume.imagePath);
    }
    await kv.flush();
    setResumes([]);
  };

  if (isLoading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <section className="main-section py-16">
        <h1 className="text-3xl font-bold text-center mb-6">
          Manage Your Uploaded Resumes
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Authenticated as:{" "}
          <span className="font-semibold">{auth.user?.username}</span>
        </p>

        {/* Resume list */}
        {resumes.length === 0 ? (
          <p className="text-center text-gray-500">No resumes uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="p-6 rounded-2xl shadow-md bg-white flex flex-col gap-4"
              >
                <div>
                  <h2 className="text-xl font-semibold">{resume.jobTitle}</h2>
                  <p className="text-gray-500">{resume.companyName}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-gray-600">
                    <strong>PDF:</strong> {resume.resumePath.split("/").pop()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Image:</strong> {resume.imagePath.split("/").pop()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteResume(resume)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg self-start"
                >
                  Delete Resume
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Wipe all button */}
        {resumes.length > 0 && (
          <div className="text-center mt-12">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
              onClick={handleWipeAll}
            >
              Wipe All App Data
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default WipeApp;
