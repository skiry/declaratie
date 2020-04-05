from PyPDF2 import PdfFileWriter, PdfFileReader
from PyPDF2.generic import BooleanObject, NameObject, IndirectObject
import argparse

def parse_arguments():
    parser = argparse.ArgumentParser()
    parser.add_argument('nume', metavar='NUME')
    parser.add_argument('prenume', metavar='PRENUME')
    parser.add_argument('ziua', metavar='ZIUA')
    parser.add_argument('luna', metavar='LUNA')
    parser.add_argument('anul', metavar='ANUL')
    parser.add_argument('adresa_1', metavar='ADRESA_1')
    parser.add_argument('adresa_2', metavar='ADRESA_2')
    parser.add_argument('deplasare', metavar='DEPLASARE')
    parser.add_argument('data', metavar='DATA')
    parser.add_argument('checked', metavar='CHECKED')
    args = parser.parse_args()
    return args

def set_need_appearances_writer(writer: PdfFileWriter):
    # See 12.7.2 and 7.7.2 for more information: http://www.adobe.com/content/dam/acom/en/devnet/acrobat/pdfs/PDF32000_2008.pdf
    try:
        catalog = writer._root_object
        # get the AcroForm tree
        if "/AcroForm" not in catalog:
            writer._root_object.update({
                NameObject("/AcroForm"): IndirectObject(len(writer._objects), 0, writer)})

        need_appearances = NameObject("/NeedAppearances")
        writer._root_object["/AcroForm"][need_appearances] = BooleanObject(True)
        return writer

    except Exception as e:
        print('set_need_appearances_writer() catch : ', repr(e))
        return writer

infile = "declaratie_completata.pdf"
outfile = "declaratie_completat2a.pdf"

pdf = PdfFileReader(open(infile, "rb"), strict=False)
if "/AcroForm" in pdf.trailer["/Root"]:
    pdf.trailer["/Root"]["/AcroForm"].update(
        {NameObject("/NeedAppearances"): BooleanObject(True)})

pdf2 = PdfFileWriter()
set_need_appearances_writer(pdf2)
if "/AcroForm" in pdf2._root_object:
    pdf2._root_object["/AcroForm"].update(
        {NameObject("/NeedAppearances"): BooleanObject(True)})

args = parse_arguments()
print(pdf.getFields())
field_dictionary = {
    "nume": args.nume, 
    "prenume": args.prenume,
    "ziua": args.ziua,
    "luna": args.luna,
    "anul": args.anul,
    "adresa_1": args.adresa_1,
    "adresa_2": args.adresa_2,
    "deplasare": args.deplasare,
    "data": args.data,
    "2": '/Choice1'
    }

pdf2.addPage(pdf.getPage(0))
pdf2.updatePageFormFieldValues(pdf2.getPage(0), field_dictionary)

outputStream = open(outfile, "wb")
pdf2.write(outputStream)