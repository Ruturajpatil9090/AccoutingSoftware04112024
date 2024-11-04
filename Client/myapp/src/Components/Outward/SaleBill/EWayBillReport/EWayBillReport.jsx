import React, {useEffect, useState} from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import QRCode from "qrcode"; // Importing QR code generation library
import JsBarcode from "jsbarcode";
import Scrollbar from "../../../../Assets/scrollbar.png"
import SaleBillReport from "../SaleBillReport"

const API_URL = process.env.REACT_APP_API;
const companyCode = sessionStorage.getItem("Company_Code");
const Year_Code = sessionStorage.getItem("Year_Code");


const EWayBillReport = ({doc_no,disabledFeild}) => {
  const [apiData, setApiData] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/generating_saleBill_report?Company_Code=${companyCode}&Year_Code=${Year_Code}&doc_no=${doc_no}`);
      const data = await response.json();
      setApiData(data.all_data);  // Assuming the relevant data is in the 'all_data' field of the API response
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();  // Fetch the data when the component mounts
  }, [doc_no]);


  const generatePdf = async () => {
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  

    // Generate the QR code dynamically
    const qrCodeData = `Invoice No: ${apiData[0].doc_no}, Date: ${apiData[0].doc_dateConverted}, Total: ${apiData[0].item_Amount}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, { width: 100, height: 100 });

    // Add the QR code to the top-right corner
    pdf.addImage(qrCodeDataUrl, "PNG", 500, 0, 80, 80); // QR code in the top-right corner


    const canvas = document.createElement('canvas');
    JsBarcode(canvas, "281813269806", { format: "CODE128" }); 
    const barcodeDataUrl = canvas.toDataURL("image/png");

    // Add the barcode to the PDF (e.g., at the bottom or desired location)
    pdf.addImage(barcodeDataUrl, "PNG", 200, 500, 150, 50);

    // Add E-Way Bill header details
    pdf.setFontSize(14);
    pdf.setFont("arial", "bold");
    pdf.text("e-WAY BILL", 40, 60); // Title aligned to the left

    // Line below the title
    pdf.setLineWidth(0.2);
    pdf.line(40, 72, 555, 72); // Bold line below title

    pdf.setFontSize(12);
    pdf.setFont("arial", "bold");
    pdf.text("E-WAY BILL Details", 40, 84);
    pdf.line(40, 90, 555, 90); 

    pdf.setFontSize(8);
    pdf.setFont("arial", "normal");

    const leftMargin = 40;
    const gapBetweenTexts = 140;

    // E-Way Bill No, Generated Date, Generated By, and Valid Upto in one row
    // Define the content before and after the colon
const details = [
  { label: "E-Way Bill No:", value: "2818 1326 9806" },
  { label: "Generated Date:", value: "21/08/2024 12:07 PM" },
  { label: "Generated By:", value: "27AAE CJ833 2R1ZV" },
  { label: "Valid Upto:", value: "26/08/2024" }
];

// Loop to print each detail with normal before the colon and bold after
details.forEach((detail, index) => {
  // Set normal font for the label (before colon)
  pdf.setFont("arial", "normal");
  pdf.setFontSize(8);
  pdf.text(detail.label, leftMargin + (index * gapBetweenTexts), 102);

  // Set bold font for the value (after colon)
  pdf.setFont("arial", "bold");
  pdf.text(detail.value, leftMargin + (index * gapBetweenTexts) + pdf.getTextWidth(detail.label) + 2, 102);
});


    // Line separating the "E-Way Bill Details" section
    pdf.setLineWidth(0.2);
    pdf.line(40, 112, 555, 112); 

    // Mode and Type
    // Define the content before and after the colon
const infoDetails = [
  { label: "Mode:", value: "Road", x: 40, y: 124 },
  { label: "Type:", value: "Outward - Supply", x: 40, y: 144 },
  { label: "Approx Distance:", value: "850km", x: 200, y: 124 },
  { label: "Document Details:", value: "Tax Invoice - SB2024-25-3900", x: 200, y: 144 },
  { label: "Transaction Type:", value: "Bill From - Dispatch From", x: 400, y: 148 }
];

pdf.line(40,132,555,132)

// Loop through each detail and apply normal font before the colon and bold after
infoDetails.forEach((detail) => {
  // Set normal font for the label (before colon)
  pdf.setFont("arial", "normal");
  pdf.setFontSize(8);
  pdf.text(detail.label, detail.x, detail.y);

  // Set bold font for the value (after colon)
  pdf.setFont("arial", "bold");
  pdf.text(detail.value, detail.x + pdf.getTextWidth(detail.label) + 2, detail.y);
});


    // Line above "RN"
    pdf.line(40, 152, 555, 152);
    pdf.setFont("arial", "normal");
pdf.setFontSize(8);
pdf.text("RN:", 40, 161);

// Set bold font for the value after "RN:"
pdf.setFont("arial", "bold");
pdf.text("100843f9324a0259c4386b5a36a08960c65d5aef647e29b5e24aa72c0", 40 + pdf.getTextWidth("RN:") + 2, 161);

    // Line above Address Details
    pdf.line(40, 167, 555, 167);
    pdf.setFontSize(9);
    pdf.setFont("arial", "bold");
    pdf.text("Address Details", 40, 176); // Address header
    pdf.line(40, 182, 555, 182);
    // Simulate Scrollable Boxes for "From" and "To" sections using rectangles
    pdf.setFontSize(9);
    pdf.setFont("arial", "bold");

    // "From" section with simulated scrollable box
    pdf.text("From:", 40, 195);
    pdf.rect(40, 200, 220, 80); // Box around the "From" details

    pdf.setFontSize(9);
    pdf.setFont("arial", "normal");

    const fromDetails = [
        "GSTIN: 27AAE CJ833 2R1ZV",
        "JK Sugars And Commodities Pvt Ltd",
        "Shahunagar Parite, Taluka Kolhapur",
        "Maharashtra - 416211"
      ];
  
      // Wrap text within the box for "From" section (like "To" section)
      const fromDetailsWrapped = pdf.splitTextToSize(fromDetails.join(", "), 200); // Limit to 200 width
      let fromYPosition = 215;
      fromDetailsWrapped.forEach(line => {
        if (fromYPosition <= 280) { // Ensure text stays within the box height
          pdf.text(line, 50, fromYPosition);
          fromYPosition += 15;
        }
      });

      const scrollbarXStartFrom = 40 + 220 - 8; // Adjust this to move scrollbar closer to the right edge of "From" box
const scrollbarXEndFrom = scrollbarXStartFrom + 6; // Create a wider scrollbar by adjusting the width
const scrollbarYStartFrom = 200;
const scrollbarYEndFrom = 280; // Match the box height

// Draw the outer lines of the wider scrollbar for "From" section
pdf.setLineWidth(1);
pdf.setDrawColor(150, 150, 150); // Gray color for the scrollbar
pdf.line(scrollbarXStartFrom, scrollbarYStartFrom, scrollbarXStartFrom, scrollbarYEndFrom); // Left edge of scrollbar
pdf.line(scrollbarXEndFrom, scrollbarYStartFrom, scrollbarXEndFrom, scrollbarYEndFrom); // Right edge of scrollbar

// Draw arrows within the scrollbar box itself for "From" section
pdf.setFillColor(0, 0, 0); // Set arrow color to black

// Upward arrow at the top of the scrollbar in "From" section
pdf.triangle(
  (scrollbarXStartFrom + scrollbarXEndFrom) / 2, scrollbarYStartFrom + 3, // Top point (middle)
  scrollbarXStartFrom, scrollbarYStartFrom + 8,  // Left point
  scrollbarXEndFrom, scrollbarYStartFrom + 8,    // Right point
  'FD' // Fill and Draw
);

// Downward arrow at the bottom of the scrollbar in "From" section
pdf.triangle(
  (scrollbarXStartFrom + scrollbarXEndFrom) / 2, scrollbarYEndFrom - 3,  // Bottom point (middle)
  scrollbarXStartFrom, scrollbarYEndFrom - 8,    // Left point
  scrollbarXEndFrom, scrollbarYEndFrom - 8,      // Right point
  'FD' // Fill and Draw
);

    // "To" section with simulated scrollable box
    pdf.text("To:", 300, 195);
    pdf.rect(300, 200, 220, 80); // Box around the "To" details

    const toDetails = [
      "GSTIN: 33ALS PV084 7P1Z6",
      "Sri Om Sakthi Enterprises, 65 Appasamy Street, Shevapet, Salem, Tamil Nadu - 636002",
      "Additional info: Custom text that might extend into a long line to trigger wrapping and test overflow behavior."
    ];

    // Wrap text within the box for "To" section
    const toDetailsWrapped = pdf.splitTextToSize(toDetails.join(", "), 200); // Limit to 200 width
    let toYPosition = 215;
    toDetailsWrapped.forEach(line => {
      if (toYPosition <= 280) { // Ensure text stays within the box height
        pdf.text(line, 310, toYPosition);
        toYPosition += 15;
      }
    });

    const scrollbarXStart = 300 + 220 - 8; // Adjust this to move scrollbar closer to the right edge
const scrollbarXEnd = scrollbarXStart + 6; // Create a wider scrollbar by adjusting the width
const scrollbarYStart = 200;
const scrollbarYEnd = 280; // Match the box height

// Draw the outer lines of the wider scrollbar
pdf.setLineWidth(1);
pdf.setDrawColor(150, 150, 150); // Gray color for the scrollbar
pdf.line(scrollbarXStart, scrollbarYStart, scrollbarXStart, scrollbarYEnd); // Left edge of scrollbar
pdf.line(scrollbarXEnd, scrollbarYStart, scrollbarXEnd, scrollbarYEnd); // Right edge of scrollbar

// Draw arrows within the scrollbar box itself
pdf.setFillColor(0, 0, 0); // Set arrow color to black

// Upward arrow at the top of the scrollbar
pdf.triangle(
  (scrollbarXStart + scrollbarXEnd) / 2, scrollbarYStart + 3, // Top point (middle)
  scrollbarXStart, scrollbarYStart + 8,  // Left point
  scrollbarXEnd, scrollbarYStart + 8,    // Right point
  'FD' // Fill and Draw
);

// Downward arrow at the bottom of the scrollbar
pdf.triangle(
  (scrollbarXStart + scrollbarXEnd) / 2, scrollbarYEnd - 3,  // Bottom point (middle)
  scrollbarXStart, scrollbarYEnd - 8,    // Left point
  scrollbarXEnd, scrollbarYEnd - 8,      // Right point
  'FD' // Fill and Draw
);


    pdf.setLineWidth(0.2)
    pdf.line(40, 290, 555, 290); 
    // Goods Details
    pdf.setFontSize(9);
    pdf.setFont("arial", "bold");
    pdf.text("Goods Details", 40, 300);

    pdf.setFontSize(8);
    pdf.setFont("arial", "noral");
    pdf.line(40, 305, 555, 305); // Draw line at y = 310
pdf.text("Please Refer IRN Print to view Goods Details..", 40, 315); 
pdf.line(40, 320, 555, 320); 
    

    const goodsTableData = [
      ["Total Taxable Amt", "CGST Amt", "SGST Amt", "IGST Amt", "CESS Amt", "Total Inv Amt"],
      ["897000.00", "0.00", "0.00", "44850.00", "0.00", "941850.00"],
    ];

    // Adding grid-style table with some styling
    pdf.autoTable({
      startY: 330,
      head: [goodsTableData[0]],
      body: [goodsTableData[1]],
      theme: "grid",
      styles: { fontSize: 9, halign: "center", valign: "middle", font: "arial" }, // Default font set to Arial
      margin: { left: 40 },
      headStyles: { 
        fontStyle: "bold", // Bold header font
        font: "arial", // Arial font for the header
        fillColor: [255, 255, 255], // Set background fill to white (or use null if supported)
        textColor: [0, 0, 0] // Set text color to black to make it visible
      },
      bodyStyles: {
        fontStyle: "normal", // Normal body font
        font: "arial" // Arial font for the body
      },
      tableLineColor: [0, 0, 0], // Black border
      tableLineWidth: 0.2,
    });
    
    // Vehicle Details Section
    pdf.setFontSize(9);
    pdf.setFont("arial", "bold");
    pdf.line(40, 380, 555, 380); 
    pdf.text("Vehicle Details", 40, pdf.lastAutoTable.finalY + 18);

    pdf.line(40, 395, 555, 395); 
    pdf.setFontSize(9);// Draw line at y = 310
pdf.text("Transpoter ID & Name", 40, 407); 
pdf.text("Transpoter Doc No & Date", 380, 407); 
pdf.line(40, 415, 555, 415); 

    // Vehicle table details
    const vehicleTableData = [
      ["Mode", "Vehicle No", "From", "Entered Date", "Entered By"],
      ["Road", "KA01AN5702", "PARITE", "21/08/2024 12:07 PM", "27AAE CJ833 2R1ZV"],
    ];

    pdf.autoTable({
      startY: pdf.lastAutoTable.finalY + 50,
      head: [vehicleTableData[0]],
      body: [vehicleTableData[1]],
      theme: "grid",
      styles: { fontSize: 9, halign: "center", valign: "middle", font: "arial" }, // Default font set to Arial
      margin: { left: 40 },
      headStyles: { 
        fontStyle: "bold", // Bold header font
        font: "arial" ,// Arial font for the header
        fillColor: [255, 255, 255], // Set background fill to white (or use null if supported)
        textColor: [0, 0, 0]
      },
      bodyStyles: {
        fontStyle: "normal", // Normal body font
        font: "arial" // Arial font for the body
      },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.2,
    });
    pdf.text("Note: If any discrepancy in information please try after sometime", 40, 700)
    

    // Preview the PDF in a new window
    const pdfData = pdf.output('datauristring'); // Generate the PDF as a data URL
    const newWindow = window.open(); // Open a new browser window
    newWindow.document.write(`<iframe width='100%' height='100%' src='${pdfData}'></iframe>`); // Embed the PDF in an iframe for preview
  };

  return (
    <div className="centered-container" style={{marginTop:'10px'}}>
      <button disabled={disabledFeild} onClick={generatePdf}>Generate E-Way Bill PDF</button>
    </div>
  );
};

export default EWayBillReport;
