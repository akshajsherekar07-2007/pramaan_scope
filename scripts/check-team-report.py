"""Render all report pages and produce review sheets without touching app data."""
from pathlib import Path
import subprocess
import json
from PIL import Image, ImageOps, ImageDraw
import pdfplumber
from pypdf import PdfReader

root=Path(__file__).resolve().parents[1]
pdf=root/'output/pdf/PramaanScope-Complete-Team-Summary.pdf'
qa=root/'tmp/pdfs/team-summary'
qa.mkdir(parents=True,exist_ok=True)
subprocess.run(['pdftoppm','-r','65','-png',str(pdf),str(qa/'page')],check=True)
files=sorted(qa.glob('page-*.png'))
for start in range(0,len(files),8):
    sheet=Image.new('RGB',(1280,1740),'#dce3ec')
    draw=ImageDraw.Draw(sheet)
    for j,path in enumerate(files[start:start+8]):
        im=Image.open(path).convert('RGB')
        im.thumbnail((300,825))
        x=10+(j%4)*320; y=30+(j//4)*865
        sheet.paste(im,(x,y)); draw.text((x,y-18),f'PAGE {start+j+1}',fill='#14243b')
    sheet.save(qa/f'contact-{start//8+1}.png')
reader=PdfReader(str(pdf))
links=sum(len(pg.get('/Annots',[])) for pg in reader.pages)
outside=[]
with pdfplumber.open(pdf) as doc:
    for i,pg in enumerate(doc.pages,1):
        bad=[c for c in pg.chars if c['x0']<35 or c['x1']>560 or c['top']<15 or c['bottom']>827]
        if bad: outside.append({'page':i,'text':''.join(c['text'] for c in bad)[:100]})
print(json.dumps({'pages':len(files),'links':links,'outsideSafePageBounds':outside,'contactSheets':[str(p) for p in sorted(qa.glob('contact-*.png'))]},indent=2))
if outside: raise RuntimeError('Text exceeds report safe bounds')
