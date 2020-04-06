const {
	  drawImage,
	  drawLinesOfText,
	  drawRectangle,
	  drawText,
	  PDFDocument,
	  PDFName,
	  PDFNumber,
	  PDFString,
	  PDFBool
	} = PDFLib

async function modifyPdf() {

	var x = document.getElementById("frm1");

	const getAcroForm = (pdfDoc) => {
	  return pdfDoc.context.lookup(pdfDoc.catalog.get(PDFName.of('AcroForm')));
	}

	const getAcroFields = (pdfDoc) => {
	  if (!pdfDoc.catalog.get(PDFName.of('AcroForm'))) return [];
	  const acroForm = pdfDoc.context.lookup(pdfDoc.catalog.get(PDFName.of('AcroForm')));

	  if (!acroForm.get(PDFName.of('Fields'))) return [];
	  const acroFields = acroForm.context.lookup(acroForm.get(PDFName.of('Fields')));

	  return acroFields.array.map(ref => acroForm.context.lookup(ref));
	};

	const findAcroFieldByName = (pdfDoc, name) => {
	  const acroFields = getAcroFields(pdfDoc);
	  return acroFields.find((acroField) => {
	    const fieldName = acroField.get(PDFName.of('T'));
	    return !!fieldName && fieldName.value === name;
	  });
	};

	const logAcroFieldNames = (pdfDoc) => {
	  const acroFields = getAcroFields(pdfDoc);
	  acroFields.forEach((acroField) => {
	    console.log(
	      'Field Name:',
	      acroField.get(PDFName.of('T')).toString(),
	      'Field Value:',
	      acroField.get(PDFName.of('V')),
	      'All',
	      acroField
	    );
	  });
	};


	const fillInField = (pdfDoc, fieldName, text) => {
	  const toFillField = findAcroFieldByName(pdfDoc, fieldName);
	  if (!toFillField) throw new Error(`Missing AcroField: ${fieldName}`);
	  toFillField.set(PDFName.of('V'), PDFString.of(text));
	};

	const fillInRadioButton = (pdfDoc, fieldName, alreadyFilledIn) => {
	  var toFillField = findAcroFieldByName(pdfDoc, fieldName);
	  const filledField = findAcroFieldByName(pdfDoc, alreadyFilledIn);
	  if (!toFillField) throw new Error(`Missing AcroField: ${fieldName}`);
	  if (!filledField) throw new Error(`Missing AcroField: ${alreadyFilledIn}`);
	  pdfFields = ['AP', 'AS', 'DA', 'F', 'FT', 'MK', 'P', 'Subtype', 'Type', 'V']
	  for(let i = 0; i < pdfFields.length; i++) {
	  	toFillField.set(PDFName.of(pdfFields[i]), filledField.get(PDFName.of(pdfFields[i])));
	  }
	};

	const main = async function () {
	  const url = './declaratie-buna.pdf'
	  const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())

	  // Load a PDFDocument from the existing PDF bytes
	  const pdfDoc = await PDFDocument.load(existingPdfBytes)
	  const acroForm = getAcroForm(pdfDoc);
	  acroForm.set(PDFName.of('NeedAppearances'), PDFBool.True);

	  fillInRadioButton(pdfDoc, 'Check Box3', 'Check Box1');
	  fillInField(pdfDoc, 'nume', x.elements[0].value);
	  fillInField(pdfDoc, 'prenume', x.elements[1].value);
	  logAcroFieldNames(pdfDoc);

	  const pdfBytes = await pdfDoc.save();

	  // Trigger the browser to download the PDF document
	  download(pdfBytes, "pdf-lib_modification_example.pdf", "application/pdf");
	 }
	 
	main();	
}
	