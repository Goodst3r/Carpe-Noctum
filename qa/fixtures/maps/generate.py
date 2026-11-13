"""Synthetic map only; reproduce using PyMuPDF 1.26.6. No field identifiers."""
from pathlib import Path
import fitz
root=Path(__file__).parent
doc=fitz.open(); p=doc.new_page(width=1400,height=1000)
def text(x,y,s,size=22): p.insert_text((x,y),s,fontsize=size,fontname='helv')
text(45,40,'SYNTHETIC OFFLINE MAP - invented acceptance fixture',24)
for x,s in [(45,'NAME'),(540,'TAG'),(760,'MODEL')]:text(x,90,s)
for y,name,tag,model in [(130,'North Launch / 01','N1','NODE'),(170,'Oak Amp - A','A1','GainMaker HGD'),(210,'Branch Splitter','S1','2-WAY SPLITTER'),(250,'South Amp / B','A2','GainMaker LE'),(290,'Proposed Booster','B1','PROPOSED HGD')]:
 for x,s in [(45,name),(540,tag),(760,model)]:text(x,y,s)
# Cable geometry and readable dimensions; labels sit beside the actual spans.
for a,b in [((140,500),(550,500)),((550,500),(1030,500)),((550,500),(550,820)),((1030,500),(1250,500))]:p.draw_line(a,b,color=(0,0,1) if a==(550,500) and b==(550,820) else (0,0,0),width=3)
for x,y,tag in [(140,500,'N1'),(550,500,'S1'),(1030,500,'A1'),(550,820,'A2'),(1250,500,'B1')]:
 p.draw_rect(fitz.Rect(x-13,y-13,x+13,y+13),color=(0,0,0),fill=(1,1,1),width=2); text(x-20,y-35,tag)
text(240,470,'120 ft P3 .625');text(680,470,'80 ft P3 .500');text(575,690,'60 ft .625');text(1070,555,'40 ft .500')
text(575,550,'PORT 2');text(470,550,'PORT 1')
annot=p.add_freetext_annot(fitz.Rect(1080,590,1370,640),'B1 ABSENT',fontsize=25,text_color=(1,0,0));annot.update()
# Separate visible ink annotation proves the renderer includes visible markups.
a=p.add_ink_annot([[(1225,475),(1275,525)],[(1225,525),(1275,475)]]);a.set_colors(stroke=(1,0,0));a.set_border(width=4);a.update()
doc.save(root/'synthetic-marked.pdf');p.get_pixmap(matrix=fitz.Matrix(1.5,1.5),annots=True).save(root/'synthetic-raster.png')

limits=fitz.open()
for i in range(9): limits.new_page(width=100,height=100)
limits.save(root/'synthetic-nine-pages.pdf')

complex_doc=fitz.open();complex_page=complex_doc.new_page(width=400,height=1200);shape=complex_page.new_shape()
for i in range(4001):shape.draw_line((50,20+i*.2),(250,20+i*.2))
shape.finish(width=.1,color=(0,0,0));shape.commit()
complex_doc.save(root/'synthetic-complex.pdf',deflate=True)
