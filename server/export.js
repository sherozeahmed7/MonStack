import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun } from 'docx';
export function pdf(res,r){
 const doc=new PDFDocument({size:'A4',margin:48,info:{Title:`${r.name} - Resume`,Author:r.name}});res.type('pdf');doc.pipe(res);
 const body=(text,bold=false)=>{doc.font(bold?'Helvetica-Bold':'Helvetica').fontSize(10.5).fillColor('#202b2a').text(text,{lineGap:3});};
 const heading=t=>{if(doc.y>doc.page.height-110)doc.addPage();doc.moveDown(.6);doc.font('Helvetica-Bold').fontSize(11).fillColor('#163e37').text(t.toUpperCase());doc.moveDown(.3);};
 doc.font('Helvetica-Bold').fontSize(23).fillColor('#163e37').text(r.name);body(r.title,true);body([r.email,r.phone,r.location,r.links].filter(Boolean).join(' | '));
 if(r.summary){heading('Summary');body(r.summary);}if(r.skills.length){heading('Skills');body(r.skills.join(' • '));}
 if(r.experience.length){heading('Experience');for(const e of r.experience){if(doc.y>doc.page.height-120)doc.addPage();body(`${e.role} | ${e.company}`,true);body(e.dates);for(const b of e.bullets){doc.moveDown(.25);body(`• ${b}`);}doc.moveDown(.4);}}
 for(const [key,label]of [['education','Education'],['projects','Projects'],['certifications','Certifications']])if(r[key]){heading(label);body(r[key]);}doc.end();
}
export async function word(r){
 const children=[];const para=(text,opts={})=>children.push(new Paragraph({children:[new TextRun({text,...opts})],spacing:{after:110},...opts}));
 para(r.name,{bold:true,size:44,color:'163E37'});para(r.title,{bold:true});para([r.email,r.phone,r.location,r.links].filter(Boolean).join(' | '));
 const section=(title,text)=>{if(!text)return;para(title.toUpperCase(),{bold:true,color:'163E37',keepNext:true});para(text);};section('Summary',r.summary);section('Skills',r.skills.join(' • '));
 if(r.experience.length){para('EXPERIENCE',{bold:true,color:'163E37',keepNext:true});for(const e of r.experience){para(`${e.role} | ${e.company}`,{bold:true,keepNext:true});para(e.dates,{keepNext:true});for(const b of e.bullets)children.push(new Paragraph({text:b,bullet:{level:0},spacing:{after:100}}));}}
 section('Education',r.education);section('Projects',r.projects);section('Certifications',r.certifications);
 return Packer.toBuffer(new Document({styles:{default:{document:{run:{font:'Arial',size:21},paragraph:{spacing:{line:270}}}}},sections:[{properties:{page:{margin:{top:800,bottom:800,left:800,right:800}}},children}]}));
}
