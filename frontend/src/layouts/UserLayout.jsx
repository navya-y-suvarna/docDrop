import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/navbar/Navbar";
import { UploadModal } from "../components/modal/UploadModal";

export const UserLayout = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onOpenUpload={() => setIsUploadOpen(true)} />

      <main className="flex-1 pb-16">
        <Outlet context={{ openUploadModal: () => setIsUploadOpen(true) }} />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} DocDrop — Smart Document Vault & Xerox Management System.</p>
          <div className="flex items-center gap-4 text-slate-600">
            <span>End-to-End Encrypted Transfers</span>
            <span>•</span>
            <span>Contactless Pickups</span>
            <span>•</span>
            <span>Unguessable Share Links</span>
          </div>
        </div>
      </footer>

      {/* Global Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => {
          // Dispatch custom event to notify current views
          window.dispatchEvent(new CustomEvent("docdrop:fileUploaded"));
        }}
      />
    </div>
  );
};
