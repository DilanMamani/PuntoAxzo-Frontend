import jsPDF from "jspdf";
import React, { useState } from "react";
import Swal from "sweetalert2";
import api from "../../../../services/axiosConfig";
import autoTable from "jspdf-autotable";

const PdfCreateAnexo = ({
  proformaData,
  detalles,
  repuestos,
  anexoData,
  idProforma,
  firmaURL,
  logoURL,
  fotos, // Nuevo prop con imágenes
}) => {
  const [isLoading, setIsLoading] = useState(false);
   const [subtotal, setSubtotal] = useState(0);
    const [descuentoTotal, setDescuentoTotal] = useState(0);
    const [total, setTotal] = useState(0);
  const base64ToBlob = (base64String) => {
    const byteCharacters = atob(base64String.split(",")[1]); // Elimina el encabezado "data:image/jpeg;base64,"
    const byteArrays = [];
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }
    return new Blob([new Uint8Array(byteArrays)], { type: "image/jpeg" });
  };
  const generateProformaPDF = (proformaData, detalles, repuestos, anexoData,firmaURL, logoURL) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const marginX = 10;
    const lineHeight = 10;

    const addHeader = () => {
      if (logoURL) {
        pdf.addImage(logoURL, "PNG", marginX, 10, 30, 30);
      }
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Proforma", pageWidth / 2, 20, { align: "center" });
      pdf.setFontSize(10);
      pdf.text(`Número: ${proformaData.numerop || "N/A"}`, pageWidth - 70, 15);
      pdf.text(`Fecha: ${proformaData.fecha || "N/A"}`, pageWidth - 70, 20);
      pdf.line(marginX, 40, pageWidth - marginX, 40); // Línea divisoria
    };

    const addFooter = (pageNumber) => {
      pdf.setFontSize(10);
      pdf.text(`Página ${pageNumber}`, pageWidth / 2, pdf.internal.pageSize.height - 10, {
        align: "center",
      });
    };

    const addMainInfo = () => {
      pdf.setFontSize(12);
      pdf.text("Información del Cliente", marginX, 50);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Cliente: ${proformaData.cliente?.nombre || "N/A"}`, marginX, 60);
      pdf.text(`Correo: ${proformaData.cliente?.mail || "N/A"}`, marginX, 70);
      pdf.text(`Teléfono: ${proformaData.cliente?.telefono || "N/A"}`, marginX, 80);
      pdf.text(`Placa: ${proformaData.nplaca || "N/A"}`, marginX, 90);
    };


    const addDetailsTable = () => {
      pdf.text("Detalles", marginX, 110);
      autoTable(pdf, {
        startY: 115,
        head: [["#", "Descripción", "Precio", "Descuento"]],
        body: detalles.map((detalle, index) => [
          index + 1,
          detalle.precio?.detalle  || "N/A",
          `${detalle.precio?.precio || "0.00"} Bs`,
          `${detalle.descuento || "0.00"} Bs`,
        ]),
        theme: "grid",
        margin: { left: marginX },
        styles: { fontSize: 10 },
        didDrawPage: (data) => {
          const pageNumber = pdf.internal.getNumberOfPages();
          addFooter(pageNumber);
        },
        
      });
      const nuevoSubtotal = detalles.reduce((acc, detalle) => acc + parseFloat(detalle.precio.precio || 0), 0);
    const nuevoDescuentoTotal = detalles.reduce(
      (acc, detalle) => acc + (parseFloat(detalle.precio.precio || 0) * parseFloat(detalle.descuento || 0)) / 100,
      0
    );
    setSubtotal(nuevoSubtotal.toFixed(2));
    setDescuentoTotal(nuevoDescuentoTotal.toFixed(2));
    setTotal((nuevoSubtotal - nuevoDescuentoTotal).toFixed(2));
    };

    const addSummary = () => {
      
      const finalY = pdf.previousAutoTable.finalY || 125;
      pdf.text("Resumen Financiero", marginX, finalY + 10);
      pdf.text(`Subtotal: ${subtotal || "0.00"} Bs`, marginX, finalY + 20);
      pdf.text(`Descuento: ${descuentoTotal || "0.00"} Bs`, marginX, finalY + 30);
      pdf.text(`Total: ${total || "0.00"} Bs`, marginX, finalY + 40);
    };

    const addSignature = () => {
      const finalY = pdf.previousAutoTable.finalY || 160;
      pdf.text("Firma", marginX, finalY + 50);
      if (firmaURL) {
        pdf.addImage(firmaURL, "PNG", marginX, finalY + 55, 50, 25);
      } else {
        pdf.line(marginX, finalY + 60, marginX + 50, finalY + 60); // Línea de firma
      }
    };

    addHeader();
    addMainInfo();
    addDetailsTable();
    addSummary();
    addSignature();

    return pdf;
  };

  const createAndSendPDF = async () => {
    setIsLoading(true);
  
    // Genera el PDF
    const pdf = generateProformaPDF(proformaData, detalles, repuestos, firmaURL, logoURL);
    const blob = pdf.output("blob");
  
    const emailRecipients = [
      proformaData.inspectorseguro?.mail,
      proformaData.inspectorbroker?.mail,
      proformaData.cliente?.mail,
    ].filter((email) => email && /\S+@\S+\.\S+/.test(email));
  
    if (emailRecipients.length === 0) {
      Swal.fire("Error", "No hay correos válidos para enviar el PDF.", "error");
      setIsLoading(false);
      return;
    }
  
    const formData = new FormData();
    formData.append("file", blob, `anexoProfroma-${idProforma}.pdf`);
    formData.append("subject", `anexoProforma - ${idProforma}`);
    formData.append("to", JSON.stringify(emailRecipients));
  
    // Añadir imágenes al formData
    fotos.forEach((foto, index) => {
      const blobImage = base64ToBlob(foto.foto); // Conversión Base64 a Blob
      formData.append(`images`, blobImage, `foto-${index + 1}.jpg`);
    });
  
    try {
      const response = await api.post("/api/send-email", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (response.status === 200) {
        Swal.fire("Éxito", "El PDF y las imágenes han sido enviadas correctamente.", "success");
      } else {
        throw new Error("Error al enviar el correo");
      }
    } catch (error) {
      console.error("Error al enviar el PDF y las imágenes:", error);
      Swal.fire("Error", "Hubo un problema al enviar el correo.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const sendWhatsAppPDF = async () => {
    setIsLoading(true);
  
    try {
      const pdf = generateProformaPDF(proformaData, detalles,repuestos, anexoData , firmaURL, logoURL);
      const pdfBlob = pdf.output("blob");
      const nombreCliente = proformaData?.cliente?.nombre || "Cliente";
      const mensaje = `Hola ${nombreCliente}, le enviamos su proforma correspondiente al vehículo con placa ${proformaData?.nplaca || "N/A"}.`;
  
      const archivoPDF = new File([pdfBlob], `AnexoProforma-${idProforma}.pdf`, {
        type: "application/pdf",
      });
  
      const formData = new FormData();
      formData.append("telefono", proformaData?.cliente?.telefono || "");
      formData.append("pdfPath", archivoPDF);
      formData.append("mensaje", mensaje);
  
      const response = await api.post("/api/whatsapp/send-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (response.status === 200) {
        Swal.fire("Éxito", "El PDF se envió correctamente por WhatsApp.", "success");
      } else {
        throw new Error("Error inesperado al enviar el PDF por WhatsApp.");
      }
    } catch (error) {
      console.error("Error al enviar el PDF por WhatsApp:", error);
      Swal.fire(
        "Error",
        error.response?.data?.error || "Hubo un problema al enviar el PDF por WhatsApp.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        className="btn-generate-pdf"
        onClick={() =>
          generateProformaPDF(proformaData, detalles, repuestos, firmaURL, logoURL).save(
            `anexoProforma-${idProforma}.pdf`
          )
        }
        disabled={isLoading}
      >
        Descargar PDF
      </button>
      <button
        className="btn-send-pdf"
        onClick={createAndSendPDF}
        disabled={isLoading}
      >
        {isLoading ? "Enviando..." : "Crear y Enviar PDF"}
      </button>
      <button
        className="btn-send-whatsapp-pdf"
        onClick={async () => {
          try {
            const telefono = String(proformaData?.cliente?.telefono || "").trim();
            const nombreCliente = proformaData?.cliente?.nombre || "Cliente";
      
            if (!telefono) {
              Swal.fire("Error", "El cliente no tiene un número de teléfono válido.", "error");
              return;
            }
      
            // Confirmación antes de enviar
            const result = await Swal.fire({
              title: "Confirmar Envío por WhatsApp",
              html: `
                <p><strong>Cliente:</strong> ${nombreCliente}</p>
                <p><strong>Teléfono:</strong> ${telefono}</p>
                <p>Se enviará la proforma como PDF adjunto.</p>
              `,
              showCancelButton: true,
              confirmButtonText: "Enviar",
              cancelButtonText: "Cancelar",
            });
      
            if (result.isConfirmed) {
              setIsLoading(true);
      
              // Llama a la función que tienes implementada para enviar el PDF
              await sendWhatsAppPDF();
              Swal.fire("Éxito", "El PDF se envió correctamente por WhatsApp.", "success");
            }
          } catch (error) {
            console.error("Error al enviar el PDF por WhatsApp:", error);
            Swal.fire(
              "Error",
              error.response?.data?.error || "Hubo un problema al enviar el PDF por WhatsApp.",
              "error"
            );
          } finally {
            setIsLoading(false);
          }
        }}
        disabled={isLoading}
      >
        {isLoading ? "Enviando PDF..." : "Enviar PDF por WhatsApp"}
      </button>
    </>
  );
};

export default PdfCreateAnexo;