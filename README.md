# ARender ADF plugin 2.0

To use ARender viewer in ADF, adapt the example/file-view/file-view.component.html files to your needs.

## Configuration

The hostname for ARender needs to be informed in the app.config.json just like in ACA,

```json
"arender": {
    "host": "http://localhost:8888/arender",
    "extensions": [
      "pdf","zip", "docx","docm","dotx","dotm","doc","dot","rtf","odt","ott","xlsx","xlsm","xls",
      "xlt","xml","csv","ods","ots", "pptx","pptm","ppt","pps","odp","otp","vsdx","msg","eml","html","htm",
      "txt","dwg","dxf","tif","tiff","dcm","mda","ica","mmr","mca","jpg","jpeg","jpe","jfif","jp2","jpf","jpx",
      "j2k","j2c","jpc","png","gif","webp","bmp"
    ]
  },
```

## Enable document builder

Set arender-viewer property *documentBuilderEnabled* to *true*.

```html
<arender-viewer [documentBuilderEnabled]='true'></arender-viewer>
```
