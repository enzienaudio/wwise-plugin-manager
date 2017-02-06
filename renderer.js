require('jquery')
var path = require('path')
var jetpack = require('fs-jetpack')

document.ondragover = document.ondrop = (ev) => {
  ev.preventDefault()
}

// document.body.ondrop = (ev) => {
//   console.log(ev.getElementById("holder1"))

//   let akPluginDir = "/Applications/Audiokinetic/Wwise 2016.1.0.5775/Wwise.app/Contents/SharedSupport/Wwise2016/support/wwise/drive_c/Program Files/Audiokinetic/Wwise/Authoring/Win32/Release/bin/plugins"
//   let droppedFile = ev.dataTransfer.files[0].path

//   if ([".xml", ".dll"].indexOf(path.extname(droppedFile)) >= 0) {
//     let filename = path.basename(droppedFile, path.extname(droppedFile))
//     jetpack.copy(path.dirname(droppedFile), akPluginDir, {
//       matching: [filename + ".xml", filename + ".dll"],
//       overwrite: true})

//     this.refresh()
//   }
//   ev.preventDefault()
// }

exports.ondrop = function(id, path) {

}

exports.refresh = function() {

  if (process.platform === "darwin") {
    var AkDir = '/Applications/Audiokinetic/'
    var wwisePluginPath = "/Wwise.app/Contents/SharedSupport/Wwise2016/support/wwise/drive_c/Program Files/Audiokinetic/Wwise/Authoring/Win32/Release/bin/plugins"
  } else {
    var AkDir = 'C:/Programs/'
    var wwisePluginPath = "Authoring/x64/Release/bin/plugins"
  }

  let wwiseDiv = $("#wwise")
  wwiseDiv.html("")

  $.each(jetpack.list(AkDir), function (i, dirName) {
    if (~dirName.indexOf("Wwise")) {
      let row1 = $("<div class=\"row\"/>")
      row1.append("<div class=\"col\"><h3>" + dirName + "</h3></div>")
      row1.append("<div class=\"dnd-area\" id=\"holder" + i + "\"><div class=\"dnd-text\"> <i class=\"fi-page-copy\" style=\"font-size:25px;\"></i><br>Drop here</div></div>")
      row1.appendTo(wwiseDiv)

      let row2 = $("<div class=\"row\"><h4>Installed Plugins:</h4></div>")
      row2.appendTo(wwiseDiv)

      let row3 = $("<div class=\"row\"/>")
      let app = $("<div class=\"list-group\"/>")

      $.each(jetpack.list(AkDir + dirName + wwisePluginPath), function (i, pluginName) {
        if (~pluginName.indexOf("Hv_") && path.extname(pluginName) === ".dll") {
          let type = (~pluginName.indexOf("Source")) ? " (Source)" : " (FX)"
          app.append("<li class=\"list-group-item\">" + pluginName.split("_")[1] + type + "<a href=\"\"><i class=\"glyphicon-trash pull-right\"></i></a></li>")
        }
      })

      app.appendTo(row3)
      row3.appendTo(wwiseDiv)
    }
  })

  // rebind
  document.getElementById("holder1").addEventListener('drop', (ev) => {
    console.log(ev.dataTransfer.files[0].path)
    ev.preventDefault()
  })

};
