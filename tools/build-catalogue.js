#!/usr/bin/env node
/* Génère le catalogue HTML statique et les données structurées (JSON-LD) de tanana.html
   à partir des données du magasin (SUPPLIERS, DEPTS, MODELS, ITEMS, INFO) déclarées dans la page.

   Usage : node tools/build-catalogue.js
   À relancer après chaque modification des articles, prix ou fournisseurs.
   Le contenu est écrit entre les marqueurs <!-- CATALOGUE:START/END --> et <!-- LD:START/END -->. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const FILE=path.join(__dirname,'..','tanana.html');
const SITE='https://atelier-tanana.example/';   /* à remplacer par l'adresse réelle du site, comme pour index.html */
let html=fs.readFileSync(FILE,'utf8');

/* extrait un bloc « const NOM=... ; » du script de la page et l'évalue */
function block(name,open,close){
  const start=html.indexOf(`const ${name}=${open}`);if(start<0)throw new Error(`${name} introuvable`);
  const end=html.indexOf(`\n${close};`,start);if(end<0)throw new Error(`fin de ${name} introuvable`);
  return vm.runInNewContext('('+html.slice(start+`const ${name}=`.length,end+close.length+1)+')');
}
const SUPPLIERS=block('SUPPLIERS','{','}'),DEPTS=block('DEPTS','[',']'),MODELS=block('MODELS','{','}'),ITEMS=block('ITEMS','[',']');
/* photos libres des articles (tools/fetch-photos.js) : fichier, auteur, licence, page source */
const PHOTOS=fs.existsSync(path.join(__dirname,'..','assets','tanana','photos.json'))?JSON.parse(fs.readFileSync(path.join(__dirname,'..','assets','tanana','photos.json'),'utf8')):{};
const INFO=vm.runInNewContext('('+html.match(/const INFO=(\{[^\n]*\});/)[1]+')');

const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmt=n=>new Intl.NumberFormat('fr-FR').format(n).replace(/ | /g,' ')+' Ar';
const slug=k=>k.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

/* ---------- catalogue HTML ---------- */
/* icônes au trait, une par rayon (couleur du texte, pas de pastille) */
const ICON={
  structure:'<path d="M3 21h18M5 21V10h14v11M5 14h14M5 17.5h14M9 10v4M15 10v4M12 14v3.5M8 17.5V21M16 17.5V21"/><path d="m4 10 8-6 8 6"/>',
  menuiserie:'<path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M3 21h18"/><path d="M9 7h6v5H9zM9 15h6"/><circle cx="15.5" cy="13.5" r=".6"/>',
  sanitaire:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
  electricite:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  outillage:'<path d="m14 6 4 4M3 21l9-9M12 5l3-3 7 7-3 3-2-2-3 3-4-4 3-3z"/>',
  exterieur:'<path d="M4 21V8l2-3 2 3v13M16 21V8l2-3 2 3v13M8 11h8M8 17h8M3 21h18"/>',
  voirie:'<path d="M9 3 5 21M15 3l4 18M12 4v3M12 10v3M12 16v3"/><path d="M2 21h20"/>',
  toiture:'<path d="M2 12 12 4l10 8M5 10v11h14V10"/><path d="M9 21v-6h6v6"/>',
  peinture:'<path d="M4 4h12v5H4zM16 6.5h3v5h-7v3"/><path d="M11 14.5h2v6.5h-2z"/>'
};
const svg=id=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[id]||''}</svg>`;
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const I='    ';
let out=[];
out.push(`${I}<div class="cat-hero">`);
out.push(`${I}  <p class="eyebrow">Tanàna · « la ville », « le village » en malgache</p>`);
out.push(`${I}  <h1 id="catTitle">Tout pour bâtir la maison, <em>le village et la ville.</em></h1>`);
out.push(`${I}  <p class="cat-lede">${DEPTS.length} fournisseurs de la construction réunis dans un même magasin : gros œuvre, menuiserie, sanitaire, électricité, outillage, extérieur, voirie, toiture et peinture. À visiter en 3D, ou à parcourir ici.</p>`);
out.push(`${I}  <dl class="cat-stats">`);
for(const [n,l] of [[DEPTS.length,'rayons'],[ITEMS.length,'articles'],[Object.keys(SUPPLIERS).length,'fournisseurs']])out.push(`${I}    <div><dt data-count="${n}">${n}</dt><dd>${l}</dd></div>`);
out.push(`${I}  </dl>`);
out.push(`${I}  <p class="cat-info">${esc(INFO.adresse)} · ouvert ${esc(INFO.horaires)} · devis par WhatsApp au ${esc(INFO.tel)} ou directement à chaque fournisseur.</p>`);
out.push(`${I}</div>`);
out.push(`${I}<nav class="cat-nav" aria-label="Rayons du magasin"><ol>`);
for(const d of DEPTS)out.push(`${I}  <li><a href="#rayon-${d.id}" data-dept="${d.id}"><span>${d.n}</span>${esc(d.name)}<small>${ITEMS.filter(i=>i[0]===d.id).length}</small></a></li>`);
out.push(`${I}</ol></nav>`);
out.push(`${I}<p class="cat-empty" id="catEmpty" hidden>Aucun article ne correspond à votre recherche. Essayez « ciment », « porte » ou « tôle ».</p>`);
for(const d of DEPTS){
  const s=SUPPLIERS[d.sup],list=ITEMS.filter(i=>i[0]===d.id);
  out.push(`${I}<section class="cat-dept" id="rayon-${d.id}" data-dept="${d.id}" aria-labelledby="h-${d.id}" tabindex="-1">`);
  out.push(`${I}  <header class="cat-dhead"><span class="cat-num" aria-hidden="true">${d.n}</span><span class="cat-ico">${svg(d.id)}</span>`);
  out.push(`${I}    <div><h2 id="h-${d.id}">${esc(d.name)}</h2><p class="cat-sup">Fournisseur : <b>${esc(s.name)}</b>, ${esc(s.city)}, depuis ${s.since}. ${esc(s.desc)}</p></div></header>`);
  out.push(`${I}  <div class="cat-grid">`);
  list.forEach(([,key,name,price,unit,desc],k)=>{
    const m=MODELS[key]||{},dims=m.w?`${Math.round(m.w)} × ${Math.round(m.d)} × ${Math.round(m.h)} cm`:'';
    out.push(`${I}    <article class="cat-item" id="art-${slug(key)}" tabindex="-1" data-search="${esc(norm([name,desc,d.name,s.name,unit].join(' ')))}">`);
    const ph=PHOTOS[key];
    if(ph)out.push(`${I}      <figure class="ci-photo"><img src="${esc(ph.file)}" alt="${esc(name)} (photo d'illustration)" loading="lazy" decoding="async" width="500" height="375"><figcaption>Photo : ${esc(ph.artist)} · ${esc(ph.license)}</figcaption></figure>`);
    out.push(`${I}      <div class="ci-top"><span class="ci-ref">Réf. ${d.n}-${String(k+1).padStart(2,'0')}</span><span class="ci-unit">${esc(unit)}</span></div>`);
    out.push(`${I}      <h3>${esc(name)}</h3>`);
    out.push(`${I}      <p class="ci-desc">${esc(desc)}</p>`);
    if(dims)out.push(`${I}      <p class="cat-dims">Encombrement ${dims}</p>`);
    out.push(`${I}      <div class="ci-foot"><p class="cat-price"><data value="${price}">${fmt(price)}</data></p>`);
    out.push(`${I}        <div class="cat-acts"><button type="button" class="add" data-add="${esc(key)}"><span>+ Devis</span></button><button type="button" class="view" data-view="${esc(key)}" aria-label="Voir ${esc(name)} en 3D">3D</button></div></div>`);
    out.push(`${I}    </article>`);
  });
  out.push(`${I}  </div>`);
  out.push(`${I}</section>`);
}
out.push(`${I}<p class="cat-foot">Fournisseurs, prix et coordonnées d'exemple pour cette maquette. Prix indicatifs, confirmés par chaque fournisseur dans le devis. Les photos illustrent le type d'article ; elles ne montrent pas forcément le produit exact vendu.</p>`);
const used=ITEMS.filter(i=>PHOTOS[i[1]]);
if(used.length){
  out.push(`${I}<details class="cat-credits"><summary>Crédits photos (${used.length}, Wikimedia Commons)</summary><ul>`);
  for(const [,key,name] of used){const p=PHOTOS[key];out.push(`${I}  <li>${esc(name)} : <a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title.replace(/^File:/,''))}</a> · ${esc(p.artist)} · ${esc(p.license)}</li>`);}
  out.push(`${I}</ul></details>`);
}
const catalogue=out.join('\n');

/* ---------- données structurées : le magasin et ses produits ---------- */
const ld={'@context':'https://schema.org','@graph':[
  {'@type':'HomeAndConstructionBusiness','@id':SITE+'tanana.html#magasin',name:'Tanàna · le grand magasin de la construction',url:SITE+'tanana.html',
    address:{'@type':'PostalAddress',streetAddress:INFO.adresse,addressCountry:'MG'},telephone:'+261340000000',currenciesAccepted:'MGA',
    department:DEPTS.map(d=>({'@type':'Store',name:`${d.name} · ${SUPPLIERS[d.sup].name}`,address:{'@type':'PostalAddress',addressLocality:SUPPLIERS[d.sup].city,addressCountry:'MG'}}))},
  {'@type':'ItemList',name:'Catalogue Tanàna',numberOfItems:ITEMS.length,itemListElement:ITEMS.map(([dept,key,name,price,unit,desc],i)=>{
    const d=DEPTS.find(x=>x.id===dept),s=SUPPLIERS[d.sup];
    return{'@type':'ListItem',position:i+1,item:{'@type':'Product',name,description:desc,category:d.name,url:`${SITE}tanana.html#art-${slug(key)}`,...(PHOTOS[key]?{image:SITE+PHOTOS[key].file}:{}),
      offers:{'@type':'Offer',price,priceCurrency:'MGA',availability:'https://schema.org/InStock',seller:{'@type':'Organization',name:s.name}}}};})}
]};
const ldTag=`<script type="application/ld+json">\n${JSON.stringify(ld)}\n</script>`;

/* ---------- écriture entre les marqueurs ---------- */
const put=(a,b,content)=>{const i=html.indexOf(a),j=html.indexOf(b);if(i<0||j<i)throw new Error(`marqueurs ${a} introuvables`);
  html=html.slice(0,i+a.length)+'\n'+content+'\n'+html.slice(j);};
put('<!-- CATALOGUE:START -->','<!-- CATALOGUE:END -->',catalogue);
put('<!-- LD:START -->','<!-- LD:END -->',ldTag);
fs.writeFileSync(FILE,html);
console.log(`Catalogue généré : ${DEPTS.length} rayons, ${ITEMS.length} articles, JSON-LD ${(ldTag.length/1024).toFixed(1)} Ko.`);
