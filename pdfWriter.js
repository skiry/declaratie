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

	  function scoate_diacritice(cuvant) {
	  	var diacritice = [
	  	['Ă', 'A'], ['ă', 'a'], 
	  	['Â', 'A'], ['â', 'a'], 
	  	['Î', 'I'], ['î', 'i'], 
	  	['Ș', 'S'], ['ș', 's'], 
	  	['Ț', 'T'], ['ț', 't']
	  	];
	  	for (let pozitie = 0; pozitie < diacritice.length; ++pozitie) {
	  		let diacritica = diacritice[pozitie][0];
	  		while (cuvant.includes(diacritica)) {
	  			cuvant = cuvant.replace(diacritica, diacritice[pozitie][1]);
	  		}
	  	}
	  	return cuvant;
	  }

	  var fields = ["nume", "prenume", "deplasare", convertData("data_curenta")];
	  var locations = [[164, 666], [341, 666], [60, 507], [161, 121]];
	  var sizes = [12.4, 12.4, 14, 19.6];

	  for (let i = 0; i < fields.length; ++i) {
		let value = fields[i];
		if (i < 3) {
			value = document.getElementsByName(fields[i])[0].value;
			value = scoate_diacritice(value);
		}

		firstPage.drawText(value, {
	    x: locations[i][0],
	    y: locations[i][1],
	    size: sizes[i],
	    font: helveticaFont
	  })
	}

	  let adresa = document.getElementsByName("adresa")[0].value;
	  let maxLength = 56;
	  let cuvinteAdresa;

	  if (adresa.length > 56) {
	  	if (adresa.includes(' ') == false) {
	  		// no white-spaces, assume comma is the separator
	  		cuvinteAdresa = adresa.split(',');
	  	}
	  	else {
	  		// there is at least one ws, assume this the the separator as it should be....
	  		cuvinteAdresa = adresa.split(' ');
	  	}

	  	let limitSatisfied = true;
	  	let limitSindex = 0;
	  	let currentLength = 0;
	  	while (limitSatisfied && limitSindex < cuvinteAdresa.length) {
	  		if (currentLength + cuvinteAdresa[limitSindex].length + 1 < maxLength) {
	  			currentLength += cuvinteAdresa[limitSindex].length + 1;
	  			limitSindex += 1;
	  		}
	  		else {
	  			limitSatisfied = false;
	  		}
	  	}
	  	let adr;

	  	if (limitSindex < cuvinteAdresa.length) {
	  		adr = cuvinteAdresa.slice(0, limitSindex + 1);
	  		firstPage.drawText(scoate_diacritice(adr.join(' ')), {
			    x: 162,
			    y: 614,
			    size: 12.4,
			    font: helveticaFont
			})

	  		adr = cuvinteAdresa.slice(limitSindex + 1, cuvinteAdresa.length);
	  		firstPage.drawText(scoate_diacritice(adr.join(' ')), {
			    x: 162,
			    y: 589,
			    size: 12.4,
			    font: helveticaFont
			})
	  	}
	  	else {
	  		firstPage.drawText(scoate_diacritice(cuvinteAdresa.slice(0, cuvinteAdresa.length).join(' ')), {
			    x: 162,
			    y: 614,
			    size: 12.4,
			    font: helveticaFont
			})
	  	}
	  }

	  let zi = document.getElementsByName("zi")[0].value;
	  firstPage.drawText(zi, {
	    x: 164,
	    y: 641,
	    size: 12.4,
	    font: helveticaFont
	  })

	  let luna = document.getElementsByName("luna")[0].value;
	  firstPage.drawText(luna, {
	    x: 206,
	    y: 641,
	    size: 12.4,
	    font: helveticaFont
	  })

	  let an = document.getElementsByName("an")[0].value;
	  firstPage.drawText(an, {
	    x: 248,
	    y: 641,
	    size: 12.4,
	    font: helveticaFont
	  })

	  let checkboxes = document.getElementsByName("cb");
	  let found = 0;
	  for(let i = 2; i < 10; ++i) {
	  	if (checkboxes[i].checked) {
	  		found = i;
	  		fillInRadioButton(pdfDoc, 'Check Box'.concat((i + 1).toString()), 'Check Box1');
	  	}
	  }

	  if (checkboxes[0].checked == false) {
	  	// the first checkbox is not checked, deactivate it
	  	if (checkboxes[1].checked) {
		  	if (found > 0) {
		  		// there is another one we can copy from
		  		// deactivate the first one
		  		fillInRadioButton(pdfDoc, 'Check Box1', 'Check Box2');
		  		findAcroFieldByName(pdfDoc, 'Check Box1').set(PDFName.of('V'), PDFString.of('No'));
		  		// activate the second one by copying one that is filled in
		  		fillInRadioButton(pdfDoc, 'Check Box2', 'Check Box'.concat((found + 1).toString()));
		  	}
		  	else {
		  		fillInRadioButton(pdfDoc, 'Check Box2', 'Check Box1');
		  		fillInRadioButton(pdfDoc, 'Check Box1', 'Check Box3');
		  	 	findAcroFieldByName(pdfDoc, 'Check Box1').set(PDFName.of('V'), PDFString.of('No'));

		  	}
		}
		else {
				fillInRadioButton(pdfDoc, 'Check Box1', 'Check Box2');
		  	 	findAcroFieldByName(pdfDoc, 'Check Box1').set(PDFName.of('V'), PDFString.of('No'));
		}
	  }
	  else {
	  	// the first one is checked, let it as it is
	  	if (checkboxes[1].checked) {
	  		//if the second one is checked as well fill it in
			fillInRadioButton(pdfDoc, 'Check Box2', 'Check Box1');
	  	}
	  }
	  //logAcroFieldNames(pdfDoc);

	  const mycanvas = document.getElementById("signature-pad"); //get your canvas
      const pngUrl = mycanvas.toDataURL("image/png"); //Convert
	  const pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer())
	  const pngImage = await pdfDoc.embedPng(pngImageBytes);
	  let toScale = 0.25;

	  if (screen.width < 600){
	  	toScale = 0.125
	  }

	  const pngDims = pngImage.scale(toScale);
	  firstPage.drawImage(pngImage, {
	        x: 380,
	        y: 102,
	        width: pngDims.width,
	        height: pngDims.height,
	      })

	  const pdfBytes = await pdfDoc.save();

	  //const blob = new Blob([pdfBytes], {type: 'application/pdf'});
		//const blobURL = URL.createObjectURL(blob);
		//window.open(blobURL)

	  let numeFisier = "declaratie-proprie-raspundere-".concat(document.getElementsByName("prenume")[0].value).concat(".pdf");
	  // Trigger the browser to download the PDF document
	  download(pdfBytes, numeFisier, "application/pdf");
	 }

	main();	
}

//pdf as img