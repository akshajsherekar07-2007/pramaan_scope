from pathlib import Path
import re
from html import escape
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/pdf/PramaanScope_Prototype_Demonstration_Script.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont('Calibri', 'C:/Windows/Fonts/calibri.ttf'))
pdfmetrics.registerFont(TTFont('Calibri-Bold', 'C:/Windows/Fonts/calibrib.ttf'))
pdfmetrics.registerFont(TTFont('Calibri-Italic', 'C:/Windows/Fonts/calibrii.ttf'))
pdfmetrics.registerFontFamily('Calibri', normal='Calibri', bold='Calibri-Bold', italic='Calibri-Italic', boldItalic='Calibri-Bold')
NAVY = colors.HexColor('#172B43')
TEAL = colors.HexColor('#0F766E')
MUTED = colors.HexColor('#526176')
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyCopy', fontName='Calibri', fontSize=10, leading=13.2, textColor=NAVY, spaceAfter=5))
styles.add(ParagraphStyle(name='SceneTitle', fontName='Calibri-Bold', fontSize=16, leading=19, textColor=NAVY, spaceBefore=8, spaceAfter=8, keepWithNext=True))
styles.add(ParagraphStyle(name='Narration', fontName='Calibri', fontSize=11.2, leading=15.3, textColor=NAVY, backColor=colors.HexColor('#EEF7F4'), borderPadding=10, leftIndent=10, rightIndent=10, spaceBefore=9, spaceAfter=14))
styles.add(ParagraphStyle(name='SectionLabel', fontName='Calibri-Bold', fontSize=10, leading=13, textColor=TEAL, spaceBefore=5, spaceAfter=6, keepWithNext=True))
styles.add(ParagraphStyle(name='SmallCopy', fontName='Calibri', fontSize=9, leading=11.5, textColor=MUTED, spaceAfter=5))
styles.add(ParagraphStyle(name='CodeCopy', fontName='Calibri', fontSize=10, leading=13, textColor=NAVY, backColor=colors.HexColor('#F3F5F8'), borderPadding=8, leftIndent=8, rightIndent=8, spaceAfter=12))

def clean(text):
    return text.replace('\u2011', '-').replace('\u2013', '-').replace('\u2014', '-').replace('Try a real local OCR sample', 'Preview OCR sample').replace("Keep the prototype's synthetic-data label visible.", 'Keep the Demo workspace label visible. Explain sample data and simulated verification in Scene 8.')

def inline(text):
    text = escape(clean(text.strip()))
    return re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)

def render_markdown(text):
    result = []
    lines = text.strip().splitlines()
    index = 0
    while index < len(lines):
        line = lines[index].strip()
        if not line or line == '---':
            index += 1
            continue
        if line.startswith('```'):
            block = []
            index += 1
            while index < len(lines) and not lines[index].startswith('```'):
                block.append(inline(lines[index]))
                index += 1
            result.append(Paragraph('<br/>'.join(block), styles['CodeCopy']))
        elif line.startswith('> '):
            result.append(Paragraph(inline(line[2:]), styles['Narration']))
        elif line.startswith('## '):
            result.append(Paragraph(inline(line[3:]), styles['SceneTitle']))
        elif line.startswith('**Time:') or line.startswith('**Screen:'):
            result.append(Paragraph(inline(line), styles['SmallCopy']))
        elif line.startswith('|'):
            rows = []
            while index < len(lines) and lines[index].strip().startswith('|'):
                cells = [c.strip() for c in lines[index].strip().strip('|').split('|')]
                if not all(re.match(r'^:?-+:?$', c) for c in cells):
                    rows.append([Paragraph(inline(c), styles['SmallCopy']) for c in cells])
                index += 1
            table = Table(rows, colWidths=[340, 155], repeatRows=1, hAlign='LEFT')
            table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#E8EEF3')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white, colors.HexColor('#F6F8FA')]),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),4)]))
            result.append(table)
            continue
        elif line.startswith('- ') or re.match(r'^\d+\. ', line):
            prefix = '- ' if line.startswith('- ') else re.match(r'^\d+\. ', line).group()
            result.append(Paragraph(inline(line[len(prefix):]), ParagraphStyle(name='ListItem', parent=styles['BodyCopy'], leftIndent=12, firstLineIndent=0, bulletIndent=0), bulletText=prefix.strip()))
        elif line.startswith('**') and line.endswith('**'):
            result.append(Paragraph(inline(line), styles['SectionLabel']))
        else:
            result.append(Paragraph(inline(line), styles['BodyCopy']))
        index += 1
    return result

source = (ROOT / 'submission/PramaanScope_3_Minute_Demo_Script.md').read_text(encoding='utf-8')
scene_parts = re.split(r'(?=^## Scene \d+)', source, flags=re.M)
intro = scene_parts[0]
scenes = scene_parts[1:]
last_scene, appendix = scenes[-1].split('\n---\n', 1)
scenes[-1] = last_scene
story = []
title_style = ParagraphStyle(name='TitleCustom', fontName='Calibri-Bold', fontSize=28, leading=31, textColor=NAVY, spaceAfter=8)
story.append(Paragraph('PramaanScope', title_style))
story.append(Paragraph('PROTOTYPE DEMONSTRATION SCRIPT', styles['SectionLabel']))
story.append(Paragraph('CELESTIAL_OUTLAWS  |  Akshaj Sherekar  |  SIH26261', styles['SmallCopy']))
story.append(Paragraph('<b>Target: 2:55 + 5-second buffer</b>  |  Approximately 400 spoken words', styles['BodyCopy']))
story.append(Paragraph('Read the shaded narration aloud. The screen actions and captions are recording instructions. Capture short clips separately so uploads, typing and OCR do not interrupt the voiceover.', styles['SmallCopy']))
story.append(Spacer(1, 5))
for i, scene in enumerate(scenes):
    if i and i % 2 == 0:
        story.append(PageBreak())
    story.extend(render_markdown(scene))
    if i % 2 == 0:
        story.append(Spacer(1, 10))

appendix_sections = re.split(r'(?=^## )', appendix, flags=re.M)
coverage_sections = [s for s in appendix_sections if s.startswith('## Feature and USP coverage')]
appendix_sections = [s for s in appendix_sections if not s.startswith('## Feature and USP coverage')] + coverage_sections
for section in appendix_sections:
    if not section.strip():
        continue
    if section.startswith('## Recording preparation') or section.startswith('## Feature and USP coverage'):
        story.append(PageBreak())
    story.extend(render_markdown(section))

def furniture(c, doc):
    w, h = doc.pagesize
    c.setStrokeColor(colors.HexColor('#DAE3EB'))
    c.line(50, h-39, w-50, h-39)
    c.setFont('Calibri-Bold', 9)
    c.setFillColor(TEAL)
    c.drawString(50, h-29, 'PRAMAANSCOPE / VIDEO SCRIPT')
    c.setFillColor(MUTED)
    c.setFont('Calibri', 9)
    c.drawRightString(w-50, h-29, 'CELESTIAL_OUTLAWS')
    c.line(50, 40, w-50, 40)
    c.drawString(50, 27, 'Narration + screen actions | Recording edition')
    c.drawRightString(w-50, 27, str(doc.page))

doc = SimpleDocTemplate(str(OUT), pagesize=(595.28,841.89), rightMargin=50, leftMargin=50, topMargin=57, bottomMargin=55, title='PramaanScope - Prototype Demonstration Script', author='CELESTIAL_OUTLAWS', pageCompression=1)
doc.build(story, onFirstPage=furniture, onLaterPages=furniture)
reader = PdfReader(str(OUT))
text = '\n'.join(p.extract_text() for p in reader.pages)
assert all(f'Scene {n}' in text for n in range(1,11))
assert 'Claim boundaries' in text and 'Feature and USP coverage' in text
print(f'{OUT}\nPages: {len(reader.pages)}\nAll 10 scenes and recording notes verified.')
