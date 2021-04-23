ARender ADF plugin 2.0

To replace the default adf-viewer for ADF, replace the following files : 

file-view.component.ts
file-view.component.html

The hostname for ARender needs to be informed in the app.config.json just like ACA,

"arender": {
	"host": "{protocol}//{hostname}:{port}/arender/"
},