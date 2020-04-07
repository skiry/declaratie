// part that saves stuff into Local Storage and sets the today's date as default
document.addEventListener('DOMContentLoaded', function onload(){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; 
	var yyyy = today.getFullYear();
	yyyy = parseInt(yyyy);
	if (mm < 10) {
		mm = "0" + mm;
	}
	if (dd < 10) {
	  	dd = "0" + dd;
	}
	today = yyyy+'-'+mm+'-'+dd;

	document.getElementById("data_curenta").value = today;
	var fields = ["nume", "prenume", "zi", "luna", "an", "adresa", "deplasare"];
	for (let i = 0; i < fields.length; ++i) {
	  	let result = localStorage.getItem(fields[i]);
		let current = document.getElementsByName(fields[i])[0];
		if (result != null) {
		  current.value = result;
		}
	}

	let zi = document.getElementsByName("zi")[0];
	let luna = document.getElementsByName("luna")[0];
	let an = document.getElementsByName("an")[0];
	let adresa = document.getElementsByName("adresa")[0];

	zi.onkeyup = function() {
	    if (this.value.length == 2) {
	        luna.focus();
	    }
	}

	luna.onkeyup = function() {
	    if (this.value.length == 2) {
	        an.focus();
	    }
	}

	an.onkeyup = function() {
	    if (this.value.length == 4) {
	        adresa.focus();
	    }
	}

	document.getElementById("getPdf").addEventListener('click', saveText);

	var acc = document.getElementsByClassName("accordion");

	for (let i = 0; i < acc.length; i++) {
	  acc[i].addEventListener("click", function() {
	    this.classList.toggle("active");
	    var panel = this.nextElementSibling;
	    if (panel.style.display === "block") {
	      panel.style.display = "none";
	    } else {
	      panel.style.display = "block";
	    }
	  });
	}
}, false);

function saveText(e) {
	var fields = ["nume", "prenume", "zi", "luna", "an", "adresa", "deplasare"];
	for (let i = 0; i < fields.length; ++i) {
		localStorage.setItem(fields[i], document.getElementsByName(fields[i])[0].value);
	} 	
}


// here is the code that makes signing so easy 
var canvas = document.getElementById('signature-pad');

// Adjust canvas coordinate space taking into account pixel ratio,
// to make it look crisp on mobile devices.
// This also causes canvas to be cleared.
function resizeCanvas() {
    // When zoomed out to less than 100%, for some very strange reason,
    // some browsers report devicePixelRatio as less than 1
    // and only part of the canvas is cleared then.
    var ratio =  Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
}

//window.onresize = resizeCanvas;
resizeCanvas();

var signaturePad = new SignaturePad(canvas, {
  //backgroundColor: 'rgb(255, 255, 255)' // necessary for saving image as JPEG; can be removed is only saving as PNG or SVG
});

document.getElementById('clear').addEventListener('click', function () {
  signaturePad.clear();
});

