import React from "react";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header sederhana */}
      {/* <header className="text-center py-4 text-xl font-bold">
        Mechanical Completion
      </header> */}

      <main>{children}</main>

      {/* Footer opsional */}
      <footer className="text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} Mechanical Completion
      </footer>
    </div>
  );
}
