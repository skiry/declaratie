const {
	  drawImage,
	  drawLinesOfText,
	  drawRectangle,
	  drawText,
	  StandardFonts,
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

    function convertData(str) {
    	let date = document.getElementsByName(str)[0].value.split('-');
    	return date[2].concat('.').concat(date[1]).concat('.').concat(date[0]);
    }

	const main = async function () {
	  const url = './declaratie-buna.pdf';
	  const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());

	  // Load a PDFDocument from the existing PDF bytes
	  const pdfDoc = await PDFDocument.load(existingPdfBytes);
	  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
	  const pages = pdfDoc.getPages();
  	  const firstPage = pages[0];

	  const acroForm = getAcroForm(pdfDoc);
	  acroForm.set(PDFName.of('NeedAppearances'), PDFBool.True);

	  var fields = ["nume", "prenume", "deplasare", "adresa", convertData("data_curenta")];
	  var locations = [[164, 666], [341, 666], [60, 507], [162, 614], [161, 121]];
	  var sizes = [12.4, 12.4, 14, 12.4, 19.6];

	  for (let i = 0; i < fields.length; ++i) {
		let value = fields[i];
		if (i < 3) {
			value = document.getElementsByName(fields[i])[0].value;
		}
		firstPage.drawText(value, {
	    x: locations[i][0],
	    y: locations[i][1],
	    size: sizes[i],
	    font: helveticaFont
	  })
	}
	  let birthdate = document.getElementsByName("data")[0].value.split('-');
	  firstPage.drawText(birthdate[2], {
	    x: 164,
	    y: 641,
	    size: 12.4,
	    font: helveticaFont
	  })

	  firstPage.drawText(birthdate[1], {
	    x: 206,
	    y: 641,
	    size: 12.4,
	    font: helveticaFont
	  })

	  firstPage.drawText(birthdate[0], {
	    x: 250,
	    y: 641,
	    size: 12.4,
	    font: helveticaFont
	  })

	  let checkboxes = document.getElementsByName("cb");
	  let found = 0;
	  for(let i = 2; i < 10; ++i) {
	  	if (checkboxes[i].checked) {
	  		found = i;
	  		fillInRadioButton(pdfDoc, 'Check Box'.concat(i.toString()), 'Check Box1');
	  	}
	  }
	  if (checkboxes[0].checked == false) {
	  	// the first checkbox is not checked, deactivate it
	  	if (found > 0) {
	  		// there is another one we can copy from

	  		// deactivate the first one
	  		fillInRadioButton(pdfDoc, 'Check Box1', 'Check Box2');
	  		// activate the second one by copying one that is filled in
	  		fillInRadioButton(pdfDoc, 'Check Box2', 'Check Box'.concat((found + 1).toString()));
	  	}
	  	else {
	  		fillInRadioButton(pdfDoc, 'Check Box2', 'Check Box1');
	  		fillInRadioButton(pdfDoc, 'Check Box1', 'Check Box3');
	  	}

	  	// if the second is, activate it with one of te above
	  }
	  else {
	  	// the first one is checked, let it as it is
	  	if (checkboxes[1].checked) {
	  		//if the second one is checked as well fill it in
			fillInRadioButton(pdfDoc, 'Check Box2', 'Check Box1');
	  	}
	  }
	  logAcroFieldNames(pdfDoc);

	  const pdfBytes = await pdfDoc.save();

	  let numeFisier = "declaratie-proprie-raspundere-".concat(document.getElementsByName("prenume")[0].value).concat(".pdf");
	  // Trigger the browser to download the PDF document
	  download(pdfBytes, numeFisier, "application/pdf");
	 }

	main();	
}
	

/*
//TODO
-draw on the pdf, along with writing the values, for portability -if one wants to change his file-
-fix stuff with checkboxes - take care if i bifate 1 and 2, stuff...

 var mycanvas = document.getElementById("signature-pad"); //get your canvas
var image = mycanvas.toDataURL("image/png"); //Convert
document.getElementById("semnatura_hidden").src = image;
image = image.replace('data:image/png;base64,', '');
document.getElementById("semnatura_hidden").value = image;

doc.addImage(image, "PNG", 125, 170, 50, 25);

thats how they do it


*/

