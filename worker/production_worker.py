#!/usr/bin/env python3
"""Zero-cost, new-only concept worker. No Higgsfield API calls."""
import datetime, hashlib, json, os, pathlib, random, sqlite3

ROOT=pathlib.Path(__file__).resolve().parent
ROOT.joinpath("state").mkdir(exist_ok=True)
DB=ROOT/"state"/"factory.db"
OUT=ROOT/"out"
OUT.mkdir(exist_ok=True)
db=sqlite3.connect(DB)
db.execute("CREATE TABLE IF NOT EXISTS concepts(id INTEGER PRIMARY KEY, category TEXT NOT NULL, prompt TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL)")
places=["a midnight glass-block corridor","a wet rooftop car park","a deserted basketball court","an empty vintage laundromat","a cobalt-lit freight elevator","a foggy rooftop greenhouse","a marble hotel lobby","a deserted elevated train platform","a surreal abandoned mall","an industrial stairwell with tungsten lights","a blue-hour roadside gasoline station","an old analog recording studio"]
actions=["walks through a narrowing doorway","opens a small silver case","steps across a flooded walkway","walks through shifting pools of light","turns to watch a shadow cross the floor","opens a brushed-metal security gate","places a coin on a glass counter","looks into a convex security mirror","steps out of an industrial elevator","passes beneath moving overhead lights","stops beside a waiting taxi","closes a rusted locker door"]
cameras=["35mm handheld frontal follow","50mm lateral track","28mm low-height sneaker-level dolly","40mm continuous curved steadicam","85mm long-lens rack-focus","35mm single slow crane rise"]
outfits=["cobalt-black cropped nylon technical shell, sculpted baggy charcoal cargos and Jordan 6 footwear","oxblood varsity jacket, heavyweight cream thermal, wide faded denim and Jordan 1 high-top sneakers","dark chocolate leather bomber, pleated wide trousers and Jordan 3 footwear","burgundy technical race jacket, stacked indigo jeans and Nike Shox styling","washed purple field jacket, black nylon modular cargo pants and Jordan 4 footwear","cream-and-green technical parka, exaggerated denim and Jordan 5 footwear"]
masks=["fitted dark navy balaclava and smoked ski goggles","oxblood knit ski mask and black technical jacket","charcoal fleece balaclava with natural eye opening","properly fitted black ski goggles and gray rib-knit face covering"]
terms=("Only African-American subjects and extras. Avoid any uncanny or malformed faces, extra features or distorted anatomy. Authentic gravity, fixed garment seams and shoes, no drifting fabric. One continuous original scene at normal speed, no recycled imagery, no slow motion or random cuts. No captions, arbitrary text, title cards, disclaimers, subtitles, watermarks, Cinema Studies or Runner444 text. Approved jersey graphics are physical garment details only. Lip sync is unnecessary. Never imply official Nike, Jordan or Rolex endorsement. No publication.")
count=8
start=db.execute("SELECT COALESCE(MAX(id),0) FROM concepts").fetchone()[0]
output=[]
for i in range(count):
 n=start+i+1
 cat=["spook","buchi","pill","original"][(n-1)%4]
 rnd=random.Random(int(hashlib.sha256(f"r444-new-only-{n}".encode()).hexdigest()[:16],16))
 place,action,cam=rnd.choice(places),rnd.choice(actions),rnd.choice(cameras)
 if cat=="spook":
  lead="exact Spookdakiid-2 identity reference <<<93374667-5679-4f98-b590-65b4319d26b3>>>";wardrobe=rnd.choice(outfits);music="Spook-labeled audio"
 elif cat=="buchi":
  lead="exact Buchi identity reference <<<8080b618-1008-4140-9acd-2bfbb8c40d4d>>>";wardrobe=rnd.choice(outfits);music="Zagg or ZaggZekee-labeled audio"
 elif cat=="pill":
  lead="the established original Pill Money Afro and bald stitched-face characters, warm brown uninterrupted center-seam leather masks without facial openings";wardrobe="existing white/forest-green/gold hockey jersey, crown and ROLEX chest, back TIME IS CURRENCY and 41, sleeve numerals left 28/right 36, unchanged";music="licensed original soundtrack"
 else:
  lead="a new original African-American lead wearing "+rnd.choice(masks);wardrobe=rnd.choice(outfits);music="unlabeled music"
 prompt=f"Produce NEW 480p 9:16 footage: {lead}; {wardrobe}. Location: {place}. Subject {action}. Camera {cam}. Pill Money monogram, if visible, must be genuinely transparent or physically printed/embossed on a real prop, never on a white rectangle. {terms}"
 db.execute("INSERT INTO concepts (id,category,prompt,created_at) VALUES (?,?,?,?)",(n,cat,prompt,datetime.datetime.now(datetime.timezone.utc).isoformat()))
 output.append({"shot_id":f"NEW-{n:06d}","category":cat,"music_rule":music,"prompt":prompt,"generation_status":"NOT_SUBMITTED__FREE_ONLY_GUARD"})
db.commit()
(OUT/"fresh_prompts.json").write_text(json.dumps({"generated_at":datetime.datetime.now(datetime.timezone.utc).isoformat(),"new_briefs":len(output),"credits_spent":0,"actual_videos_generated":0,"why_no_video":"Official Higgsfield external API uses paid credit balance; account Unlimited does not cover it.","concepts":output},indent=2))
print(f"Prepared {len(output)} brand-new briefs; total stored {db.execute('SELECT COUNT(*) FROM concepts').fetchone()[0]}; zero credits spent; no video submissions.")
db.close()
