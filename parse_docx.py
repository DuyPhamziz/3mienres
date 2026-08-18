import zipfile
import xml.etree.ElementTree as ET
import re

docx_path = "B2306614_NguyenHoangHao_DoAn.docx"

with zipfile.ZipFile(docx_path) as docx:
    xml_content = docx.read("word/document.xml")
    
tree = ET.fromstring(xml_content)
namespaces = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
}

paragraphs = []
for p in tree.iterfind('.//w:p', namespaces):
    texts = [t.text for t in p.iterfind('.//w:t', namespaces) if t.text]
    if texts:
        paragraphs.append("".join(texts))

output_text = "\n".join(paragraphs)
with open("doc_content.txt", "w", encoding="utf-8") as f:
    f.write(output_text)

print(f"Successfully extracted {len(paragraphs)} paragraphs, total {len(output_text)} chars.")
