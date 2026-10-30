#!/usr/bin/env node
/* Cherche et télécharge une photo libre (Wikimedia Commons) pour chaque article du catalogue Tanàna.
   Licences acceptées : CC0, domaine public, CC BY, CC BY-SA. Auteur et licence sont enregistrés
   dans assets/tanana/photos.json, puis affichés dans le catalogue par tools/build-catalogue.js.

   Usage : node tools/fetch-photos.js            (articles sans photo seulement)
           node tools/fetch-photos.js --all      (tout re-chercher)
           node tools/fetch-photos.js --only proc/ciment,Scopia/cone
           node tools/fetch-photos.js --refetch     (mêmes photos, retéléchargées en vignettes de 500 px)
   PIN : fixe un fichier Commons précis pour un article (après vérification visuelle). */
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'photos','tanana'),DB=path.join(ROOT,'assets','tanana','photos.json');
const UA='TananaMaquette/1.0 (raharijesydifs@gmail.com)';

/* requêtes, de la plus précise à la plus large */
const Q={
  'Scopia/poteau-en-beton':['concrete utility pole','concrete electricity pole'],
  'Scopia/poteau-en-bois':['wooden utility pole','wooden electricity pole'],
  'KatorLegaz/porch-column-01':['porch column white','veranda columns'],
  'Contributions/column_balustrade':['concrete balustrade','balustrade balusters'],
  'Scopia/tasDeSable':['sand pile construction site','pile of sand'],
  'Scopia/wood_logs':['eucalyptus logs','stacked logs'],
  'proc/ciment':['cement bags','bags of cement'],
  'proc/briques':['bricks Madagascar','stack of red bricks'],
  'proc/parpaings':['concrete blocks stack','cinder blocks'],
  'proc/fer':['rebar bundle','reinforcing steel bars'],
  'Contributions/frontDoor2':['wooden front door glass','wooden entrance door'],
  'Contributions/fancyFrontDoor':['wooden panel door','carved wooden door'],
  'KatorLegaz/exterior-door-01':['six panel door','panelled front door'],
  'Scopia/garage-door':['sectional garage door','garage door'],
  'Contributions/window_shutter':['wooden window shutters','louvered shutters'],
  'KatorLegaz/window-01':['sash window','double hung window'],
  'Scopia/window_2x3_arched':['arched french doors','arched window doors'],
  'Contributions/window_shop':['shop window glass storefront','shop front glass'],
  'Contributions/staircase_straight':['wooden staircase','wooden stairs'],
  'Contributions/stairs_spiral':['spiral staircase','spiral stairs'],
  'BlendSwap-CC-BY/modernToilet':['wall hung toilet','modern toilet bowl'],
  'Scopia/turkish-toilet':['squat toilet','turkish toilet'],
  'Contributions/bathroom_sink':['bathroom vanity sink','double sink vanity'],
  'Scopia/stone-washbasin':['stone washbasin','stone sink'],
  'Contributions/shower_cabin':['shower cabin','glass shower enclosure'],
  'Scopia/corner_bathtub':['corner bathtub','bathtub'],
  'BlendSwap-CC-BY/kitchenSink':['stainless steel kitchen sink','kitchen sink'],
  'Scopia/electric_water_heater':['electric water heater','water heater tank'],
  'Scopia/garden-faucet':['garden tap brass','outdoor faucet'],
  'proc/tuyaux':['PVC pipes','plastic pipes stack'],
  'Contributions/solar_panel_140W':['solar panel Madagascar','solar panel'],
  'Contributions/street_light_modern':['LED street light','street light pole'],
  'KatorLegaz/classic-lamppost':['classic lamppost','cast iron lamp post'],
  'KatorLegaz/park-light':['park lamp post','garden lamp'],
  'KatorLegaz/porch-light':['porch light lantern','outdoor wall lantern'],
  'Contributions/lamp_wall_outside':['outdoor wall lamp','exterior wall light'],
  'Scopia/external-unity-air-conditioning':['air conditioner outdoor unit','split air conditioner outdoor'],
  'proc/cables':['electrical cable reel','electric cable coil'],
  'Scopia/perceuse-electrique':['cordless drill','power drill'],
  'Scopia/marteau':['claw hammer','hammer tool'],
  'Scopia/scie-egoine':['hand saw','handsaw'],
  'Scopia/step-ladder-metal':['aluminium step ladder','step ladder'],
  'Scopia/step-ladder-wood':['wooden step stool','wooden stepladder'],
  'Contributions/ladder_simple':['aluminium ladder','ladder against wall'],
  'BlendSwap-CC-BY/workbench':['woodworking workbench','workbench'],
  'Contributions/pergola':['wooden pergola','pergola garden'],
  'Scopia/rectangle-swimming-pool':['swimming pool garden','private swimming pool'],
  'Contributions/gate_iron':['wrought iron gate','iron gate'],
  'Contributions/fence_grid_gate':['wire mesh garden gate','metal garden gate'],
  'Contributions/fence_picket':['white picket fence','picket fence'],
  'Contributions/privacyFence':['wooden privacy fence','wooden fence panels'],
  'Scopia/hedge':['garden hedge','hedge'],
  'KatorLegaz/concrete-bench':['concrete bench','concrete park bench'],
  'Contributions/boiteALettre':['mailbox','letter box metal'],
  'Scopia/route2VoiesAvecTrottoirs':['road with sidewalk','asphalt road'],
  'Scopia/truck':['dump truck','tipper truck'],
  'KatorLegaz/concrete-sidewalk':['concrete sidewalk','pavement sidewalk'],
  'Scopia/feu-de-signalisation-simple':['traffic light','traffic signal'],
  'Contributions/traffic_light_ped':['pedestrian traffic light','pedestrian signal'],
  'Scopia/cone':['traffic cone','traffic cones'],
  'Contributions/wheelie_bin':['wheelie bin','wheeled bin'],
  'proc/toles':['corrugated iron sheets','corrugated metal roof'],
  'proc/faitieres':['corrugated iron roof ridge','tin roof'],
  'proc/planches':['pine planks','stack of wooden planks'],
  'proc/chevrons':['timber beams stack','lumber stack'],
  'proc/peinture':['paint cans','paint buckets'],
  'proc/carrelage':['terrazzo floor tiles','floor tiles']
};
/* corrections après vérification visuelle : article → titre exact du fichier Commons */
const PIN={
 "KatorLegaz/porch-column-01": "File:Eördögh House. Listed ID 5924. Porch with Doric columns (L). - Jászberény.JPG",
 "Contributions/column_balustrade": "File:Balustrade of Terrace of Parc Güell, Barcelona, Spain.jpg",
 "Contributions/frontDoor2": "File:EFTA00002068 - White door with glass panels and a doormat on a wooden porch framed by light-colored siding and palm leaves.jpg",
 "Contributions/fancyFrontDoor": "File:Wooden door of an old house01.jpg",
 "KatorLegaz/exterior-door-01": "File:EFTA00002867-Pool-House - White six-panel door with black doorknob set in a light-colored frame against a plain wall.jpg",
 "Scopia/window_2x3_arched": "File:Heiligengrabe, Kloster Stift zum Heiligengrabe, Abtei, Treppenturm -- 2017 -- 9941-7.jpg",
 "Contributions/window_shop": "File:Easter display in a shop window (geograph 5232440).jpg",
 "Contributions/staircase_straight": "File:Staircase in CSMVS with wooden railings.jpg",
 "Scopia/corner_bathtub": "File:Bathroom - bathtub - rounded shower.jpg",
 "Contributions/solar_panel_140W": "File:Installation of solar PV panels - panels in place - geograph.org.uk - 2624288.jpg",
 "Contributions/street_light_modern": "File:Street LED lamp, Mazowiecka Street in Tomaszów Mazowiecki, Poland.jpg",
 "KatorLegaz/park-light": "File:Lamp post opposite 50 Ennismore Gardens, June 2023.jpg",
 "Contributions/lamp_wall_outside": "File:Bécsi kapu Platz 2-4, Lampe und Farbglas Wappen, 2022 Budapest.jpg",
 "proc/cables": "File:Inductor radio (crystal).JPG",
 "Scopia/marteau": "File:Head of IKEA hammer.jpg",
 "Scopia/step-ladder-wood": "File:Din Tai Fung Philippines kids stepsB.jpg",
 "Contributions/ladder_simple": "File:1619Men of the Philippines with aluminum step ladders 14.jpg",
 "Contributions/fence_grid_gate": "File:Огороджена частина Ботанічного саду Вінницького державного аграрного університету P1390937.jpg",
 "Contributions/fence_picket": "File:Chingford Cricket Club boundary picket fence, Chingford, Essex 1.jpg",
 "KatorLegaz/concrete-bench": "File:Concrete posts, wooden ^ metal benches and a Dylan Thomas Trail marker in New Quay - geograph.org.uk - 5987583.jpg",
 "KatorLegaz/concrete-sidewalk": "File:Sidewalk on St. Charles Avenue, Carrollton, New Orleans 29 January 2026 - concrete.jpg",
 "Scopia/feu-de-signalisation-simple": "File:LED traffic light on red.jpg",
 "Scopia/cone": "File:Road Works Site In Auckland Pitt Street.jpg",
 "proc/toles": "File:Corrugated rusty roof 1.jpg",
 "proc/faitieres": "File:Corrugated iron house in Sreenagar Upazila, Munshiganj 01.jpg",
 "proc/planches": "File:Timber Market Scene.jpg",
 "proc/carrelage": "File:Cream speckled ceramic cemented clean tile pattern floor ground texture.jpg"
};

const ok=l=>/^(cc0|public domain|pd|cc by(-sa)? [1-4](\.0)?( [a-z]+)?$)/i.test((l||'').trim());
const slug=k=>k.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const api=async q=>(await fetch('https://commons.wikimedia.org/w/api.php?format=json&origin=*&'+q,{headers:{'User-Agent':UA}})).json();
const clean=s=>(s||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();

async function candidates(query){
  const j=await api(`action=query&generator=search&gsrnamespace=6&gsrlimit=20&gsrsearch=${encodeURIComponent(query+' filetype:bitmap')}&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiextmetadatafilter=LicenseShortName|Artist|ImageDescription&iiurlwidth=500`);
  const pages=Object.values(j.query?.pages||{}).sort((a,b)=>a.index-b.index);
  return pages.map(p=>{const i=p.imageinfo&&p.imageinfo[0];if(!i)return null;const m=i.extmetadata||{};
    return{title:p.title,mime:i.mime,w:i.width,h:i.height,thumb:i.thumburl,page:i.descriptionurl,license:clean(m.LicenseShortName?.value),artist:clean(m.Artist?.value).slice(0,80)||'Inconnu'};})
    .filter(c=>c&&/jpeg|png/.test(c.mime)&&c.w>=640&&c.h>=400&&c.w/c.h<2.4&&c.w/c.h>.55&&ok(c.license)&&!/(map|logo|diagram|drawing|icon|svg|chart|plan)/i.test(c.title));
}
async function byTitle(title){
  const j=await api(`action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiextmetadatafilter=LicenseShortName|Artist&iiurlwidth=500`);
  const p=Object.values(j.query.pages)[0],i=p.imageinfo[0],m=i.extmetadata||{};
  return{title:p.title,thumb:i.thumburl,page:i.descriptionurl,license:clean(m.LicenseShortName?.value),artist:clean(m.Artist?.value).slice(0,80)||'Inconnu'};
}
(async()=>{
  const args=process.argv.slice(2),all=args.includes('--all'),only=(args[args.indexOf('--only')+1]||'').split(',').filter(x=>args.includes('--only')&&x);
  fs.mkdirSync(OUT,{recursive:true});
  const db=fs.existsSync(DB)?JSON.parse(fs.readFileSync(DB,'utf8')):{};
  const refetch=args.includes('--refetch');   /* retélécharge les photos déjà choisies, sans nouvelle recherche */
  const keys=Object.keys(Q).filter(k=>only.length?only.includes(k):all||refetch||!db[k]||PIN[k]&&db[k].title!==PIN[k]);
  for(const k of keys){
    let pick=null;
    try{
      if(PIN[k])pick=await byTitle(PIN[k]);
      else if(refetch&&db[k])pick=await byTitle(db[k].title);   /* même photo, nouvelle taille */
      else for(const q of Q[k]){const c=await candidates(q);const used=new Set(Object.entries(db).filter(([kk])=>kk!==k).map(([,v])=>v.title));
        pick=c.find(x=>!used.has(x.title));if(pick)break;}
      if(!pick){console.log('AUCUNE  ',k);continue;}
      const buf=Buffer.from(await (await fetch(pick.thumb,{headers:{'User-Agent':UA}})).arrayBuffer());
      const file=`photos/tanana/${slug(k)}.jpg`;fs.writeFileSync(path.join(ROOT,file),buf);
      db[k]={file,title:pick.title,artist:pick.artist,license:pick.license,url:pick.page};
      console.log('ok      ',k.padEnd(42),(buf.length/1024|0)+'k',pick.license.padEnd(14),pick.title.slice(5,70));
    }catch(e){console.log('ERREUR  ',k,e.message);}
    await new Promise(r=>setTimeout(r,250));
  }
  fs.writeFileSync(DB,JSON.stringify(db,null,1));
  console.log(Object.keys(db).length,'/',Object.keys(Q).length,'articles avec photo');
})();
