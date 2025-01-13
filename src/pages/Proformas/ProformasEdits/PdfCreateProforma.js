import React from "react";
import html2pdf from "html2pdf.js";
import logoPuntoAxzo from "../../../assets/Logo.png";
import firmaPuntoAxzo from "../../../assets/Firma.png"; // Importamos la firma

const PdfCreateProforma = ({ proformaData, detalles,detallesPlasticos,detallesMecanica,repuestos, marca,broker, idProforma,monedas }) => {
  const obtenerMoneda = (proformaData) => {
    // Verificar si existe el idMoneda y asignar la moneda correspondiente
    const moneda = proformaData.seguro?.moneda?.idMoneda === 1 ? "Bs" : 
                   proformaData.seguro?.moneda?.idMoneda === 2 ? "$US" : "Moneda no especificada";
    
    return moneda;
  };
  
  // Ejemplo de uso
  const moneda = obtenerMoneda(proformaData);
  console.log(moneda); // Imprime "Bs" o "$US" según el valor de idMoneda
  const generatePDF = () => {
    // Crear un contenedor HTML dinámico para el PDF
    const obtenerMoneda = (proformaData) => {
      // Verificar si existe el idMoneda y asignar la moneda correspondiente
      const moneda = proformaData.seguro?.moneda?.idMoneda === 1 ? "Bs" : 
                     proformaData.seguro?.moneda?.idMoneda === 2 ? "$US" : "Moneda no especificada";
      
      return moneda;
    };
    const moneda = obtenerMoneda(proformaData);
    const pdfContent = document.createElement("div");
    pdfContent.style.padding = "10px 20px"; // Ajuste de márgenes laterales y superiores
    pdfContent.style.fontFamily = "Arial, sans-serif";

    const header = `
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap" rel="stylesheet">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-top: 10px;">
  <div style="flex: 1; text-align: left; margin-left: -20px;">
    <img src="${logoPuntoAxzo}" alt="Logo" style="width: 200px; margin-top: -40px;" />
  </div>
  <div style="flex: 2; text-align: center;">
    <h1 style="margin: 0; font-size: 22px;">PROFORMA ${proformaData.numerop}/${proformaData.anio}</h1>
    <p style="margin: 0; font-size: 12px;">(Expresado en ${monedas})</p>
  </div>
  <div style="flex: 1; text-align: right; font-size: 10px;">
    <p style="margin: 0;"><strong>Codigo:</strong> ${String(idProforma).padStart(7, '0')}</p>
    <p style="margin: 0;">Fecha: ${proformaData.fecha || "N/A"}</p>
  </div>
</div>
<div style="text-align: left; font-size: 10px; margin-top: -10px;">
  <p style="margin: 0;">Taller Automotriz Punto Axzo ¡Pintura en Horno!</p>
  <p style="margin: 0;">Correo: jorgemamani_axzo@hotmail.com</p>
  <p style="margin: 0;">Teléfono: 70104161</p>
  <br>
</div>
`;

const datosClienteVehiculo = `
  <div style="border: 1px solid #000; border-radius: 5px; padding: 8px; margin-bottom: 10px; font-size: 10px; font-family: Arial, sans-serif; display: flex; justify-content: space-between;">
    <!-- Datos Cliente, Asegurado o RC -->
    <div style="flex: 1; border-right: 1px solid #ccc; padding-right: 8px;">
      ${
        proformaData.tipotrabajo?.tipoTrabajo === "Particular"
          ? `
            <h3 style="margin: 0 0 3px 0; font-size: 12px; text-align: left; font-weight: bold;">DATOS DEL CLIENTE</h3>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <p style="margin: 0; flex: 1;"><strong>Nombre:</strong> ${proformaData.cliente?.nombre || "N/A"}</p>
              <p style="margin: 0; flex: 1; text-align: right;"><strong>Teléfono:</strong> ${proformaData.cliente?.telefono || "N/A"}</p>
            </div>
            <p style="margin: 2px 0 0 0;"><strong>Correo:</strong> ${proformaData.cliente?.mail || "N/A"}</p>
          `
          : proformaData.tipotrabajo?.tipoTrabajo === "Seguro"
          ? `
            <h3 style="margin: 0 0 3px 0; font-size: 12px; text-align: left; font-weight: bold;">DATOS ASEGURADO</h3>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <p style="margin: 0; flex: 1;"><strong>Nombre:</strong> ${proformaData.cliente?.nombre || "N/A"}</p>
              <p style="margin: 0; flex: 1; text-align: right;"><strong>Teléfono:</strong> ${proformaData.cliente?.telefono || "N/A"}</p>
            </div>
            <p style="margin: 2px 0 0 0;"><strong>Correo:</strong> ${proformaData.cliente?.mail || "N/A"}</p>
          `
          : `
            <h3 style="margin: 0 0 3px 0; font-size: 12px; text-align: left; font-weight: bold;">DATOS RC</h3>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <p style="margin: 0; flex: 1;"><strong>Nombre:</strong> ${proformaData.clienteRC?.nombre || "N/A"}</p>
              <p style="margin: 0; flex: 1; text-align: right;"><strong>Teléfono:</strong> ${proformaData.clienteRC?.telefono || "N/A"}</p>
            </div>
            <p style="margin: 2px 0 0 0;"><strong>Correo:</strong> ${proformaData.clienteRC?.mail || "N/A"}</p>
            <h3 style="margin: 5px 0 3px 0; font-size: 12px; text-align: left; font-weight: bold;">DATOS ASEGURADO</h3>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <p style="margin: 0; flex: 1;"><strong>Nombre:</strong> ${proformaData.cliente?.nombre || "N/A"}</p>
              <p style="margin: 0; flex: 1; text-align: right;"><strong>Teléfono:</strong> ${proformaData.cliente?.telefono || "N/A"}</p>
            </div>
            <p style="margin: 2px 0 0 0;"><strong>Correo:</strong> ${proformaData.cliente?.mail || "N/A"}</p>
          `
      }
    </div>

    <!-- Datos Vehículo -->
    <div style="flex: 1; padding-left: 8px;">
      <h3 style="margin: 0 0 3px 0; font-size: 12px; text-align: left; font-weight: bold;">DATOS DEL VEHÍCULO</h3>
      <p style="margin: 0;"><strong>Placa:</strong> ${proformaData.nplaca || "N/A"}</p>
      <p style="margin: 0;"><strong>Color:</strong> ${proformaData?.vehiculo?.color || "N/A"}</p>
      <p style="margin: 0;"><strong>Tipo:</strong> ${proformaData?.vehiculo?.modelo?.tipoVehiculo?.tipo || "N/A"}</p>
      <p style="margin: 0;"><strong>Marca:</strong> ${marca || "N/A"}</p>
      <p style="margin: 0;"><strong>Modelo:</strong> ${proformaData?.vehiculo?.modelo?.nombre || "N/A"}</p>
    </div>
  </div>
`;

const datosSeguroBroker = `
  ${
    proformaData.tipotrabajo?.tipoTrabajo === "Seguro" || proformaData.tipotrabajo?.tipoTrabajo === "SeguroRC"
      ? `
        <div style="border: 1px solid #000; border-radius: 5px; padding: 8px; margin-bottom: 10px; font-size: 10px; font-family: Arial, sans-serif; display: flex; justify-content: space-between;">
          <!-- Datos Seguro -->
          <div style="flex: 1; border-right: 1px solid #ccc; padding-right: 8px;">
            <h3 style="margin: 0 0 3px 0; font-size: 12px; text-align: left; font-weight: bold;">DATOS DE SEGURO</h3>
            <p style="margin: 0;"><strong>Nombre Seguro:</strong> ${proformaData.seguro?.nombreSeguro || "N/A"}</p>
            <p style="margin: 0;"><strong>Inspector Seguro:</strong> ${proformaData.inspectorseguro?.nombre || "N/A"}</p>
          </div>

          <!-- Datos Broker -->
          ${
            proformaData?.inspectorbroker?.idInspectorB
              ? `
                <div style="flex: 1; padding-left: 8px;">
                  <h3 style="margin: 0 0 3px 0; font-size: 12px; text-align: left; font-weight: bold;">DATOS DE BROKER</h3>
                  <p style="margin: 0;"><strong>Nombre Broker:</strong> ${broker || "N/A"}</p>
                  <p style="margin: 0;"><strong>Inspector Broker:</strong> ${proformaData.inspectorbroker?.nombre || "N/A"}</p>
                </div>
              `
              : ""
          }
        </div>
      `
      : ""
  }
`;
const detallesReparacion = `
  <div style="margin-bottom: 3px; font-size: 10px; font-family: Arial, sans-serif; page-break-inside: avoid;">
    <h3 style="margin: 1px; font-size: 12px; text-align: left; font-weight: bold;">DETALLES TRABAJOS DE CHAPERIA</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 10px; border-spacing: 0;">
      <thead>
        <tr>
          <th style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left; font-weight: bold;background-color: #fff; color: #000;">Detalle</th>
          <th style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left; font-weight: bold;background-color: #fff; color: #000;">Ítem</th>
          <th style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left; font-weight: bold;background-color: #fff; color: #000;">Precio</th>
          ${
            detalles.some((detalle) => detalle.descuento > 0)
              ? `<th style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left; font-weight: bold;background-color: #fff; color: #000;">
          ${detalles && detalles.length > 0 
            ? `Descuento ${
                detalles[0]?.precio && detalles[0]?.descuento && detalles[0]?.descuento > 0 
                  ? Math.floor((detalles[0].descuento / detalles[0].precio) * 100) || 0 
                  : 0
              }%`
            : "Descuento"}</th>
            <th style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left; font-weight: bold;background-color: #fff; color: #000;">Total</th>`
              : ""
          }
          
        </tr>
      </thead>
      <tbody>
        ${detalles
          .map(
            (detalle, i) => `
          <tr>
            <td style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left;background-color: #fff; color: #000;">${detalle.detalle || "N/A"}</td>
            <td style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left;background-color: #fff; color: #000;">${detalle.item || i + 1}</td>
            <td style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left;background-color: #fff; color: #000;">${detalle.precio || "0.00"} ${moneda}</td>
            ${
              detalles.some((d) => d.descuento > 0)
                ? `<td style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left;background-color: #fff; color: #000;">${detalle.descuento || "0.00"} ${moneda}</td>
                <td style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left;background-color: #fff; color: #000;">${(detalle.precio - (detalle.descuento || 0)).toFixed(2)} ${moneda}</td>`
                : ""
            }
            
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  </div>
`;
const detallesPlasticosSection = detallesPlasticos?.length > 0
  ? `
  <div style="margin-bottom: 3px; font-size: 10px; font-family: Arial, sans-serif; page-break-inside: avoid;">
    <h3 style="margin: 1px 0; font-size: 12px; text-align: left; font-weight: bold;">REPARACIONES EN PLASTICO</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 10px; border-spacing: 0;">
      <thead>
        <tr>
          <th style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left; font-weight: bold;background-color: #fff; color: #000;">Detalle</th>
          <th style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left; font-weight: bold;background-color: #fff; color: #000;">Ítem</th>
          <th style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left; font-weight: bold;background-color: #fff; color: #000;">Precio</th>
          ${
            detallesPlasticos.some((detalle) => detalle.descuento > 0)
              ? `<th style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left; font-weight: bold;background-color: #fff; color: #000;">
          ${detallesPlasticos && detallesPlasticos.length > 0 
            ? `Descuento ${
                detallesPlasticos[0]?.precio && detallesPlasticos[0]?.descuento && detallesPlasticos[0]?.descuento > 0 
                  ? Math.floor((detallesPlasticos[0].descuento / detallesPlasticos[0].precio) * 100) || 0 
                  : 0
              }%`
            : "Descuento"}</th>
            <th style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left; font-weight: bold;background-color: #fff; color: #000;">Total</th>`
              : ""
          }
        </tr>
      </thead>
      <tbody>
        ${detallesPlasticos
          .map(
            (detalle, i) => `
          <tr>
            <td style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left;background-color: #fff; color: #000;">${detalle.detalle || "N/A"}</td>
            <td style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left;background-color: #fff; color: #000;">${detalle.item || i + 1}</td>
            <td style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left;background-color: #fff; color: #000;">${detalle.precio || "0.00"} ${moneda}</td>
            ${
              detallesPlasticos.some((d) => d.descuento > 0)
                ? `<td style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left;background-color: #fff; color: #000;">${detalle.descuento || "0.00"} ${moneda}</td>
                <td style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left;background-color: #fff; color: #000;">${(detalle.precio - (detalle.descuento || 0)).toFixed(2)} ${moneda}</td>`
                : ""
            }
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  </div>
  `
  : "";
  const detallesMecanicaSection = detallesMecanica?.length > 0
  ? `
  <div style="margin-bottom: 3px; font-size: 10px; font-family: Arial, sans-serif; page-break-inside: avoid;">
    <h3 style="margin: 1px; font-size: 12px; text-align: left; font-weight: bold;">REPARACIONES MECÁNICAS</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 10px; border-spacing: 0;">
      <thead>
        <tr>
          <th style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left; font-weight: bold;background-color: #fff; color: #000;">Detalle</th>
          <th style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left; font-weight: bold;background-color: #fff; color: #000;">Precio</th>
          ${
            detallesMecanica.some((detalle) => detalle.descuento > 0)
              ? `
          <th style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left; font-weight: bold;background-color: #fff; color: #000;">Descuento</th>
          <th style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left; font-weight: bold;background-color: #fff; color: #000;">Total</th>`
              : ""
          }
        </tr>
      </thead>
      <tbody>
        ${detallesMecanica
          .map(
            (detalle, i) => `
          <tr>
            <td style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left;background-color: #fff; color: #000 ;white-space: pre-line;"">${detalle.detalle || "N/A"}</td>
            <td style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left;background-color: #fff; color: #000;">${detalle.precio || "0.00"} ${moneda}</td>
            ${
              detallesMecanica.some((d) => d.descuento > 0)
                ? `
            <td style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left;background-color: #fff; color: #000;">${detalle.descuento || "0.00"} ${moneda}</td>
            <td style="border: 0.5px 0;solid #000; padding: 4px;font-size: 10px; text-align: left;background-color: #fff; color: #000;">${(detalle.precio - (detalle.descuento || 0)).toFixed(2)} ${moneda}</td>`
                : ""
            }
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  </div>
  `
  : "";
const detalleRepuestos = `
  <div style="margin-top: 5px; font-size: 10px; font-family: Arial, sans-serif;">
    <h3 style="margin: 2px 0; font-size: 12px; text-align: left; font-weight: bold;">DETALLE DE REPUESTOS</h3>
    ${
      repuestos && repuestos.trim() !== "No se han añadido repuestos."
        ? `<p style="margin: 0; white-space: pre-line;">${repuestos}</p>`
        : `<p style="margin: 0;">Por Verificar</p>`
    }
  </div>
`;

const resumenFinanciero = `
  <div style="margin-top: 10px; font-size: 10px; font-family: Arial, sans-serif; page-break-inside: avoid;" >
    <!-- Totales alineados a la derecha -->
    <div style="text-align: right; margin-bottom: 10px;">
      ${
        proformaData.descuento && proformaData.descuento > 0
          ? `
            <p style="margin: 0;"><strong>Subtotal:</strong> ${proformaData.subtotal || "0.00"} ${moneda}</p>
            <p style="margin: 0;">
              <strong>
                Descuento (
                ${Math.floor((proformaData.descuento / proformaData.subtotal) * 100) || 0}%):
              </strong>
              ${proformaData.descuento || "0.00"} ${moneda}
            </p>
          `
          : ""
      }
      <p style="margin: 0; font-size: 12px";><strong>Total Trabajos Chapa y Pintura (NO INCLUYE REPUESTOS): ${proformaData.total || "0.00"} ${moneda}</strong></p>
    </div>
    <!-- Total Literal alineado a la izquierda -->
    <div style="text-align: left; margin-top: 10px; font-size: 12px">
      <p style="margin: 0;"><strong>Son:</strong> ${
        (proformaData.totalliteral || "Cero").replace(/\bCien\b/gi, "Ciento")
      }. ${monedas}</p>
    </div>
  </div>
`;
const firmaSection = `
<div style="display: flex; justify-content: flex-start; align-items: center; margin-top: 1px; page-break-inside: avoid;">
  <div style="text-align: left;">
    <img src="${firmaPuntoAxzo}" alt="Firma" style="width: 200px;" /> <!-- Tamaño ajustado -->
  </div>
</div>
`;

const notaValidez = `
<div style="margin-top: 20px; font-size: 11px; text-align: left; font-family: Arial, sans-serif; page-break-inside: avoid;">
  <p style="margin: 0;">
    <strong>Obs. Esta proforma evalúa daños visibles.</strong> 
  </p>
  <p style="margin: 0;">
    <strong>Esta proforma es válida hasta el ${proformaData.fechavigencia || "No especificado"}.</strong> 
  </p>
</div>
`;
    // Agregar contenido al contenedor
    pdfContent.innerHTML = header + datosClienteVehiculo + datosSeguroBroker+detallesReparacion + detallesPlasticosSection+detallesMecanicaSection+detalleRepuestos+ resumenFinanciero+firmaSection+notaValidez;

    // Opciones para html2pdf.js
const options = {
  margin: 0.5,
  filename: 
    proformaData.tipotrabajo?.tipoTrabajo === "Particular"
      ? `${proformaData.nplaca}-${marca}-${proformaData.numerop}${proformaData.anio}.pdf`
      : `${proformaData.nplaca}-${marca}-${proformaData.seguro?.nombreSeguro || "SinSeguro"}-${proformaData.numerop}${proformaData.anio}.pdf`,
  image: { type: "jpeg", quality: 0.98 },
  html2canvas: { scale: 2 },
  jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
};


    // Generar el PDF
    html2pdf().set(options).from(pdfContent).save();
  };

  return (
    <>
      <button onClick={generatePDF} className="btn-generate-pdf">
        Descargar Proforma
      </button>
    </>
  );
};

export default PdfCreateProforma;