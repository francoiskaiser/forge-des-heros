"""Construit la PWA : pwa/index.html (français) et pwa/en/index.html (anglais, traduit à la construction)."""
import json, os, subprocess, sys, glob

SRC = 'src/'
FILES = ['data.js', 'data2.js', 'data3.js', 'rules.js', 'app.js', 'adventure.js', 'account.js', 'settings.js', 'homebrew.js', 'phb.js', 'hbio.js', 'bestiary.js', 'combat.js']
css = open(SRC + 'style.css').read()
reset = ":root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}\n"

# dictionnaire anglais fusionné
dict_en = {}
for f in sorted(glob.glob('tools/en/*.json')):
    dict_en.update(json.load(open(f)))
os.makedirs('tools/build', exist_ok=True)
json.dump(dict_en, open('tools/build/en.json', 'w'), ensure_ascii=False)

def js_for(lang):
    parts, missing = [], []
    for f in FILES:
        if lang == 'fr':
            parts.append(open(SRC + f).read())
        else:
            out = 'tools/build/' + f
            r = subprocess.run(['node', 'tools/i18n.js', 'build', 'tools/build/en.json', SRC + f, out], capture_output=True, text=True)
            if r.returncode: sys.exit(r.stderr)
            if r.stderr.strip(): missing += json.loads(r.stderr)
            parts.append(open(out).read())
    js = "\n".join(parts)
    if lang == 'en':
        js = js.replace('const LANG = "fr";', 'const LANG = "en";', 1)
    return js, missing

META = {
    'fr': dict(desc="Créateur de personnages D&D en français (règles 2024) avec fiche interactive et jets de dés.", up="", ),
    'en': dict(desc="D&D character builder for the 2024 rules, with an interactive sheet and dice rolls.", up="../"),
}

# redirection selon la langue préférée (avant tout rendu)
REDIRECT = {
    'fr': """(function(){try{var p=localStorage.getItem("forge-lang");if(p==="en"||(!p&&!/^fr/i.test(navigator.language||"fr"))){location.replace("en/"+location.hash);}}catch(e){}})();""",
    'en': """(function(){try{if(localStorage.getItem("forge-lang")==="fr"){location.replace("../"+location.hash);}}catch(e){}})();""",
}
BANNER = {'fr': ('Nouvelle version de Forge des Héros', 'Recharger'), 'en': ('A new version of Forge des Héros is available', 'Reload')}

def page(lang):
    js, missing = js_for(lang)
    up = META[lang]['up']
    msg, btn = BANNER[lang]
    html = f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Forge des Héros</title>
<meta name="description" content="{META[lang]['desc']}">
<meta name="theme-color" content="#15110e">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Forge">
<script>{REDIRECT[lang]}window.FORGE_PWA=true;</script>
<link rel="manifest" href="{up}manifest.webmanifest">
<link rel="icon" href="{up}icon-192.png">
<link rel="apple-touch-icon" href="{up}apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alegreya+Sans:ital,wght@0,400;0,700;1,400&family=IM+Fell+English+SC&display=swap">
<style>
{reset}{css}
</style>
</head>
<body>
<div id="app"></div>
<div id="overlay"></div>
<div id="rolltoast" aria-live="polite"></div>
<div id="toast" role="status"></div>
<div id="rollbar"></div>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
<script src="{up}firebase-config.js"></script>
<script>
{js}
boot();
if ("serviceWorker" in navigator) {{
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => {{
    if (!hadController || document.querySelector(".update-banner")) return;
    const el = document.createElement("div");
    el.className = "update-banner";
    el.innerHTML = '<span>{msg}</span><button type="button">{btn}</button>';
    el.querySelector("button").addEventListener("click", () => location.reload());
    document.body.appendChild(el);
  }});
  window.addEventListener("load", () => navigator.serviceWorker.register("{up}sw.js").then((r) => r.update()).catch(() => {{}}));
}}
</script>
</body>
</html>
"""
    return html, missing

os.makedirs('pwa/en', exist_ok=True)
# données SRD (bestiaire, objets magiques), chargées à la demande
import shutil
subprocess.run(['node', 'tools/srd/build_srd.js'], check=True)
shutil.copy('tools/srd/out/srd.fr.js', 'pwa/srd.js')
shutil.copy('tools/srd/out/srd.en.js', 'pwa/en/srd.js')
fr, _ = page('fr')
open('pwa/index.html', 'w').write(fr)
en, missing = page('en')
open('pwa/en/index.html', 'w').write(en)
print(len(fr), len(en), 'textes non traduits :', len(set(missing)))
if missing:
    json.dump(sorted(set(missing)), open('tools/build/missing.json', 'w'), ensure_ascii=False, indent=0)
