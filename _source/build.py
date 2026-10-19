import sys
src='src/'
js=open(src+'data.js').read()+"\n"+open(src+'data2.js').read()+"\n"+open(src+'data3.js').read()+"\n"+open(src+'rules.js').read()+"\n"+open(src+'app.js').read()+"\n"+open(src+'adventure.js').read()+"\n"+open(src+'account.js').read()+"\n"+open(src+'settings.js').read()+"\n"+open(src+'homebrew.js').read()+"\n"+open(src+'bestiary.js').read()+"\n"+open('tools/srd/out/srd.fr.js').read()
css=open(src+'style.css').read()
shell=open(src+'shell.html').read()
out=shell.replace('/*CSS*/',css).replace('/*JS*/',js)
open('dist/index.html','w').write(out)
print(len(out))
