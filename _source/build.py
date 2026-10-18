import sys
src='src/'
js=open(src+'data.js').read()+"\n"+open(src+'data2.js').read()+"\n"+open(src+'rules.js').read()+"\n"+open(src+'app.js').read()+"\n"+open(src+'adventure.js').read()+"\n"+open(src+'account.js').read()+"\n"+open(src+'settings.js').read()
css=open(src+'style.css').read()
shell=open(src+'shell.html').read()
out=shell.replace('/*CSS*/',css).replace('/*JS*/',js)
open('dist/index.html','w').write(out)
print(len(out))
