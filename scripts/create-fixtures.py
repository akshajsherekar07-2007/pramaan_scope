"""Build clearly synthetic OCR/document fixtures, not photographs of a real institution."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1] / 'public' / 'samples'
root.mkdir(parents=True, exist_ok=True)
font_file = Path('C:/Windows/Fonts/arial.ttf')
bold_file = Path('C:/Windows/Fonts/arialbd.ttf')
def font(size, bold=False):
    return ImageFont.truetype(str(bold_file if bold else font_file), size)

image = Image.new('RGB', (1500, 1600), 'white')
draw = ImageDraw.Draw(image)
draw.text((95, 85), 'SYNTHETIC DEMONSTRATION DOCUMENT', font=font(36, True), fill='#14243b')
draw.line((95, 150, 1400, 150), fill='#8797a8', width=2)
draw.text((95, 210), 'Institutional undertaking', font=font(56, True), fill='#14243b')
lines = [
    'Institution Name: Pragati Institute of Technology',
    'Institution ID: PIT-042',
    'Campus: CAMPUS A',
    'Academic Year: 2026-27',
    'Declaration: Submitted information relates to Campus A.'
]
for i, line in enumerate(lines):
    draw.text((95, 370 + i * 135), line, font=font(38), fill='#111827')
draw.text((95, 1300), 'For OCR testing only. Not an official institutional record.', font=font(29), fill='#526176')
image.save(root / 'undertaking-scan.png', optimize=True)

image = Image.new('RGB', (1400, 1000), '#f7f9fc')
draw = ImageDraw.Draw(image)
draw.text((80, 70), 'SYNTHETIC INFRASTRUCTURE EVIDENCE', font=font(36, True), fill='#14243b')
draw.text((80, 135), 'Pragati Institute of Technology / Campus A', font=font(29), fill='#526176')
draw.rounded_rectangle((100, 250, 1300, 670), radius=15, fill='white', outline='#c5d3df', width=3)
draw.text((150, 295), 'Illustrative campus evidence sheet', font=font(38, True), fill='#14243b')
draw.text((150, 390), 'No real building photograph is included.', font=font(30), fill='#526176')
draw.text((150, 465), 'A reviewer must assess the evidence and its limits.', font=font(30), fill='#526176')
draw.text((150, 540), 'This image establishes no area or safety certification.', font=font(30), fill='#526176')
draw.text((80, 800), 'Demonstrates attachment, preview, and manual-review workflow only.', font=font(28), fill='#526176')
image.save(root / 'infrastructure.png', optimize=True)
print('Synthetic document and infrastructure fixtures created.')
