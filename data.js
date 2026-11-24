/* Köşe — içerik: hareketler, ısınma, program, hazır modlar */
export const M = {
  stance: { n: "Duruş ve gard", k: "Temel", v: "gard",
    st: ["Sol ayak önde, sağ ayak bir adım geride ve hafif dışa dönük. Ayaklar omuz genişliğinde.", "Dizler hafif bükülü, arka topuk hafif havada, ağırlık iki ayakta.", "Sol el yanak hizasında, sağ el çenenin yanında, dirsekler kaburgaların önünde.", "Çene aşağı, omuzlar aşağı ve gevşek."],
    er: ["Omuzları kulağa kaldırmak. Sol omzunu yoran bir numaralı hata bu.", "Ayakları tek çizgiye dizmek; denge kaybolur."], cu: ["Omuzlar aşağı", "Çene aşağı", "Dizler yumuşak"] },
  step: { n: "İleri adım", k: "Ayak", v: "ileri", f: 1,
    st: ["Arka ayakla yere it.", "Ön ayak bir karış ileri kayar.", "Arka ayak aynı mesafeyi takip eder.", "Gard ve baş yüksekliği değişmez."], er: ["Arka ayağı geride bırakıp duruşu uzatmak.", "Zıplamak; ayaklar yere yakın kaymalı."], cu: ["Ön ayak önce", "Arka ayak takip etsin"] },
  back: { n: "Geri adım", k: "Ayak", v: "geri", f: 1,
    st: ["Ön ayakla yere it.", "Arka ayak geri kayar.", "Ön ayak aynı mesafeyi takip eder.", "Ağırlık topuklara düşmez."], er: ["Topuk üstüne geri düşmek.", "Geri giderken gardı indirmek."], cu: ["Arka ayak önce", "Gard kapalı"] },
  side: { n: "Sola adım", k: "Ayak", v: "sola", f: 1,
    st: ["Sol ayak (ön ayak) önce sola kayar.", "Sağ ayak aynı mesafeyi takip eder.", "Ortodoks duruşta en güvenli yön budur: rakibin sağ elinden uzaklaşırsın.", "Ayaklar asla çaprazlanmaz, birleşmez."], er: ["Ayakları birleştirmek.", "Önce arka ayağı oynatmak."], cu: ["Sol ayak önce"] },
  sr: { n: "Sağa adım", k: "Ayak", v: "sağa", f: 1,
    st: ["Sağ ayak (arka ayak) önce sağa kayar.", "Sol ayak aynı mesafeyi takip eder.", "Rakibin sağ eline doğru gittiğin için gard sıkı kalsın.", "Ayaklar asla çaprazlanmaz, birleşmez."], er: ["Bacakları çaprazlamak.", "Sağa çıkarken sağ eli indirmek."], cu: ["Sağ ayak önce", "Gard sıkı"] },
  pivot: { n: "Pivot", k: "Ayak", v: "pivot", f: 1,
    st: ["Ön ayağın tabanı üzerinde dön.", "Arka ayakla çeyrek tur sola süpür.", "Gard ve çene yerinde kalır.", "Yeni açıdan hemen yumruğa hazır ol."], er: ["Topuk üzerinde dönmek.", "Dönerken eğilip dengeyi kaybetmek."], cu: ["Ön ayak tabanında dön"] },
  "1": { n: "Jab", k: "Yumruk", v: "bir", num: 1,
    st: ["Arka ayak parmak ucuyla yere hafif it.", "Kalça ve sol omuz hedefe birkaç derece döner.", "Kol bu dönüşün devamı olarak düz çıkar; son anda avuç içi yere döner.", "Sol omuz çeneyi korur, sağ el çenede kalır.", "Aynı yoldan hızla geri gel, nefes ver, omzu gevşet."],
    er: ["Sadece kolla itmek; yük omza biner.", "Kolu uzatıp orada bekletmek."], cu: ["Kalçadan başlat", "Hızlı geri getir", "Omuz gevşek"] },
  "2": { n: "Cross", k: "Yumruk", v: "iki", num: 2,
    st: ["Arka ayak topuğunu dışa çevirerek pivotla.", "Önce kalça, sonra omuz döner.", "Sağ kol düz çıkar; ağırlık hafif ön ayağa geçer.", "Sol el yüzünde kalır; geri gelirken kalça da geri döner."], er: ["Arka ayağı pivotlamamak.", "Sol eli indirmek."], cu: ["Arka ayağı çevir", "Sol el yüzde"] },
  b1: { n: "Gövdeye jab", k: "Yumruk", v: "gövde bir", lab: "G1",
    st: ["Belden değil dizlerden in.", "Baş, ön dizin üzerinde ve gard içinde kalır.", "Jabı mide hizasına at.", "Hemen yukarı, garda dön."], er: ["Öne eğilip başı açıkta bırakmak."], cu: ["Dizlerden in"] },
  "3": { n: "Sol kroşe", k: "Yumruk", v: "üç", num: 3,
    st: ["Ağırlık hafif ön ayakta.", "Dirseği omuz hizasına kaldır, ön kol yere paralel.", "Ön ayak tabanında ve kalçayla dön; yumruğu gövde getirir.", "Sağ el çenede, yay kısa."], er: ["Kolu geniş savurmak.", "Dirseği düşük bırakmak."], cu: ["Kalçayla döndür", "Kısa yay"] },
  "4": { n: "Sağ kroşe", k: "Yumruk", v: "dört", num: 4,
    st: ["Arka ayağı pivotla.", "Kalça ve omuz döner, dirsek omuz hizasında.", "Sol el yüzde kalır."], er: ["Çok geniş açmak.", "Kolu kalçadan önce göndermek."], cu: ["Arka ayağı döndür"] },
  "5": { n: "Sol aparkat", k: "Yumruk", v: "beş", num: 5,
    st: ["Dizleri hafif bük, ağırlığı ön tarafa yükle.", "Bacakla yukarı it, yumruk dikey yükselir.", "Avuç içi sana dönük, dirsek doksan derece.", "Hemen garda dön."], er: ["Eli önce aşağı indirip hareketi belli etmek."], cu: ["Bacaktan kaldır"] },
  "6": { n: "Sağ aparkat", k: "Yumruk", v: "altı", num: 6,
    st: ["Dizlerden hafif yük al.", "Arka ayakla it, kalçayı döndür.", "Yumruk dikey yükselir, sol el yüzde."], er: ["Geriye yaslanmak."], cu: ["Kalçadan yukarı"] },
  b2: { n: "Gövdeye cross", k: "Yumruk", v: "gövde iki", lab: "G2",
    st: ["Dizlerden in, baş ön dizin üzerinde kalsın.", "Arka ayağı pivotla, kalçayla döndür.", "Cross'u mide hizasına düz at.", "Sol el yüzde; hemen yukarı, garda dön."], er: ["Belden eğilip başı açmak.", "Sadece kolla vurmak."], cu: ["Dizlerden in", "Kalçayla döndür"] },
  b3: { n: "Gövdeye sol kroşe", k: "Yumruk", v: "gövde üç", lab: "G3",
    st: ["Dizleri bükerek hafif sola in.", "Dirsek kalçaya yakın, ön kol yere paralele yakın.", "Ön ayak ve kalçayla dön, yumruk kaburgaya gider.", "Sağ el çenede kalır."], er: ["Kolu geniş savurmak.", "Belden eğilmek."], cu: ["Kalçayla döndür", "Dizlerden in"] },
  b4: { n: "Gövdeye sağ kroşe", k: "Yumruk", v: "gövde dört", lab: "G4",
    st: ["Dizlerden in, ağırlık hafif öne.", "Arka ayağı pivotla, kalçayı döndür.", "Yumruk rakibin sol kaburgasına gider, dirsek bükülü.", "Sol el yüzde kalır."], er: ["Çok geniş açmak.", "Başı öne uzatmak."], cu: ["Arka ayağı döndür", "Sol el yüzde"] },
  parry: { n: "Parry", k: "Savunma", v: "parry", d: 1,
    st: ["Gelen jabı sağ avuçla bir avuç kadar yana it.", "Elini uzatma; kısa ve küçük hareket.", "Hemen cross ile karşılık ver."], er: ["Eli yumruğa doğru uzatıp yüzü açmak."], cu: ["Küçük hareket", "Hemen karşılık ver"] },
  block: { n: "Blok", k: "Savunma", v: "blok", d: 1,
    st: ["Eldiveni başına yapıştır, dirsek yukarı.", "Darbeyi kol ve omuzla al.", "Çene aşağı, gözler açık."], er: ["Eldiveni başa yapıştırmadan havada tutmak."], cu: ["Eldiven başa"] },
  slip: { n: "Sağa slip", k: "Savunma", v: "sağa slip", d: 1,
    st: ["Dizlerden hafif sağa ve öne in.", "Baş, ön dizin dışına geçer.", "Belden yana bükme, gözler rakipte.", "Ardından cross çok doğal gelir."], er: ["Belden eğilmek.", "Gereğinden büyük kaçmak."], cu: ["Dizlerden", "Küçük kaçış"] },
  islip: { n: "Sola slip", k: "Savunma", v: "sola slip", d: 1,
    st: ["Dizlerden hafif sola in.", "Baş, ön dizin içine geçer.", "Ardından jab ya da sol kroşe gelir."], er: ["Gözleri kapatmak."], cu: ["Baş içe"] },
  roll: { n: "Roll (eğil)", k: "Savunma", v: "eğil", d: 1,
    st: ["Dizleri bükerek aşağı in.", "U çizerek bir yandan diğerine geç.", "Yukarı çıkarken gard kapalı, gözler önde.", "Çıktığın taraftan yumruk at."], er: ["Belden eğilip yere bakmak.", "Çok derine inmek."], cu: ["U çiz", "Gözler önde"] },
  pull: { n: "Geri çekilme", k: "Savunma", v: "çekil", d: 1,
    st: ["Ağırlığı arka ayağa ver.", "Başı bir karış geri çek.", "Hemen cross ile geri gel."], er: ["Çeneyi kaldırmak."], cu: ["Çene aşağı"] }
};
export const KEYPAD = [["Yumruk", ["1", "2", "3", "4", "5", "6", "b1", "b2", "b3", "b4"]], ["Savunma", ["slip", "islip", "roll", "pull", "parry", "block"]], ["Ayak", ["step", "back", "side", "sr", "pivot"]]];
export const LEAD = ["1", "b1", "3", "5", "b3"];
export const STRIKE = ["1", "2", "b1", "b2", "3", "4", "5", "6", "b3", "b4"];
export const DEF = ["slip", "islip", "roll", "pull", "parry", "block"];
export const FOOT = ["step", "back", "side", "sr", "pivot"];

/* Hazır kombinasyonlar: [kombinasyon, açıldığı hafta/seviye] */
export const CB = [["1", 1], ["1-1", 1], ["2", 1], ["1-2", 1], ["1-1-2", 2], ["step-1", 1], ["1-back", 1], ["b1-1", 2], ["1-2-1", 3], ["b1-2", 3], ["1-b2", 3], ["b1-b2", 3], ["1-b2-2", 6],
  ["slip-2", 4], ["islip-1", 4], ["parry-2", 4], ["1-2-slip-2", 5], ["roll-2", 5], ["pull-2", 5], ["1-2-roll", 5], ["1-pivot", 6], ["roll-2-1", 6], ["2-roll-2", 6],
  ["3", 7], ["1-3", 7], ["1-2-3", 7], ["3-2", 7], ["4", 8], ["5", 8], ["6", 8], ["1-6", 8], ["2-3-2", 9], ["6-3", 9], ["1-2-5-2", 9], ["block-2-3", 9],
  ["1-2-3-2", 10], ["1-6-3-2", 10], ["slip-2-3-2", 10], ["1-2-roll-2-3", 11], ["parry-2-3-6", 11], ["b1-2-3", 11], ["b3-3", 10], ["1-2-b3", 10], ["2-b3-3-2", 11], ["b4-3-2", 11], ["1-b2-3", 11], ["2-3-roll-3-2", 12], ["b3-b4-3-2", 12], ["1-2-3-6-pivot", 12], ["1-1-2-3-back", 12], ["3-pivot-2", 12], ["1-2-side", 4], ["1-2-sr", 5], ["side-1-2", 6]];
export const LEVELS = [[3, "Düz yumruklar"], [6, "+ Savunma"], [9, "+ Kroşe, aparkat"], [12, "Hepsi"]];

/* Isınma hareketleri */
export const WM = {
  ip: { n: "İp: iki ayak", say: "İp atla. İki ayak birlikte, hafif ve ritmik. Dizler yumuşak.", eq: "İp" },
  ip_alt: { n: "İp: ayak değiştirerek", say: "Şimdi ayak değiştirerek. Koşar gibi, bir sağ bir sol.", eq: "İp" },
  ip_boks: { n: "İp: boksör adımı", say: "Boksör adımı. Ağırlığı bir ayaktan diğerine aktar, sağa sola sallan.", eq: "İp" },
  jj: { n: "Jumping jack", say: "Jumping jack. Kollar yukarı, ayaklar açık, sonra kapat.", eq: null },
  neck: { n: "Boyun", say: "Boynu yavaşça çevir. Sağa, aşağı, sola. Zorlamadan.", eq: null },
  armcirc: { n: "Kol çemberleri", say: "Kollar yana açık, küçük çemberler. Yarısında yön değiştir.", eq: null },
  armswing: { n: "Kol açma kapama", say: "Kolları geniş aç, sonra kendine sarılır gibi kapat.", eq: null },
  torso: { n: "Gövde döndürme", say: "Gövdeyi sağa sola döndür. Kalça sabit, omuzlar dönsün.", eq: null },
  hipcirc: { n: "Kalça çemberi", say: "Eller belde, kalçayla geniş çember çiz.", eq: null },
  legswing: { n: "Bacak salınımı öne", say: "Bir yere tutun. Bacağı öne arkaya salla. Küçük başla, yavaş büyüt. Yarısında bacak değiştir.", eq: null },
  legside: { n: "Bacak salınımı yana", say: "Bacağı yana aç kapa. Kontrollü. Yarısında bacak değiştir.", eq: null },
  ankle: { n: "Ayak bileği", say: "Ayak bileğini iki yöne çevir. Yarısında ayak değiştir.", eq: null },
  scap: { n: "Duvarda kürek kemiği şınavı", say: "Ellerini duvara koy, kollar düz. Sadece kürek kemiklerini yaklaştır ve uzaklaştır.", eq: null },
  ytw: { n: "Y-T-W", say: "Öne eğil, sırt düz. Kollarla Y, sonra T, sonra W çiz. Kürek kemiklerini sık.", eq: null },
  band_er: { n: "Bant dış rotasyon", say: "Dirsekler belde, doksan derece. Bandı dışa doğru aç, yavaşça geri gel.", eq: "Bant" },
  band_pa: { n: "Bant pull-apart", say: "Kollar önde düz. Bandı göğsüne doğru iki yana aç, kürek kemiklerini sık.", eq: "Bant" },
  band_fp: { n: "Face pull", say: "Bandı göz hizasında bir yere sabitle. Yüzüne doğru çek, dirsekler yukarıda ve dışarıda.", eq: "Bant" },
  guardhold: { n: "Gard dayanıklılığı", say: "Kollar omuz hizasında önde. Küçük çemberler. Omuzlar aşağıda kalsın.", eq: null },
  shadow_step: { n: "Gardda adımlar", say: "Gardını al. İleri, geri, sağa, sola adım. Ayaklar çaprazlanmasın.", eq: null, demo: "step-back-side-sr" },
  shadow_easy: { n: "Kolay gölge", say: "Yüzde elli hızla jab cross. Sonra yavaş yavaş hızlan.", eq: null, demo: "1-2" }
};
export const WP = {
  std: { n: "Standart", d: "İp, hareketlilik, bantla omuz, boksa geçiş", list: [["ip", 60], ["ip_alt", 45], ["jj", 30], ["neck", 15], ["armcirc", 30], ["armswing", 20], ["torso", 25], ["hipcirc", 20], ["legswing", 30], ["scap", 30], ["band_er", 30], ["band_pa", 30], ["guardhold", 30], ["shadow_step", 40], ["shadow_easy", 50]] },
  omuz: { n: "Omuz odaklı", d: "Kısa ip, uzun bant ve kürek kemiği çalışması", list: [["ip", 60], ["jj", 30], ["neck", 15], ["armcirc", 30], ["torso", 20], ["legswing", 20], ["scap", 30], ["ytw", 45], ["band_er", 40], ["band_fp", 40], ["band_pa", 40], ["guardhold", 30], ["shadow_step", 30], ["shadow_easy", 40]] },
  ip: { n: "İp ağırlıklı", d: "Kondisyon günü: farklı ip adımları", list: [["ip", 60], ["ip_alt", 60], ["ip_boks", 60], ["ip", 45], ["ip_boks", 45], ["armcirc", 20], ["torso", 20], ["legswing", 20], ["band_er", 30], ["band_pa", 30], ["shadow_easy", 60]] },
  hizli: { n: "Hızlı", d: "Vaktin azken ya da zaten ısınmışken", list: [["ip", 60], ["armcirc", 20], ["torso", 20], ["legswing", 20], ["band_pa", 30], ["guardhold", 30], ["shadow_step", 20], ["shadow_easy", 40]] },
  none: { n: "Isınma yok", d: "Başka bir antrenmanın üstüne", list: [] }
};
export const KINDS = {
  shadow: { n: "Gölge boksu", d: "Antrenör kombinasyon söyler, figür gösterir, sen atarsın." },
  pads: { n: "Sanal lapacı", d: "Karşında lapacı lapaları sırayla açar. Lapanın vurulma anında ses gelir, o ritme vur." },
  spar: { n: "Rakip", d: "Rakip sana yumruk atar: eldiveni parlar, sen savunup karşılık verirsin." },
  mix: { n: "Karışık", d: "Raund raund gölge, lapa ve rakip sırayla gelir." }
};
export const THEMES = {
  duz: { n: "Düz yumruk", d: "Jab ve cross isabeti, hızlı geri dönüş", say: "düz yumruk. Jab ve cross; temiz at, hızlı geri getir.",
    p: [["1", "2", "1-1"], ["1-2", "1-1-2", "1-2-1", "1-b2", "b1-2", "1-2-1-2"], ["1-2", "1-1-2", "1-2-1-2"]], cues: ["Jabdan sonra el yüze", "Kalçadan dön", "Hızlı geri getir"], opp: [["1"], ["2"], ["1", "2"], ["1", "1"]] },
  ayak: { n: "Ayak ve açı", d: "Vur ve yer değiştir; adım, yan çıkış, pivot", say: "ayak ve açı. Vur, sonra yer değiştir. Ayakların hiç durmasın.",
    p: [["step-1", "1-back", "side-1", "sr-2"], ["1-2-side", "1-2-sr", "step-1-2-back", "1-2-pivot", "1-1-2-side", "side-1-2"], ["1-2-back", "step-1-2", "1-2-side", "1-2-sr"]], cues: ["Ayaklarını oynat", "Vur ve orada durma", "Açı al"], opp: [["1"], ["2"], ["1", "2"]], move: 2 },
  savunma: { n: "Savunma ve karşılık", d: "Slip, roll, parry, çekilme ve hemen ardından karşılık", say: "savunma ve karşılık. Önce savun, hemen karşılık ver.",
    p: [["slip-2", "islip-1", "roll", "parry-2", "pull-2"], ["slip-2-3", "roll-2-1", "parry-2-1", "pull-2-1", "1-2-slip-2"], ["1-2-roll-2", "slip-2-1-2", "2-roll-2"]], cues: ["Savun ve hemen karşılık", "Dizlerden in", "Gözler önde"], opp: null },
  govde: { n: "Kafa ve gövde", d: "Seviye değiştir: kafaya ve gövdeye karışık", say: "kafa ve gövde. Seviye değiştir; dizlerden in, belden eğilme.",
    p: [["b1", "b2", "1-b2"], ["1-b2-2", "b1-2", "1-2-b3", "b1-b2", "1-b1-2"], ["b1-2-3", "1-b2-3", "b3-3"]], cues: ["Dizlerden in", "Belden eğilme", "Gövdeden sonra kafaya"], opp: null },
  krose: { n: "Kroşe ve aparkat", d: "Kısa yaylar, kalça dönüşü", say: "kroşe ve aparkat. Kısa yaylar, kalçayla döndür.",
    p: [["3", "4", "5", "6"], ["1-2-3", "2-3-2", "1-6", "6-3", "3-2"], ["1-2-3-2", "1-6-3-2", "2-3-roll-3-2"]], cues: ["Kısa yay", "Kalçayla döndür", "Dirsek omuz hizasında"], opp: [["3"], ["4"], ["2", "3"], ["5"], ["6"]] },
  gard: { n: "Gard disiplini", d: "Yavaş tempo; vuran el hemen yüze, omuzlar gevşek", say: "gard disiplini. Yavaş at; vuran el hemen yüzüne dönsün, omuzlar gevşek.",
    p: [["1", "1-1", "2"], ["1-2", "1-1-2", "1-2-1"], ["1-2", "1-1-2"]], cues: ["Sol el yüzüne geri", "Omuzlar aşağı, gevşe", "Çene aşağı", "Vuran el hemen yüze"], opp: [["1"], ["1", "1"], ["2"]], slow: 1 },
  serbest: { n: "Serbest", d: "Seçtiğin havuzdan karışık", say: "serbest. Öğrendiğin her şey karışık gelecek.", p: null, cues: [], opp: null }
};
export const THEME_ORDER = ["duz", "ayak", "savunma", "govde", "krose", "gard", "serbest"];
export const PHASE_SAY = ["Önce tek tek.", "Şimdi kombinasyonlar.", "Son bölüm, hızlan!"];
export const SEED = [
  { id: "m1", name: "Sanal lapacı 6×2", kind: "pads", rounds: 6, len: 120, rest: 45, warm: "ask", pool: 12, mine: "mix", tempo: "mid", burst: true, shoulder: false, talk: 2, voice: true, diff: "mid", counters: true, guide: true, themes: null, move: "mid" },
  { id: "m2", name: "Gölge 3×3", kind: "shadow", rounds: 3, len: 180, rest: 60, warm: "ask", pool: 12, mine: "mix", tempo: "mid", burst: true, shoulder: false, talk: 2, voice: true, diff: "mid", counters: true, guide: true, themes: null, move: "mid" },
  { id: "m3", name: "Savunma refleksi 4×2", kind: "spar", rounds: 4, len: 120, rest: 60, warm: "ask", pool: 6, mine: "off", tempo: "mid", burst: false, shoulder: false, talk: 1, voice: true, diff: "mid", counters: true, guide: true, themes: null, move: "mid" },
  { id: "m4", name: "Karışık 6×3", kind: "mix", rounds: 6, len: 180, rest: 60, warm: "ask", pool: 12, mine: "mix", tempo: "var", burst: true, shoulder: false, talk: 2, voice: true, diff: "mid", counters: true, guide: true, themes: null, move: "mid" }
];
export const PH = [["Düz yumruklar", "Duruş, adımlar, jab ve cross. Gücü bacaktan al, omzu gevşek tut."], ["Savunma ve kaçışlar", "Parry, slip, roll, geri çekilme. Vur ve orada durma."], ["Kroşe ve aparkat", "Kısa yaylar, kalça dönüşü, dizden gelen aparkatlar."], ["Kombinasyonlar", "Savun, karşılık ver, açı değiştir. Hepsi akış halinde."]];
export const FOCUS = { 1: ["stance", "1", "step"], 2: ["2", "1-2", "back"], 3: ["1-1-2", "b1", "pivot"], 4: ["parry", "slip", "islip"], 5: ["roll", "pull", "slip-2"], 6: ["side", "1-2-roll", "roll-2-1"],
  7: ["3", "1-3", "1-2-3"], 8: ["4", "5", "6"], 9: ["2-3-2", "1-6", "block"], 10: ["1-2-3-2", "1-6-3-2", "slip-2-3-2"], 11: ["1-2-roll-2-3", "parry-2-3-6", "b1-2-3"], 12: ["2-3-roll-3-2", "1-2-3-6-pivot", "1-1-2-3-back"] };
export const CUES = ["Omuzlar aşağı, gevşe", "Her yumrukta nefes ver", "Eli yüzüne geri getir", "Kalçadan dön", "Çene aşağı", "Ayaklarını oynat", "Vur ve orada durma", "Gard yukarı"];
export const PRAISE = ["Güzel!", "Böyle devam!", "Temiz!", "Çok iyi, gevşek kal", "Hadi, ayaklar!", "İşte bu!"];
/* Rakibin yumruğuna karşı savunma ve karşılık */
export const OPP = {
  "1": { def: "SAĞA SLIP", say: "sağa slip", alt: "ya da parry", ctr: ["2", "2-3"] },
  "2": { def: "SOLA SLIP", say: "sola slip", alt: "ya da geri çekil", ctr: ["3-2", "1-2"] },
  "3": { def: "EĞİL", say: "eğil", alt: "ya da blok", ctr: ["3-2", "2"] },
  "4": { def: "EĞİL", say: "eğil", alt: "ya da blok", ctr: ["2-3", "3"] },
  "5": { def: "GERİ ÇEKİL", say: "çekil", alt: "ya da blok", ctr: ["1-2"] },
  "6": { def: "GERİ ÇEKİL", say: "çekil", alt: "ya da blok", ctr: ["1-2", "3"] }
};
export const OPP_SETS = { 3: [["1"], ["2"], ["1", "1"]], 6: [["1"], ["2"], ["1", "2"], ["1", "1"]], 9: [["1"], ["2"], ["3"], ["4"], ["1", "2"], ["2", "3"], ["5"], ["6"]], 12: [["1"], ["2"], ["3"], ["1", "2"], ["2", "3"], ["1", "2", "3"], ["6", "3"], ["4"], ["5", "2"]] };

/* Profil: varsayılan öğrenilmiş teknikler (kroşe ve aparkat henüz yok) */
export const LEARN_DEFAULT = ["1", "2", "b1", "b2", "slip", "islip", "roll", "pull", "parry", "block", "step", "back", "side", "sr", "pivot"];
