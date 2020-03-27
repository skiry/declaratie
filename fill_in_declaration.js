function generate_pdf() {
	console.log("running")
	var element = document.getElementById('element-to-print');
	html2pdf(element);
}