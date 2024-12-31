import React from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const PdfViewer = ({ pdfUrl }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  if (!pdfUrl) {
    return <p>No hay archivo PDF para mostrar</p>;
  }

  return (
    <div style={{ height: "750px", border: "1px solid #ddd" }}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
    <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} />
</Worker>
    </div>
  );
};

export default PdfViewer;