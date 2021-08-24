# ARender ADF plugin 2.0

To use ARender viewer in ADF, adapt the example/file-view/file-view.component.html files to your needs.

## Configuration

The hostname for ARender needs to be informed in the app.config.json just like in ACA,

```json
"arender": {
  "host": "{protocol}//{hostname}:{port}/arender/"
},
```

## Enable document builder

Set arender-viewer property *documentBuilderEnabled* to *true*.

```html
<arender-viewer [documentBuilderEnabled]='true'></arender-viewer>
```
